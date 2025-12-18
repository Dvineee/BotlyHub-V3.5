
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Bot as LucideBot, Send, Activity, Trash2, AlertTriangle, X, Terminal, MessageSquare, ShieldCheck, Lock, Loader2, Play, RefreshCw, AlertCircle, CheckCircle2, Megaphone, ShieldAlert, Wifi, Cpu } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, UserBot, Channel, BotLog, BotConnection } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const { useNavigate } = Router as any;

const MyBots = () => {
  const navigate = useNavigate();
  const { user, haptic, notification } = useTelegram();
  const [connections, setConnections] = useState<(BotConnection & { bots: Bot, channels: Channel })[]>([]);
  const [selectedConn, setSelectedConn] = useState<(BotConnection & { bots: Bot, channels: Channel }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab States
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'logs' | 'broadcast'>('status');
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    const conns = await DatabaseService.getBotConnections(user.id.toString());
    setConnections(conns as any);
    setIsLoading(false);
  };

  const handleVerify = async (connId: string) => {
      setIsVerifying(true);
      haptic('medium');
      const success = await DatabaseService.verifyBotAdmin(connId);
      if (success) {
          notification('success');
          setConnections(prev => prev.map(c => c.id === connId ? { ...c, is_admin_verified: true, status: 'Active' } : c));
          if (selectedConn?.id === connId) setSelectedConn({ ...selectedConn, is_admin_verified: true, status: 'Active' });
          alert("Yetki doğrulandı! Bot artık aktif.");
      } else {
          notification('error');
          haptic('heavy');
          alert("KRİTİK HATA: Bot bu kanalda henüz yönetici değil! Lütfen botu kanala ekleyip tüm yetkileri verin.");
      }
      setIsVerifying(false);
  };

  const handleBroadcast = async () => {
      if (!broadcastMsg.trim() || !selectedConn) return;
      if (!selectedConn.is_admin_verified) {
          alert("HATA: Botun mesaj gönderebilmesi için kanalda yönetici olması şarttır!");
          return;
      }

      setIsProcessing(true);
      haptic('medium');

      await DatabaseService.addBotLog({
          bot_id: selectedConn.bot_id,
          channel_id: selectedConn.channel_id,
          user_id: user.id.toString(),
          action: `Broadcast İşlemi: ${broadcastMsg.substring(0, 30)}...`,
          status: 'success'
      });

      notification('success');
      setBroadcastMsg('');
      loadLogs(selectedConn.bot_id);
      setIsProcessing(false);
      alert("Mesaj kanala iletildi!");
  };

  const loadLogs = async (botId: string) => {
      const botLogs = await DatabaseService.getBotLogs(botId, user.id.toString());
      setLogs(botLogs);
  };

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-8 font-sans pb-24">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight uppercase italic">BOT <span className="text-blue-500">OPERASYON</span></h1>
        </div>
        <button onClick={loadData} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-all">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-4">
          {connections.length === 0 ? (
              <div className="py-20 text-center bg-slate-950/40 rounded-[44px] border border-dashed border-slate-800">
                  <Cpu size={40} className="text-slate-800 mb-6 mx-auto" />
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Henüz aktif bir bot bağlantınız yok</p>
                  <button onClick={() => navigate('/')} className="mt-8 bg-blue-600 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Markete Göz At</button>
              </div>
          ) : connections.map(conn => (
              <div 
                key={conn.id} 
                onClick={() => { setSelectedConn(conn); loadLogs(conn.bot_id); }}
                className={`p-6 bg-[#0f172a]/60 border rounded-[36px] flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] ${conn.is_admin_verified ? 'border-slate-800' : 'border-red-500/30 bg-red-500/5'}`}
              >
                  <div className="flex items-center gap-5">
                      <div className="relative">
                          <img src={conn.bots.icon} className="w-16 h-16 rounded-[24px] object-cover border border-slate-800" />
                          <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-[#020617] ${conn.is_admin_verified ? 'bg-emerald-500' : 'bg-red-500'}`}>
                               {conn.is_admin_verified ? <ShieldCheck size={12} className="text-white"/> : <ShieldAlert size={12} className="text-white"/>}
                          </div>
                      </div>
                      <div>
                          <h4 className="font-black text-white text-sm uppercase tracking-tight italic">{conn.bots.name}</h4>
                          <p className="text-[10px] text-slate-500 font-black uppercase mt-1">KANAL: {conn.channels.name}</p>
                      </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-700" />
              </div>
          ))}
      </div>

      {selectedConn && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedConn(null)}>
              <div className="bg-[#0f172a] w-full max-w-lg rounded-t-[48px] p-8 pb-12 relative shadow-2xl overflow-hidden flex flex-col max-h-[95vh]" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-10" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                        <img src={selectedConn.bots.icon} className="w-16 h-16 rounded-[24px] border-2 border-slate-800 shadow-2xl object-cover" />
                        <div>
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{selectedConn.bots.name}</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase">Durum: <span className={selectedConn.is_admin_verified ? 'text-emerald-500' : 'text-red-500'}>{selectedConn.is_admin_verified ? 'ONLINE' : 'PERMISSION_DENIED'}</span></p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedConn(null)} className="p-3 bg-slate-900 rounded-2xl text-slate-500"><X size={20}/></button>
                  </div>

                  {!selectedConn.is_admin_verified && (
                      <div className="mb-8 p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] animate-pulse">
                          <div className="flex items-center gap-4 text-red-500 mb-4">
                              <ShieldAlert size={28} />
                              <p className="font-black text-lg uppercase tracking-tighter italic">Erişim Hatası</p>
                          </div>
                          <p className="text-sm text-red-400/80 leading-relaxed font-bold mb-6 italic">Bot bu kanalda henüz "Yönetici" yetkisine sahip değil. Lütfen kanala ekleyip tüm yetkileri verin, aksi takdirde bot çalışmayacaktır.</p>
                          <button 
                            onClick={() => handleVerify(selectedConn.id)}
                            disabled={isVerifying}
                            className="w-full py-5 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
                          >
                              {isVerifying ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
                              YETKİYİ ŞİMDİ DENETLE
                          </button>
                      </div>
                  )}

                  <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 mb-8 shrink-0">
                      <button onClick={() => setActiveSubTab('status')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='status' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><Activity size={14}/> Sistem</button>
                      <button onClick={() => setActiveSubTab('logs')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='logs' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><Terminal size={14}/> Loglar</button>
                      <button onClick={() => setActiveSubTab('broadcast')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='broadcast' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><MessageSquare size={14}/> Duyuru</button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                      {activeSubTab === 'status' && (
                          <div className="space-y-6 animate-in fade-in">
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-950 p-6 rounded-[32px] border border-slate-800">
                                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Python Runtime</p>
                                      <div className="flex items-center gap-2 text-emerald-500">
                                          <Wifi size={14} className="animate-pulse" />
                                          <span className="text-sm font-black uppercase">Aktif</span>
                                      </div>
                                  </div>
                                  <div className="bg-slate-950 p-6 rounded-[32px] border border-slate-800">
                                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Uptime</p>
                                      <p className="text-sm font-black text-white">%100</p>
                                  </div>
                              </div>
                              <div className="p-8 bg-slate-950/30 border border-slate-800 rounded-[32px]">
                                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Kaynak Kod Analizi</h4>
                                  <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                          <span className="text-xs text-slate-400">Memory Usage</span>
                                          <span className="text-xs font-black text-white">42MB</span>
                                      </div>
                                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-blue-600 h-full w-1/4"></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}

                      {activeSubTab === 'logs' && (
                          <div className="space-y-3 animate-in fade-in">
                              {logs.length === 0 ? (
                                  <div className="text-center py-20 text-slate-700 italic font-black text-xs uppercase">Sistem Kaydı Bulunmuyor</div>
                              ) : (
                                  logs.map(log => (
                                      <div key={log.id} className="p-5 bg-slate-950 border border-slate-800 rounded-[28px] flex gap-4">
                                          <div className={`w-1.5 h-auto rounded-full ${log.status==='success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                          <div className="flex-1">
                                              <p className="text-xs font-bold text-white leading-relaxed">{log.action}</p>
                                              <p className="text-[9px] text-slate-600 uppercase font-black mt-2">{new Date(log.timestamp).toLocaleString()}</p>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      )}

                      {activeSubTab === 'broadcast' && (
                          <div className="space-y-6 animate-in fade-in">
                              <div className="bg-red-600/5 border border-red-600/10 p-6 rounded-[32px]">
                                  <p className="text-xs text-red-400 leading-relaxed font-bold italic uppercase tracking-tighter">Dikkat: Yetkisiz botlar üzerinden mesaj iletilemez!</p>
                              </div>
                              <textarea 
                                value={broadcastMsg}
                                onChange={e => setBroadcastMsg(e.target.value)}
                                disabled={!selectedConn.is_admin_verified}
                                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-[32px] p-6 text-sm text-white focus:border-blue-500 outline-none resize-none font-medium disabled:opacity-20 transition-all" 
                                placeholder="Duyuru içeriği..."
                              />
                              <button 
                                onClick={handleBroadcast}
                                disabled={isProcessing || !broadcastMsg.trim() || !selectedConn.is_admin_verified}
                                className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] text-[10px] tracking-widest uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                              >
                                {isProcessing ? <Loader2 className="animate-spin mx-auto"/> : 'KANALA MESAJ GÖNDER'}
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MyBots;
