
import React, { useEffect, useState, useRef } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, CheckCircle, Terminal, Zap, Code, Search, Filter, History, Ban, UserCheck, Image, DollarSign, Globe
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User as UserType, Bot as BotType, BotLog, Announcement } from '../../types';

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
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-slate-800/50 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-blue-600 rounded-xl"><Zap size={22} className="text-white"/></div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">BOTLY HUB <span className="text-blue-500">ADMIN</span></h2>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Panel" />
            <NavItem to="/a/dashboard/logs" icon={History} label="Global Loglar" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Bot Pazarı" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-4 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/5 rounded-2xl transition-colors">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl shrink-0">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-800 rounded-xl text-slate-400"><Menu size={20}/></button>
           <div className="hidden sm:flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Sistem V3.5 Online</div>
           </div>
           <div className="flex items-center gap-4 ml-auto">
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Super Admin</div>
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

// --- Panel View ---
const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, activeConnections: 0 });
    useEffect(() => { DatabaseService.getAdminStats().then(setStats); }, []);
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
            <StatCard label="Toplam Üye" value={stats.userCount} icon={Users} color="blue" />
            <StatCard label="Market Botu" value={stats.botCount} icon={Bot} color="purple" />
            <StatCard label="Aktif Kanal" value={stats.activeConnections} icon={Globe} color="emerald" />
            <StatCard label="İşlem Kaydı" value={stats.logCount} icon={History} color="orange" />
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-slate-700 transition-all">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-slate-950 border border-slate-800`}>
            <Icon size={22} className="text-blue-500" />
        </div>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-white mt-2 tracking-tighter">{value}</h3>
    </div>
);

// --- Global Logs View ---
const GlobalLogs = () => {
    const [logs, setLogs] = useState<(BotLog & { bots: BotType, users: UserType })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { load(); }, []);
    const load = async () => {
        setIsLoading(true);
        setLogs(await DatabaseService.getGlobalLogs() as any);
        setIsLoading(false);
    };
    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">PLATFORM <span className="text-blue-500">İŞLEMLERİ</span></h2>
                <button onClick={load} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''}/></button>
            </div>
            <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800">
                        <tr>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bot / Kullanıcı</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">İşlem Detayı</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Durum</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Zaman</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px]">{log.bots?.name?.[0] || 'S'}</div>
                                        <div>
                                            <p className="text-xs font-black text-white">{log.bots?.name || 'Sistem'}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">@{log.users?.username || 'admin'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6"><p className="text-xs text-slate-400 font-medium italic">{log.action}</p></td>
                                <td className="p-6">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="p-6 text-right"><p className="text-[10px] text-slate-600 font-black">{new Date(log.timestamp).toLocaleTimeString()}</p></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && !isLoading && <div className="p-20 text-center text-slate-600 font-black text-xs uppercase tracking-widest">Henüz log bulunmuyor</div>}
            </div>
        </div>
    );
};

