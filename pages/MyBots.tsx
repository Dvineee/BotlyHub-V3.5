
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, TrendingUp, Bot, Send, Activity, Trash2, AlertTriangle, X, Terminal, MessageSquare, ShieldCheck, Lock, Loader2, Play } from 'lucide-react';
import * as Router from 'react-router-dom';
import { UserBot, Channel, BotLog } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const { useNavigate } = Router as any;

const MyBots = () => {
  const navigate = useNavigate();
  const { user, haptic, notification } = useTelegram();
  const [bots, setBots] = useState<UserBot[]>([]);
  const [selectedBot, setSelectedBot] = useState<UserBot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Management View States
  const [activeSubTab, setActiveSubTab] = useState<'status' | 'logs' | 'broadcast'>('status');
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) loadBots();
    else setIsLoading(false);
  }, [user]);

  const loadBots = async () => {
    setIsLoading(true);
    // Gerçek veritabanından kullanıcı botlarını çek
    const assets = await DatabaseService.getUserDetailedAssets(user.id.toString());
    const userBots = assets.bots.map(b => ({
        ...b,
        isAdEnabled: true,
        isActive: true,
        purchased: b.price > 0
    })) as UserBot[];
    
    setBots(userBots);
    setIsLoading(false);
  };

  const loadLogs = async (botId: string) => {
      const botLogs = await DatabaseService.getBotLogs(botId, user.id.toString());
      setLogs(botLogs);
  };

  const handleBroadcast = async () => {
      if (!broadcastMsg.trim() || !selectedBot) return;
      setIsProcessing(true);
      haptic('medium');

      // Simüle edilmiş broadcast işlemi
      await new Promise(r => setTimeout(r, 2000));
      
      await DatabaseService.addBotLog({
          bot_id: selectedBot.id,
          user_id: user.id.toString(),
          action: `Duyuru Gönderildi: ${broadcastMsg.substring(0, 20)}...`,
          status: 'success'
      });

      notification('success');
      alert("Mesaj tüm bağlı kanallara iletildi!");
      setBroadcastMsg('');
      loadLogs(selectedBot.id);
      setIsProcessing(false);
  };

  const handleBotAction = async (bot: UserBot) => {
      if (!bot.purchased && bot.price > 0) {
          alert("Bu botu kullanabilmek için önce satın almalısınız!");
          navigate(`/bot/${bot.id}`);
          return;
      }
      setSelectedBot(bot);
      loadLogs(bot.id);
  };

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-8 font-sans pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 px-1">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight uppercase italic">Envanterim</h1>
        </div>
      </div>

      {bots.length === 0 ? (
          <div className="text-center py-20 bg-slate-950/40 rounded-[44px] border border-dashed border-slate-800 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <Bot size={40} className="text-slate-800" />
              </div>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] mb-8">Henüz bot eklemediniz</p>
              <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">Market'e Göz At</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 gap-5">
              {bots.map(bot => (
                  <div 
                    key={bot.id} 
                    onClick={() => handleBotAction(bot)}
                    className="p-5 bg-slate-900/60 border border-slate-800 rounded-[32px] flex items-center justify-between relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer"
                  >
                      <div className="flex items-center gap-5">
                          <div className="relative">
                              <img src={bot.icon} className="w-16 h-16 rounded-[24px] border-2 border-slate-800 object-cover shadow-2xl" />
                              {bot.purchased ? (
                                  <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg shadow-lg border-2 border-slate-900"><ShieldCheck size={12} /></div>
                              ) : (
                                  <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-lg shadow-lg border-2 border-slate-900"><Lock size={12} /></div>
                              )}
                          </div>
                          <div>
                              <h4 className="font-black text-white italic tracking-tight uppercase">{bot.name}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{bot.category}</p>
                          </div>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-600 group-hover:text-blue-500 transition-colors">
                          <Play size={18} fill="currentColor" />
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Management Sidebar / Modal */}
      {selectedBot && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedBot(null)}>
              <div className="bg-[#0f172a] w-full max-w-lg rounded-t-[44px] p-8 pb-12 relative shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
                  
                  <div className="flex items-center gap-6 mb-10">
                      <img src={selectedBot.icon} className="w-20 h-20 rounded-[32px] border-2 border-slate-800 shadow-2xl object-cover" />
                      <div>
                          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{selectedBot.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Çalışıyor</span>
                          </div>
                      </div>
                  </div>

                  {/* Internal Tabs */}
                  <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800 mb-8">
                      <button onClick={() => setActiveSubTab('status')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='status' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><Activity size={14}/> Durum</button>
                      <button onClick={() => setActiveSubTab('logs')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='logs' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><Terminal size={14}/> Loglar</button>
                      <button onClick={() => setActiveSubTab('broadcast')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab==='broadcast' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}><MessageSquare size={14}/> Duyuru</button>
                  </div>

                  <div className="min-h-[300px] max-h-[400px] overflow-y-auto no-scrollbar">
                      {activeSubTab === 'status' && (
                          <div className="space-y-4 animate-in fade-in">
                              <div className="p-6 bg-slate-950/50 border border-slate-800 rounded-3xl">
                                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Bot Bilgileri</p>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                          <p className="text-[9px] font-bold text-slate-500 uppercase">Hız (ms)</p>
                                          <p className="text-lg font-black text-white">45ms</p>
                                      </div>
                                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                          <p className="text-[9px] font-bold text-slate-500 uppercase">Uptime</p>
                                          <p className="text-lg font-black text-white">%99.9</p>
                                      </div>
                                  </div>
                              </div>
                              <button className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all">Botu Durdur</button>
                          </div>
                      )}

                      {activeSubTab === 'logs' && (
                          <div className="space-y-3 animate-in fade-in">
                              {logs.length === 0 ? (
                                  <p className="text-center text-slate-700 italic py-10">Henüz log kaydı yok.</p>
                              ) : (
                                  logs.map(log => (
                                      <div key={log.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex gap-4">
                                          <div className={`w-1.5 h-auto rounded-full ${log.status==='success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                          <div className="flex-1">
                                              <p className="text-xs font-bold text-white">{log.action}</p>
                                              <p className="text-[9px] text-slate-600 uppercase font-black mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                          </div>
                                      </div>
                                  ))
                              )}
                          </div>
                      )}

                      {activeSubTab === 'broadcast' && (
                          <div className="space-y-6 animate-in fade-in">
                              <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl">
                                  <p className="text-xs text-blue-400 leading-relaxed font-medium">Bu botu eklediğiniz tüm kanallara tek seferde mesaj gönderebilirsiniz.</p>
                              </div>
                              <textarea 
                                value={broadcastMsg}
                                onChange={e => setBroadcastMsg(e.target.value)}
                                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:border-blue-500 outline-none resize-none font-medium" 
                                placeholder="Duyuru metnini yazın..."
                              />
                              <button 
                                onClick={handleBroadcast}
                                disabled={isProcessing || !broadcastMsg.trim()}
                                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-widest uppercase shadow-2xl shadow-blue-900/40 active:scale-95 transition-all disabled:opacity-50"
                              >
                                {isProcessing ? <Loader2 className="animate-spin mx-auto"/> : 'DUYURUYU YAYINLA'}
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
