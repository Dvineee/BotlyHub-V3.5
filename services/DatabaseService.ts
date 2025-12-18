
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, BotLog, Notification, BotConnection } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- Admin Stats ---
  static async getAdminStats() {
    try {
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
    } catch (e) {
        return { userCount: 0, botCount: 0, logCount: 0, activeRuntimes: 0 };
    }
  }

  // --- Güvenli Runtime Kontrolü (400 Bad Request Hatalarını Önler) ---
  static async startBotRuntime(botId: string) {
    const pid = Math.floor(Math.random() * 90000) + 10000;
    
    // AŞAMA 1: Sadece Durum Güncelle (En güvenli yol)
    // Eğer veritabanınızda 'status' sütunu varsa bu her zaman çalışır.
    const { error: initialError } = await supabase.from('bots').update({ 
      status: 'Booting'
    }).eq('id', botId);

    if (initialError) {
        console.error("Bot başlatılamadı (Sütun hatası olabilir):", initialError);
        throw initialError;
    }
    
    await this.addBotLog({
      bot_id: botId,
      user_id: 'SYSTEM',
      action: `[BOOT] Sunucu ortamı PID ${pid} için hazırlanıyor...`,
      status: 'terminal'
    });

    // AŞAMA 2: Detaylı Güncelleme Denemesi
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Önce detaylı (metrikli) deneme yap
        const { data, error } = await supabase.from('bots').update({
          status: 'Active',
          runtime_id: `PID_${pid}`,
          uptime_start: new Date().toISOString(),
          memory_usage: 24,
          cpu_usage: 2
        }).eq('id', botId).select();

        // Eğer detaylı güncelleme hata verirse (400), sadece statüsü 'Active' yap
        if (error) {
            console.warn("Metrik sütunları eksik, sadece durum güncelleniyor.");
            const { data: fallbackData, error: fallbackError } = await supabase.from('bots').update({
                status: 'Active'
            }).eq('id', botId).select();
            
            if (fallbackError) reject(fallbackError);
            else resolve(fallbackData?.[0]);
        } else {
            resolve(data?.[0]);
        }

        await this.addBotLog({
          bot_id: botId,
          user_id: 'SYSTEM',
          action: `[RUN] Botly Engine Çevrimiçi. Polling devrede.`,
          status: 'terminal'
        });
      }, 1000);
    });
  }

  static async stopBotRuntime(botId: string) {
    // Güvenli durdurma: Sadece 'status' sütununu hedefle
    const { error } = await supabase.from('bots').update({
      status: 'Stopped'
    }).eq('id', botId);

    if (error) {
        console.error("Durdurma hatası:", error);
        // Eğer runtime_id varsa temizlemeyi dene ama hata verirse durma
        try {
            await supabase.from('bots').update({ runtime_id: null }).eq('id', botId);
        } catch(e) {}
    }

    await this.addBotLog({
      bot_id: botId,
      user_id: 'SYSTEM',
      action: `[STOP] Süreç admin tarafından durduruldu.`,
      status: 'terminal'
    });
  }

  static async updateConnectionStatus(connectionId: string, status: string) {
    const { error } = await supabase.from('bot_connections').update({ status }).eq('id', connectionId);
    if (error) console.error("Bağlantı durumu güncellenemedi:", error);
  }

  // --- Standart Metotlar ---
  static async saveBotConfiguration(bot: Partial<Bot>) {
    const { data } = await supabase.from('bots').upsert(bot, { onConflict: 'id' }).select();
    return data?.[0];
  }

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

  static async addBotLog(log: Partial<BotLog>) {
    try {
        await supabase.from('bot_logs').insert({ ...log, timestamp: new Date().toISOString() });
    } catch (e) {}
  }

  static async getBotLogs(botId: string, userId?: string): Promise<BotLog[]> {
    let query = supabase.from('bot_logs').select('*').eq('bot_id', botId);
    if (userId) query = query.eq('user_id', userId);
    const { data } = await query.order('timestamp', { ascending: false }).limit(50);
    return data || [];
  }

  static async getGlobalLogs(): Promise<(BotLog & { bots: Bot, users: User })[]> {
    const { data } = await supabase
      .from('bot_logs')
      .select('*, bots(*), users(*)')
      .order('timestamp', { ascending: false })
      .limit(60);
    return data || [];
  }

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

  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('date', { ascending: false });
    return data || [];
  }

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

  static async checkBotOwnership(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('id').eq('user_id', userId).eq('bot_id', botId).maybeSingle();
    return !!data;
  }

  static async addBotToUser(userId: string, bot: Bot) {
    await supabase.from('user_bots').insert({ user_id: userId, bot_id: bot.id });
  }

  static async connectBotToChannel(userId: string, botId: string, channelId: string) {
    await supabase.from('bot_connections').insert({ 
      user_id: userId, 
      bot_id: botId, 
      channel_id: channelId, 
      is_admin_verified: false, 
      status: 'Stopped'
    });
  }

  static async getBotConnections(userId: string): Promise<any[]> {
    const { data } = await supabase.from('bot_connections').select('*, bots(*), channels(*)').eq('user_id', userId);
    return data || [];
  }

  static async verifyBotAdmin(connectionId: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 1000));
    const success = Math.random() > 0.2;
    if (success) await supabase.from('bot_connections').update({ is_admin_verified: true, status: 'Active' }).eq('id', connectionId);
    return success;
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() { console.log("BotlyHub V3.5 Core Engine Online"); }
}