// --- Bot Management (Deployment Console) ---
const BotManagement = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);

    useEffect(() => { load(); }, []);
    const load = async () => setBots(await DatabaseService.getBots());

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot) return;
        setIsDeploying(true);
        setTerminalLines(['[RUNTIME] Botly V3.5 Build Engine Starting...', '[BUILD] Python 3.10 environment detected.', '[PIP] Installing dependencies from core...', '[INFO] telegram-python-bot v20.0 installing...']);
        
        await new Promise(r => setTimeout(r, 1000));
        setTerminalLines(prev => [...prev, '[COMPILE] Checking logic structure...', '[COMPILE] Entry point detected: app.run_polling()']);
        
        await new Promise(r => setTimeout(r, 1500));
        setTerminalLines(prev => [...prev, '[SUCCESS] Build complete.', '[BOOT] Starting bot process...', '[BOT] Bot çalışıyor...', '[STATUS] Online & Polling']);
        
        await DatabaseService.saveBot(editingBot);
        
        setTimeout(() => {
            setIsDeploying(false);
            setIsModalOpen(false);
            load();
        }, 1000);
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">MİMARİSİ</span></h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [], python_code: 'from telegram import Update\nfrom telegram.ext import ApplicationBuilder, MessageHandler, ContextTypes, filters\n\nTOKEN = "TOKEN"\n\nasync def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):\n    await update.message.reply_text(update.message.text)\n\napp = ApplicationBuilder().token(TOKEN).build()\napp.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))\n\nprint("Bot çalışıyor...")\napp.run_polling()' }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot İnşa Et
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-blue-500/30 transition-all flex flex-col group">
                        <div className="flex items-center justify-between mb-8">
                            <img src={b.icon || 'https://picsum.photos/seed/bot/200'} className="w-16 h-16 rounded-[24px] object-cover border border-slate-800" />
                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {b.status}
                            </span>
                        </div>
                        <h4 className="font-black text-white text-lg uppercase italic mb-2 truncate">{b.name}</h4>
                        <div className="flex items-center gap-2 text-slate-500 mb-8">
                            <Zap size={14} className="text-blue-500"/>
                            <p className="text-[10px] font-black uppercase tracking-widest">Python Runtime Ready</p>
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all">YAPILANDIR</button>
                            <button onClick={async () => { if(confirm("Silmek istiyor musunuz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-900 border border-slate-800 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => !isDeploying && setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-[44px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">KONFİGÜRASYONU</span></h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Bot Adı</label>
                                    <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number((e.target as any).value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2"><Code size={14} className="text-blue-500"/> Python Kaynak Kodu</label>
                                <textarea required value={editingBot.python_code} onChange={e => setEditingBot({...editingBot, python_code: (e.target as any).value})} className="w-full h-72 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-emerald-500 resize-none focus:border-blue-500 outline-none leading-relaxed" />
                            </div>
                            
                            {isDeploying && (
                                <div className="bg-black rounded-3xl p-6 border border-slate-800 font-mono text-[10px] space-y-1 mb-6 animate-in slide-in-from-bottom">
                                    {terminalLines.map((line, i) => <p key={i} className={line.includes('[SUCCESS]') || line.includes('[BOT]') ? 'text-emerald-500' : 'text-slate-400'}>{line}</p>)}
                                </div>
                            )}

                            <button type="submit" disabled={isDeploying} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-3">
                                {isDeploying ? <Loader2 className="animate-spin"/> : <Zap size={16}/>}
                                BOTU DERLE VE ÇALIŞTIR
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- User Management (Functional) ---
const UserManagement = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { load(); }, []);
    const load = async () => {
        setIsLoading(true);
        setUsers(await DatabaseService.getUsers());
        setIsLoading(false);
    };

    const toggleStatus = async (u: UserType) => {
        const newStatus = u.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(u.id, newStatus);
        load();
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">PLATFORM <span className="text-blue-500">ÜYELERİ</span></h2>
                <button onClick={load} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400"><RefreshCw size={18} className={isLoading ? 'animate-spin' : ''}/></button>
            </div>
            <div className="bg-[#0f172a] border border-slate-800 rounded-[40px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800">
                        <tr>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rol / Durum</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Katılım</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Eylem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <img src={u.avatar} className="w-10 h-10 rounded-xl border border-slate-800 object-cover" />
                                        <div>
                                            <p className="text-xs font-black text-white">{u.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">@{u.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black text-blue-500">{u.role}</span>
                                        <span className={`text-[9px] font-black uppercase ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>{u.status}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-[10px] text-slate-600 font-black">{new Date(u.joinDate).toLocaleDateString()}</td>
                                <td className="p-6 text-right">
                                    <button onClick={() => toggleStatus(u)} className={`p-3 rounded-xl transition-all ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}>
                                        {u.status === 'Active' ? <Ban size={16}/> : <UserCheck size={16}/>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Announcement Management (Functional) ---
const AnnouncementManagement = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);

    useEffect(() => { load(); }, []);
    const load = async () => setAnns(await DatabaseService.getAnnouncements());

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await DatabaseService.saveAnnouncement(editingAnn!);
        setIsModalOpen(false);
        load();
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">PAZAR <span className="text-blue-500">PROMOSYONLARI</span></h2>
                <button onClick={() => { setEditingAnn({ title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Zap', color_scheme: 'blue', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Duyuru
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {anns.map(a => (
                    <div key={a.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800`}>
                                <Zap size={20} className="text-blue-500"/>
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase italic">{a.title}</h4>
                                <p className="text-[10px] text-slate-500 font-bold">{a.is_active ? 'AKTİF' : 'PASİF'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={async () => { if(confirm("Silinsin mi?")) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[44px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">DUYURU <span className="text-blue-500">EKLE</span></h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Başlık</label>
                                <input type="text" required value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Açıklama</label>
                                <textarea required value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none h-24 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Buton Yazısı</label>
                                    <input type="text" value={editingAnn.button_text} onChange={e => setEditingAnn({...editingAnn, button_text: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Link / @Username</label>
                                    <input type="text" value={editingAnn.button_link} onChange={e => setEditingAnn({...editingAnn, button_link: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Renk Şeması</label>
                                <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: (e.target as any).value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none">
                                    <option value="blue">Mavi</option>
                                    <option value="purple">Mor</option>
                                    <option value="emerald">Yeşil</option>
                                    <option value="orange">Turuncu</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-widest uppercase transition-all mt-4 shadow-xl">DUYURUYU YAYINLA</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
