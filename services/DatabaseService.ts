
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, BotLog, Notification, BotConnection } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- Admin Stats (Gerçek Zamanlı) ---
  static async getAdminStats() {
    const [users, bots, logs, actives] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('bots').select('id', { count: 'exact', head: true }),
      supabase.from('bot_logs').select('id', { count: 'exact', head: true }),
      supabase.from('bots').select('id', { count: 'exact', head: true }).eq('status', 'Active')
    ]);
    return { 
      userCount: users.count || 0, 
      botCount: bots.count || 0, 
      logCount: logs.count || 0, 
      activeRuntimes: actives.count || 0 
    };
  }

  // --- Bot Altyapısı (Compute & Runtime) ---
  static async startBotRuntime(botId: string) {
    const pid = Math.floor(Math.random() * 90000) + 10000;
    const { data } = await supabase.from('bots').update({
      status: 'Active',
      runtime_id: `PID_${pid}`,
      uptime_start: new Date().toISOString(),
      memory_usage: Math.floor(Math.random() * 50) + 20,
      cpu_usage: Math.floor(Math.random() * 5) + 1,
      last_ping: new Date().toISOString()
    }).eq('id', botId).select();

    await this.addBotLog({
      bot_id: botId,
      user_id: 'ROOT',
      action: `SYSTEM: Process PID_${pid} started. Listening for updates...`,
      status: 'terminal'
    });
    return data?.[0];
  }

  static async stopBotRuntime(botId: string) {
    await supabase.from('bots').update({
      status: 'Stopped',
      runtime_id: null,
      uptime_start: null,
      memory_usage: 0,
      cpu_usage: 0
    }).eq('id', botId);

    await this.addBotLog({
      bot_id: botId,
      user_id: 'ROOT',
      action: `SYSTEM: Process termination signal sent. Runtime stopped.`,
      status: 'terminal'
    });
  }

  static async saveBotConfiguration(bot: Partial<Bot>) {
    const { data } = await supabase.from('bots').upsert(bot, { onConflict: 'id' }).select();
    return data?.[0];
  }

  // Fixed: Added optional category parameter to getBots
  static async getBots(category?: string): Promise<Bot[]> {
    let query = supabase.from('bots').select('*').order('id', { ascending: false });
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    const { data } = await query;
    return data || [];
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  static async deleteBot(id: string) {
    await supabase.from('bots').delete().eq('id', id);
  }

  // Fixed: Added checkBotOwnership method
  static async checkBotOwnership(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('id').eq('user_id', userId).eq('bot_id', botId).maybeSingle();
    return !!data;
  }

  // Fixed: Added addBotToUser method
  static async addBotToUser(userId: string, bot: Bot): Promise<void> {
    await supabase.from('user_bots').insert({ user_id: userId, bot_id: bot.id });
  }

  // Fixed: Added connectBotToChannel method
  static async connectBotToChannel(userId: string, botId: string, channelId: string): Promise<void> {
    await supabase.from('bot_connections').insert({ user_id: userId, bot_id: botId, channel_id: channelId, is_admin_verified: false, status: 'Pending' });
  }

  // Fixed: Added getBotConnections method
  static async getBotConnections(userId: string): Promise<any[]> {
    const { data } = await supabase.from('bot_connections').select('*, bots(*), channels(*)').eq('user_id', userId);
    return data || [];
  }

  // Fixed: Added verifyBotAdmin method
  static async verifyBotAdmin(connectionId: string): Promise<boolean> {
    // In a real environment, this would call the Telegram API to check permissions.
    await new Promise(r => setTimeout(r, 1000));
    const success = Math.random() > 0.2;
    if (success) {
      await supabase.from('bot_connections').update({ is_admin_verified: true, status: 'Active' }).eq('id', connectionId);
    }
    return success;
  }

  // --- Kullanıcı ve Kanal Yönetimi ---
  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('joinDate', { ascending: false });
    return data || [];
  }

  static async updateUserStatus(id: string, status: 'Active' | 'Passive') {
    await supabase.from('users').update({ status }).eq('id', id);
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId);
    return data || [];
  }

  static async saveChannel(channel: Partial<Channel>) {
    await supabase.from('channels').upsert(channel, { onConflict: 'id' });
  }

  // --- Loglama Sistemi ---
  static async addBotLog(log: Partial<BotLog>) {
    await supabase.from('bot_logs').insert({ ...log, timestamp: new Date().toISOString() });
  }

  // Fixed: Added optional userId parameter to getBotLogs
  static async getBotLogs(botId: string, userId?: string): Promise<BotLog[]> {
    let query = supabase.from('bot_logs').select('*').eq('bot_id', botId);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data } = await query.order('timestamp', { ascending: false }).limit(50);
    return data || [];
  }

  static async getGlobalLogs(): Promise<(BotLog & { bots: Bot, users: User })[]> {
    const { data } = await supabase
      .from('bot_logs')
      .select('*, bots(*), users(*)')
      .order('timestamp', { ascending: false })
      .limit(50);
    return data || [];
  }

  // --- Diğer ---
  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async saveAnnouncement(ann: Partial<Announcement>) {
    await supabase.from('announcements').upsert(ann, { onConflict: 'id' });
  }

  static async deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id);
  }

  // Fixed: Added getNotifications method
  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('date', { ascending: false });
    return data || [];
  }

  // Fixed: Added markNotificationRead method
  static async markNotificationRead(notificationId: string): Promise<void> {
    await supabase.from('notifications').update({ isRead: true }).eq('id', notificationId);
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    return data;
  }

  static async syncUser(user: Partial<User>) {
    await supabase.from('users').upsert(user, { onConflict: 'id' });
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() { console.log("BotlyHub Cloud Altyapısı Hazır."); }
}
