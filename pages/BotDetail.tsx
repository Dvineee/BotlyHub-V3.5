
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Loader2, Star, ShieldCheck, Bot as BotIcon, Lock, CheckCircle2, TrendingUp, Terminal, Zap, X } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, Channel } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';

const { useNavigate, useParams } = Router as any;

const BotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, notification, user } = useTelegram();
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);

  useEffect(() => {
    const fetchBotData = async () => {
      if (!id || !user) return;
      setIsLoading(true);
      const [botData, ownership, userChans] = await Promise.all([
          DatabaseService.getBotById(id),
          DatabaseService.checkBotOwnership(user.id.toString(), id),
          DatabaseService.getChannels(user.id.toString())
      ]);
      setBot(botData);
      setIsOwned(ownership);
      setChannels(userChans);
      setIsLoading(false);
    };
    fetchBotData();
  }, [id, user]);

  const handleAction = async () => {
      if (!bot || !user) return;
      haptic('medium');

      if (isOwned) {
          setShowDeploymentModal(true);
          return;
      }
      
      if (bot.price === 0) {
          setIsDeploying(true);
          try {
              await DatabaseService.addBotToUser(user.id.toString(), bot);
              setIsOwned(true);
              notification('success');
              alert("Bot kütüphanenize eklendi!");
              setShowDeploymentModal(true);
          } finally {
              setIsDeploying(false);
          }
      } else {
          navigate(`/payment/${id}`);
      }
  };

  const handleDeployToChannel = async (channelId: string) => {
      if (!bot || !user) return;
      setIsDeploying(true);
      haptic('heavy');
      
      try {
          await DatabaseService.connectBotToChannel(user.id.toString(), bot.id, channelId);
          notification('success');
          alert("Bot kanalınıza bağlandı! Lütfen operasyon merkezinden yönetici yetkisini doğrulayın.");
          navigate('/my-bots');
      } finally {
          setIsDeploying(false);
          setShowDeploymentModal(false);
      }
  };

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;
  if (!bot) return <div className="min-h-screen bg-[#020617] text-white p-20 text-center font-black">Bot bulunamadı.</div>;

  return (
    <div className="min-h-screen bg-[#020617] pb-32 animate-in fade-in">
      <div className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-900/50">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={22} /></button>
        <h1 className="text-sm font-black text-white uppercase tracking-[0.2em] truncate px-4 italic">{bot.name}</h1>
        <button onClick={() => { haptic('light'); alert("Bağlantı kopyalandı!"); }} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400"><Share2 size={22} /></button>
      </div>

      <div className="px-6 flex flex-col items-center mt-12">
          <div className="relative">
              <img src={bot.icon} className="w-36 h-36 rounded-[44px] shadow-2xl border-4 border-slate-900 object-cover" />
              {bot.price > 0 && !isOwned && <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-950 p-2 rounded-2xl shadow-lg border-2 border-slate-900"><Lock size={20} fill="currentColor"/></div>}
              {isOwned && <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg border-2 border-slate-900"><CheckCircle2 size={20} fill="currentColor"/></div>}
          </div>
          
          <h2 className="text-3xl font-black mt-8 text-white text-center leading-tight italic">{bot.name}</h2>
          
          <div className="flex gap-2 mt-4">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12}/> V3.5 CORE</span>
          </div>
          
          <p className="text-center text-slate-400 mt-8 text-sm leading-relaxed max-w-sm font-medium italic">
              {bot.description}
          </p>
          
          <div className="mt-12 w-full bg-slate-900/40 border border-slate-800 p-8 rounded-[40px]">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Terminal size={14} className="text-blue-500"/> Runtime Özellikleri</h3>
              <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-bold italic"><Zap size={14} className="text-yellow-500"/> Real-time Python Engine</div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-bold italic"><Zap size={14} className="text-emerald-500"/> Webhook Integration</div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-bold italic"><Zap size={14} className="text-blue-500"/> Admin Permission Lock</div>
              </div>
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-30 pb-10">
          <button 
             onClick={handleAction}
             disabled={isDeploying}
             className={`w-full py-5 rounded-[28px] text-white font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isOwned ? 'bg-blue-600' : (bot.price === 0 ? 'bg-emerald-600' : 'bg-[#7c3aed]')}`}
          >
              {isDeploying ? <Loader2 className="animate-spin" /> : (
                  isOwned ? <><TrendingUp size={20}/> Operasyon Merkezi</> : (bot.price === 0 ? 'Hemen Ekle' : `Stars ${bot.price} - Satın Al`)
              )}
          </button>
      </div>

      {showDeploymentModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/90 backdrop-blur-md animate-in fade-in" onClick={() => setShowDeploymentModal(false)}>
              <div className="bg-[#0f172a] w-full max-w-lg rounded-t-[48px] p-8 pb-12 relative shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-10" />
                  <h3 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter">KANALA <span className="text-blue-500">DAĞIT</span></h3>
                  <p className="text-sm text-slate-500 mb-8 font-bold italic">Bu botu hangi kanalınızda çalıştırmak istersiniz?</p>
                  
                  <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar">
                      {channels.length === 0 ? (
                          <div className="p-8 text-center text-slate-600 font-black italic uppercase border-2 border-dashed border-slate-800 rounded-3xl">Henüz kanal eklemediniz</div>
                      ) : channels.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => handleDeployToChannel(c.id)}
                            className="p-5 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
                          >
                              <div className="flex items-center gap-4">
                                  <img src={c.icon} className="w-12 h-12 rounded-2xl object-cover" />
                                  <p className="font-black text-white text-sm italic">{c.name}</p>
                              </div>
                              <div className="p-2.5 bg-blue-600 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all"><Zap size={16}/></div>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => setShowDeploymentModal(false)} className="mt-8 w-full py-4 text-slate-500 font-black text-xs uppercase tracking-widest">İptal</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default BotDetail;
