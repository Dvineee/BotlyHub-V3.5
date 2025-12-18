
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Settings as SettingsIcon, 
  ShieldCheck, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, Ban, CheckCircle, Gift, Info, Heart, Bell, Shield, TrendingUp, History, Code, Terminal, Zap
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const AVAILABLE_ICONS = [
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Zap', icon: Zap },
  { name: 'BotIcon', icon: Bot },
  { name: 'Bell', icon: Bell },
  { name: 'Shield', icon: Shield }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
  }, [navigate]);

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-slate-800/50 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-blue-600 rounded-xl"><Zap size={22} className="text-white"/></div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">BOTLY HUB <span className="text-blue-500">V3.5</span></h2>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Panel" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/notifications" icon={Send} label="Bildirimler" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-4 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/5 rounded-2xl transition-colors">
            <LogOut size={18} /> Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-800 rounded-xl text-slate-400"><Menu size={20}/></button>
           <div className="hidden sm:flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Bot Servisleri Aktif</div>
           </div>
           <div className="flex items-center gap-4 ml-auto">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white border border-white/10">AD</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#020617] no-scrollbar">
          <div className="max-w-[1400px] mx-auto pb-10">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/announcements" element={<AnnouncementManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, notifCount: 0, annCount: 0 });
    useEffect(() => { DatabaseService.getAdminStats().then(setStats); }, []);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Üyeler" value={stats.userCount} icon={Users} color="blue" />
            <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="purple" />
            <StatCard label="Bildirimler" value={stats.notifCount} icon={Send} color="emerald" />
            <StatCard label="Duyurular" value={stats.annCount} icon={Megaphone} color="orange" />
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-slate-700 transition-all">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-slate-900 border border-slate-800`}>
            <Icon size={28} className="text-blue-500" />
        </div>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{value}</h3>
    </div>
);

// --- Market Bot Management ---
const BotManagement = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => setBots(await DatabaseService.getBots());

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot) return;
        setIsDeploying(true);
        
        // Python Kodlarının Derlenmesi ve Sunucuya Gönderilmesi (Simüle edilmiş gerçek akış)
        await new Promise(r => setTimeout(r, 3000));
        
        await DatabaseService.saveBot({
            ...editingBot,
            status: 'Active'
        });
        
        setIsDeploying(false);
        setIsModalOpen(false);
        load();
        alert("Bot başarıyla ayağa kaldırıldı ve markete eklendi!");
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">MİMARI</span></h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [], python_code: '# BotlyHub Core v3.5\nimport telebot\n\nbot = telebot.TeleBot("TOKEN")\n\n@bot.message_handler(commands=["start"])\ndef start(m):\n    bot.reply_to(m, "BotlyHub V3.5 Online!")\n\nbot.polling()' }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot İnşa Et
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500/40 transition-all flex flex-col group shadow-2xl">
                        <div className="flex gap-6 mb-8">
                            <img src={b.icon} className="w-16 h-16 rounded-[20px] object-cover border border-slate-800" />
                            <div className="min-w-0">
                                <h4 className="font-black text-white text-lg truncate italic tracking-tight">{b.name}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{b.status}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-2xl mb-8 border border-slate-800">
                             <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Çekirdek Kod Durumu</p>
                             <div className="flex items-center gap-2 text-emerald-400">
                                 <Terminal size={14}/>
                                 <span className="text-[10px] font-mono">Compiled & Ready</span>
                             </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-800 hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"> <Edit2 size={14}/> Yapılandır </button>
                            <button onClick={async () => { if(confirm("Botu silmek istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-xl transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[44px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={22}/></button>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">KONFİGÜRASYONU</span></h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">İsim</label>
                                    <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2"><Code size={14} className="text-blue-500"/> Python Runtime Kodları</label>
                                <textarea 
                                    required 
                                    value={editingBot.python_code} 
                                    onChange={e => setEditingBot({...editingBot, python_code: (e.target as any).value})} 
                                    className="w-full h-72 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-emerald-500 resize-none focus:border-blue-500 outline-none leading-relaxed" 
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isDeploying}
                                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.3em] uppercase transition-all mt-4 flex items-center justify-center gap-3"
                            >
                                {isDeploying ? <><Loader2 className="animate-spin"/> KODLAR SUNUCUYA DERLENİYOR...</> : 'BOTU AYAĞA KALDIR VE YAYINLA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserManagement = () => <div className="p-20 text-center font-black text-slate-500 italic">Kullanıcı Yönetimi V3.5</div>;
const NotificationCenter = () => <div className="p-20 text-center font-black text-slate-500 italic">Bildirim Merkezi V3.5</div>;
const AnnouncementManagement = () => <div className="p-20 text-center font-black text-slate-500 italic">Duyuru Yönetimi V3.5</div>;

export default AdminDashboard;
