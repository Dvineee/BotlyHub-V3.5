
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Bot as LucideBot, Send, Activity, Trash2, AlertTriangle, X, Terminal, MessageSquare, ShieldCheck, Lock, Loader2, Play, RefreshCw, AlertCircle, CheckCircle2, Megaphone, ShieldAlert, Wifi, Cpu, Square } from 'lucide-react';
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
          loadData();
          alert("Yetki doğrulandı! Bot artık hazır.");
      } else {
          notification('error');
          haptic('heavy');
          alert("KRİTİK HATA: Bot bu kanalda henüz yönetici değil!");
      }
      setIsVerifying(false);
  };

  const toggleBotRuntime = async (conn: any) => {
      haptic('medium');
      setIsProcessing(true);
      const nextStatus = conn.status === 'Active' ? 'Stopped' : 'Active';
      
      await DatabaseService.updateConnectionStatus(conn.id, nextStatus);
      
      await DatabaseService.addBotLog({
          bot_id: conn.bot_id,
          channel_id: conn.channel_id,
          user_id: user.id.toString(),
          action: nextStatus === 'Active' ? 'Bot başlatıldı.' : 'Bot durduruldu.',
          status: nextStatus === 'Active' ? 'success' : 'info'
      });

      notification('success');
      setSelectedConn({ ...conn, status: nextStatus });
      loadData();
      loadLogs(conn.bot_id);
      setIsProcessing(false);
  };

  const handleBroadcast = async () => {
      if (!broadcastMsg.trim() || !selectedConn) return;
      setIsProcessing(true);
      haptic('medium');

      await DatabaseService.addBotLog({
          bot_id: selectedConn.bot_id,
          channel_id: selectedConn.channel_id,
          user_id: user.id.toString(),
          action: `Duyuru gönderildi: ${broadcastMsg.substring(0, 20)}...`,
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
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Aktif bağlantı yok</p>
                  <button onClick={() => navigate('/')} className="mt-8 bg-blue-600 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl transition-all">Markete Git</button>
              </div>
          ) : connections.map(conn => (
              <div 
                key={conn.id} 
                onClick={() => { setSelectedConn(conn); loadLogs(conn.bot_id); }}
                className={`p-6 bg-[#0f172a]/60 border rounded-[36px] flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] ${conn.status === 'Active' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800'}`}
              >
                  <div className="flex items-center gap-5">
                      <div className="relative">
                          <img src={conn.bots.icon} className="w-16 h-16 rounded-[24px] object-cover border border-slate-800" />
                          <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border-2 border-[#020617] ${conn.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}>
                               <Activity size={12} className="text-white"/>
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
                            <p className="text-[10px] font-black text-slate-500 uppercase">Durum: <span className={selectedConn.status === 'Active' ? 'text-emerald-500' : 'text-slate-500'}>{selectedConn.status === 'Active' ? 'ÇALIŞIYOR' : 'DURDURULDU'}</span></p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedConn(null)} className="p-3 bg-slate-900 rounded-2xl text-slate-500"><X size={20}/></button>
                  </div>

                  {selectedConn.is_admin_verified ? (
                      <div className="grid grid-cols-2 gap-4 mb-8">
                          <button 
                            onClick={() => toggleBotRuntime(selectedConn)}
                            disabled={isProcessing}
                            className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${selectedConn.status === 'Active' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}
                          >
                            {isProcessing ? <Loader2 size={16} className="animate-spin"/> : (selectedConn.status === 'Active' ? <Square size={16}/> : <Play size={16}/>)}
                            {selectedConn.status === 'Active' ? 'BOTU DURDUR' : 'BOTU BAŞLAT'}
                          </button>
                          <button onClick={() => setActiveSubTab('broadcast')} className="py-5 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                              <Megaphone size={16}/> DUYURU AT
                          </button>
                      </div>
                  ) : (
                      <div className="mb-8 p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] animate-pulse">
                          <div className="flex items-center gap-4 text-red-500 mb-4">
                              <ShieldAlert size={28} />
                              <p className="font-black text-lg uppercase tracking-tighter italic">Erişim Hatası</p>
                          </div>
                          <p className="text-sm text-red-400/80 leading-relaxed font-bold mb-6 italic">Botun çalışması için yönetici yetkisi doğrulanamadı.</p>
                          <button 
                            onClick={() => handleVerify(selectedConn.id)}
                            disabled={isVerifying}
                            className="w-full py-5 bg-red-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                              {isVerifying ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
                              ŞİMDİ DOĞRULA
                          </button>
                      </div>
                  )}

                  <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 mb-8 shrink-0">
                      <button onClick={() => setActiveSubTab('status')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='status' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><Activity size={14}/> Bilgi</button>
                      <button onClick={() => setActiveSubTab('logs')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='logs' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><Terminal size={14}/> Loglar</button>
                      <button onClick={() => setActiveSubTab('broadcast')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='broadcast' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><MessageSquare size={14}/> Duyuru</button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                      {activeSubTab === 'status' && (
                          <div className="space-y-6 animate-in fade-in">
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-950 p-6 rounded-[32px] border border-slate-800">
                                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Çalışma Durumu</p>
                                      <div className={`flex items-center gap-2 ${selectedConn.status === 'Active' ? 'text-emerald-500' : 'text-slate-500'}`}>
                                          <Wifi size={14} className={selectedConn.status === 'Active' ? 'animate-pulse' : ''} />
                                          <span className="text-sm font-black uppercase">{selectedConn.status === 'Active' ? 'ONLINE' : 'OFFLINE'}</span>
                                      </div>
                                  </div>
                                  <div className="bg-slate-950 p-6 rounded-[32px] border border-slate-800">
                                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Uptime Verimliliği</p>
                                      <p className="text-sm font-black text-white">{selectedConn.status === 'Active' ? '%100' : '%0'}</p>
                                  </div>
                              </div>
                              <div className="p-8 bg-slate-950/30 border border-slate-800 rounded-[32px]">
                                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Teknik Detaylar</h4>
                                  <div className="space-y-3">
                                      <div className="flex justify-between"><span className="text-xs text-slate-500">Instance Type</span><span className="text-xs font-bold text-white uppercase tracking-tighter">Python 3.10 Polling</span></div>
                                      <div className="flex justify-between"><span className="text-xs text-slate-500">Node ID</span><span className="text-xs font-bold text-white">DE-FRA-01</span></div>
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
                                          <div className={`w-1.5 h-auto rounded-full ${log.status==='success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
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
                              <textarea 
                                value={broadcastMsg}
                                onChange={e => setBroadcastMsg(e.target.value)}
                                disabled={selectedConn.status !== 'Active'}
                                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-[32px] p-6 text-sm text-white focus:border-blue-500 outline-none resize-none font-medium disabled:opacity-20 transition-all" 
                                placeholder="Kanala gönderilecek mesaj..."
                              />
                              <button 
                                onClick={handleBroadcast}
                                disabled={isProcessing || !broadcastMsg.trim() || selectedConn.status !== 'Active'}
                                className="w-full py-6 bg-blue-600 text-white font-black rounded-[32px] text-[10px] tracking-widest uppercase shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                              >
                                {isProcessing ? <Loader2 className="animate-spin mx-auto"/> : 'ŞİMDİ GÖNDER'}
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
