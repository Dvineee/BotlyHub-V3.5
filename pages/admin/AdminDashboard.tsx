import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, CheckCircle, Terminal, Zap, Code, Search, Filter, History
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, BotLog } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

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
      {/* Sidebar Restored */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-slate-800/50 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-blue-600 rounded-xl"><Zap size={22} className="text-white"/></div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">BOTLY HUB <span className="text-blue-500">V3.5</span></h2>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <NavItem to="/a/dashboard/logs" icon={History} label="Sistem Logları" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-4 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/5 rounded-2xl transition-colors">
            <LogOut size={18} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-800 rounded-xl text-slate-400"><Menu size={20}/></button>
           <div className="flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Botly Runtime Online</div>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 uppercase tracking-widest">Administrator</span>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar">
          <div className="max-w-[1400px] mx-auto pb-20">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/logs" element={<GlobalLogs />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/announcements" element={<AnnouncementManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, activeConnections: 0 });
    useEffect(() => { DatabaseService.getAdminStats().then(setStats); }, []);

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Toplam Üye" value={stats.userCount} icon={Users} />
                <StatCard label="Market Botu" value={stats.botCount} icon={Bot} />
                <StatCard label="Aktif Dağıtım" value={stats.activeConnections} icon={Cpu} />
                <StatCard label="İşlem Kaydı" value={stats.logCount} icon={History} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-[40px] p-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                        <Activity size={18} className="text-blue-500"/> Platform Trafiği
                    </h3>
                    <div className="h-[300px] flex items-center justify-center text-slate-700 italic font-bold">Grafik Verisi Senkronize Ediliyor...</div>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] p-8">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Hızlı Erişim</h3>
                    <div className="space-y-4">
                        <button className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Sistem Bakım Modu</button>
                        <button className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Toplu Bildirim Gönder</button>
                        <button className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Gelirleri Dağıt</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] group hover:border-blue-500/50 transition-all">
        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6 border border-slate-800 group-hover:bg-blue-600 transition-colors">
            <Icon size={20} className="text-blue-500 group-hover:text-white" />
        </div>
        <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-white mt-2 tracking-tighter">{value}</h3>
    </div>
);

// --- Global Logs View ---
const GlobalLogs = () => {
    // Fixed: Changed Bot to BotType to avoid conflict with Bot icon from lucide-react
    const [logs, setLogs] = useState<(BotLog & { bots: BotType, users: User })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => {
        setIsLoading(true);
        setLogs(await DatabaseService.getGlobalLogs() as any);
        setIsLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">SİSTEM <span className="text-blue-500">LOGLARI</span></h2>
                <button onClick={load} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''}/></button>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800">
                        <tr>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bot / Kullanıcı</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">İşlem</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Zaman</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <img src={log.bots?.icon} className="w-10 h-10 rounded-xl object-cover" />
                                        <div>
                                            <p className="text-xs font-black text-white uppercase">{log.bots?.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">@{log.users?.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <p className="text-xs text-slate-300 font-medium">{log.action}</p>
                                </td>
                                <td className="p-6">
                                    <p className="text-[10px] text-slate-500 font-black">{new Date(log.timestamp).toLocaleString()}</p>
                                </td>
                                <td className="p-6 text-right">
                                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Bot Management (Create/Edit/Deploy) ---
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
        
        // Simüle edilmiş derleme süreci
        await new Promise(r => setTimeout(r, 2000));
        
        await DatabaseService.saveBot(editingBot);
        
        setIsDeploying(false);
        setIsModalOpen(false);
        load();
        alert("Bot yapılandırması tamamlandı ve Runtime statüsü güncellendi.");
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">PAZARI</span></h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [], python_code: '# Botly V3 Runtime\n\nimport telebot\nbot = telebot.TeleBot("TOKEN")' }); setIsModalOpen(true); }} className="px-6 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot İnşa Et
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] flex flex-col group transition-all hover:border-blue-500/50">
                        <div className="flex items-center justify-between mb-8">
                            <img src={b.icon} className="w-16 h-16 rounded-[24px] object-cover border border-slate-800" />
                            <div className="text-right">
                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {b.status}
                                </span>
                            </div>
                        </div>
                        <h4 className="font-black text-white text-lg italic uppercase mb-2">{b.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-8 font-medium italic">{b.description}</p>
                        
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">DÜZENLE</button>
                            <button onClick={async () => { if(confirm("Botu silmek istediğinize emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-900 border border-slate-800 hover:bg-red-500 hover:border-red-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[44px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">MİMARİSİ</span></h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">İsim</label>
                                    <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none">
                                        <option value="productivity">Üretkenlik</option>
                                        <option value="games">Oyun</option>
                                        <option value="utilities">Araçlar</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2"><Code size={14} className="text-blue-500"/> Python Runtime</label>
                                <textarea 
                                    required 
                                    value={editingBot.python_code} 
                                    onChange={e => setEditingBot({...editingBot, python_code: (e.target as any).value})} 
                                    className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-emerald-500 resize-none focus:border-blue-500 outline-none leading-relaxed" 
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isDeploying}
                                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-3"
                            >
                                {isDeploying ? <Loader2 className="animate-spin"/> : <Zap size={16}/>}
                                BOTU DERLE VE AKTİF ET
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserManagement = () => <div className="p-20 text-center font-black text-slate-500 italic uppercase tracking-widest">Kullanıcı Yönetimi V3.5</div>;
const AnnouncementManagement = () => <div className="p-20 text-center font-black text-slate-500 italic uppercase tracking-widest">Duyuru Yönetimi V3.5</div>;

export default AdminDashboard;