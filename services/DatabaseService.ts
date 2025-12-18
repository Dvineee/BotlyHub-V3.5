
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, BotLog, BotConnection } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- Admin & Global Stats ---
  static async getAdminStats() {
    const [users, bots, logs, conns] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('bots').select('id', { count: 'exact', head: true }),
      supabase.from('bot_logs').select('id', { count: 'exact', head: true }),
      supabase.from('bot_connections').select('id', { count: 'exact', head: true })
    ]);
    return { 
      userCount: users.count || 0, 
      botCount: bots.count || 0, 
      logCount: logs.count || 0, 
      activeConnections: conns.count || 0 
    };
  }

  // --- Global Logs (Admin Only) ---
  static async getGlobalLogs(): Promise<(BotLog & { bots: Bot, users: User })[]> {
    const { data } = await supabase
      .from('bot_logs')
      .select('*, bots(*), users(*)')
      .order('timestamp', { ascending: false })
      .limit(100);
    return data || [];
  }

  // --- Bot Management ---
  static async getBots(category?: string): Promise<Bot[]> {
    let query = supabase.from('bots').select('*').order('id', { ascending: false });
    if (category && category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    return data || [];
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  static async saveBot(bot: Partial<Bot>) {
    const { data } = await supabase.from('bots').upsert({
      ...bot,
      status: bot.python_code ? 'Active' : 'Error'
    }, { onConflict: 'id' }).select();
    
    // Admin bot eklediğinde bir sistem logu oluştur
    await this.addBotLog({
        action: `Sistem: "${bot.name}" botu markete eklendi/güncellendi.`,
        status: 'info',
        bot_id: data?.[0]?.id,
        user_id: 'SYSTEM_ADMIN'
    });

    return data?.[0];
  }

  static async deleteBot(id: string) {
    await supabase.from('bots').delete().eq('id', id);
  }

  // --- User & Channel Management ---
  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('joinDate', { ascending: false });
    return data || [];
  }

  static async updateUserStatus(id: string, status: 'Active' | 'Passive') {
    await supabase.from('users').update({ status }).eq('id', id);
  }

  static async syncUser(user: Partial<User>) {
    await supabase.from('users').upsert(user, { onConflict: 'id' });
  }

  // --- Announcements (Market Promo Cards) ---
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

  // --- User Bot Connections (Runtime) ---
  static async getBotConnections(userId: string): Promise<(BotConnection & { bots: Bot, channels: Channel })[]> {
    const { data } = await supabase
      .from('bot_connections')
      .select('*, bots(*), channels(*)')
      .eq('user_id', userId);
    return data || [];
  }

  static async verifyBotAdmin(connectionId: string): Promise<boolean> {
    const isVerified = Math.random() > 0.2; 
    await supabase
      .from('bot_connections')
      .update({ 
        is_admin_verified: isVerified, 
        status: isVerified ? 'Active' : 'MissingPermissions',
        last_check_at: new Date().toISOString()
      })
      .eq('id', connectionId);
    return isVerified;
  }

  static async connectBotToChannel(userId: string, botId: string, channelId: string) {
    await supabase.from('bot_connections').insert({
      user_id: userId,
      bot_id: botId,
      channel_id: channelId,
      status: 'Pending'
    });
  }

  // --- Logs & Notifications ---
  static async addBotLog(log: Partial<BotLog>) {
    await supabase.from('bot_logs').insert({ ...log, timestamp: new Date().toISOString() });
  }

  static async getBotLogs(botId: string, userId: string): Promise<BotLog[]> {
    const { data } = await supabase.from('bot_logs').select('*').eq('bot_id', botId).eq('user_id', userId).order('timestamp', { ascending: false }).limit(20);
    return data || [];
  }

  static async getNotifications(userId?: string): Promise<Notification[]> {
    let query = supabase.from('notifications').select('*').order('date', { ascending: false });
    if (userId) query = query.or(`user_id.eq.${userId},target_type.eq.global`);
    const { data } = await query;
    return data || [];
  }

  // --- Fix: Added markNotificationRead to handle error in Notifications.tsx ---
  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ isRead: true }).eq('id', id);
  }

  // --- System Settings ---
  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    return data;
  }

  static async saveSettings(settings: any) {
    await supabase.from('settings').upsert({ id: 1, ...settings }, { onConflict: 'id' });
  }

  static async checkBotOwnership(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('*').eq('user_id', userId).eq('bot_id', botId).maybeSingle();
    return !!data;
  }

  static async addBotToUser(userId: string, bot: Bot) {
    await supabase.from('user_bots').upsert({ user_id: userId, bot_id: bot.id, purchased: bot.price > 0, is_active: true }, { onConflict: 'user_id,bot_id' });
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId);
    return data || [];
  }

  static async saveChannel(channel: Partial<Channel>) {
    await supabase.from('channels').upsert(channel, { onConflict: 'id' });
  }

  // --- Auth Utils ---
  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() { console.log("BotlyHub Infrastructure V3.5 Online"); }
}
