
import React, { useEffect, useState, useRef } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, RefreshCw, Plus, Edit2, Trash2, 
  Megaphone, Send, Activity, 
  Clock, Wallet, ShieldAlert, Cpu, CheckCircle, Terminal, Zap, Code, Search, Filter, History, Ban, UserCheck, Server, ArrowUpRight, Play, Square, AlertCircle, HardDrive, Star
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
    const active = location.pathname === to || (to !== '/a/dashboard' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
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
            <div className="p-2 bg-blue-600 rounded-xl"><Zap size={22} className="text-white fill-current"/></div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">BOTLY <span className="text-blue-500">CLOUD</span></h2>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Sunucu Özeti" />
            <NavItem to="/a/dashboard/logs" icon={Terminal} label="Sistem Terminali" />
            <NavItem to="/a/dashboard/runtimes" icon={Server} label="Aktif Süreçler" />
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
           <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Node: DE-FRA-01 (ACTIVE)</span>
              </div>
           </div>
           <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
             <ShieldAlert size={14} /> Root Privileges
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar relative">
          <div className="max-w-[1400px] mx-auto pb-20">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/logs" element={<GlobalLogs />} />
              <Route path="/runtimes" element={<RuntimeMonitor />} />
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
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, activeRuntimes: 0 });
    useEffect(() => { DatabaseService.getAdminStats().then(setStats); }, []);
    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Toplam Üye" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Market Botu" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Aktif PID (7/24)" value={stats.activeRuntimes} icon={Server} color="emerald" />
                <StatCard label="İşlem Kaydı" value={stats.logCount} icon={History} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                            <Activity size={18} className="text-blue-500"/> Altyapı İşlem Grafiği
                        </h3>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Canlı Senkronizasyon</span>
                    </div>
                    <div className="h-64 bg-slate-950/50 rounded-3xl border border-slate-900 flex items-end justify-between p-8 gap-2 relative overflow-hidden">
                        {[40, 65, 45, 90, 55, 30, 70, 85, 40, 60, 95, 80, 40, 50, 60, 75, 20, 90].map((h, i) => (
                            <div key={i} className="w-full bg-blue-600/40 rounded-t-lg transition-all hover:bg-blue-600" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] shadow-2xl space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 italic">Donanım Kaynakları</h3>
                    <HealthBar label="CPU Load" value={18} color="blue" />
                    <HealthBar label="RAM Usage" value={54} color="purple" />
                    <HealthBar label="SSD Space" value={22} color="emerald" />
                    <div className="mt-10 p-6 bg-slate-950/50 rounded-3xl border border-slate-900">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Main Node Status</p>
                        <p className="text-xs font-black text-emerald-500 mt-2">Sistem Stabil - 0 Hata</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon }: any) => (
    <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] group hover:border-blue-500 transition-all shadow-xl">
        <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-800 mb-6 group-hover:bg-blue-600 transition-all">
            <Icon size={20} className="text-blue-500 group-hover:text-white" />
        </div>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-white mt-2 tracking-tighter">{value}</h3>
    </div>
);

const HealthBar = ({ label, value, color }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
            <span>{label}</span>
            <span className="text-white">{value}%</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div className={`h-full bg-blue-600`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const RuntimeMonitor = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    useEffect(() => { 
        load(); 
        const i = setInterval(load, 5000); 
        return () => clearInterval(i); 
    }, []);

    const load = async () => {
        const data = await DatabaseService.getBots();
        setBots(data.filter(b => b.status === 'Active' || b.status === 'Booting'));
    };

    const stopBot = async (id: string) => {
        if(confirm("Bu süreci (Process) sonlandırmak üzeresiniz. Onaylıyor musunuz?")) {
            await DatabaseService.stopBotRuntime(id);
            load();
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">AKTİF <span className="text-blue-500">SÜREÇLER (PROCESSES)</span></h2>
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black text-blue-500 uppercase tracking-widest">Node: DE-FRA-01</div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between group shadow-2xl relative overflow-hidden">
                        {b.status === 'Booting' && (
                            <div className="absolute inset-0 bg-blue-600/5 animate-pulse pointer-events-none"></div>
                        )}
                        <div className="flex items-center gap-6">
                             <div className="relative">
                                 <img src={b.icon} className="w-16 h-16 rounded-2xl border-2 border-slate-800 object-cover" />
                                 <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#0f172a] ${b.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-spin'}`}></div>
                             </div>
                             <div>
                                 <h4 className="font-black text-white uppercase italic tracking-tight text-lg">{b.name}</h4>
                                 <p className="text-[10px] text-blue-500 font-black uppercase">{b.runtime_id || 'PROVISIONING'}</p>
                             </div>
                        </div>
                        <div className="flex-1 px-12 grid grid-cols-3 gap-8 my-6 md:my-0">
                            <MetricBox label="Uptime" value={b.status === 'Active' ? 'Online' : 'Starting...'} />
                            <MetricBox label="Allocated RAM" value={`${b.memory_usage || 0} MB`} />
                            <MetricBox label="CPU Load" value={`${b.cpu_usage || 0}%`} />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => stopBot(b.id)} className="px-6 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                                <Square size={14} fill="currentColor"/> KILL PROCESS
                            </button>
                        </div>
                    </div>
                ))}
                {bots.length === 0 && (
                    <div className="p-20 text-center bg-slate-950/50 rounded-[40px] border border-dashed border-slate-800 text-slate-600 font-black uppercase italic">
                        Şu anda çalışan bir bot süreci bulunmuyor.
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricBox = ({ label, value }: any) => (
    <div>
        <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{label}</p>
        <p className="text-sm font-black text-white">{value}</p>
    </div>
);

const BotManagement = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => { load(); }, []);
    useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLines]);

    const load = async () => setBots(await DatabaseService.getBots());

    const handleAction = async (bot: BotType) => {
        if (bot.status === 'Active' || bot.status === 'Booting') {
            await DatabaseService.stopBotRuntime(bot.id);
        } else {
            setIsDeploying(true);
            setTerminalLines([
                '[SYSTEM] Initializing deployment...', 
                '[CLOUD] Node selection: DE-FRA-01', 
                '[RUNTIME] Cloning Python source code...',
                '[RUNTIME] Setting up virtualenv (v3.10)...',
                '[DEPLOY] Script starting in detached mode...'
            ]);
            
            await new Promise(r => setTimeout(r, 1200));
            await DatabaseService.startBotRuntime(bot.id);
            setIsDeploying(false);
        }
        load();
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">HAVUZU</span></h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', python_code: 'import logging\nfrom telegram import Update\nfrom telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler\n\n# Your code here...' }); setIsModalOpen(true); }} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-2xl active:scale-95 transition-all">
                    <Plus size={18} strokeWidth={3}/> Yeni Bot Oluştur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[48px] flex flex-col group relative overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <img src={b.icon || 'https://picsum.photos/seed/bot/200'} className="w-16 h-16 rounded-[28px] object-cover border-2 border-slate-800" />
                            <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${b.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : b.status === 'Booting' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {b.status || 'Offline'}
                            </span>
                        </div>
                        <h4 className="font-black text-white text-lg uppercase italic mb-2 truncate relative z-10">{b.name}</h4>
                        <div className="flex gap-2 mt-auto relative z-10">
                            <button onClick={() => handleAction(b)} className={`flex-1 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${(b.status === 'Active' || b.status === 'Booting') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-600 border-blue-600 text-white'}`}>
                                {(b.status === 'Active' || b.status === 'Booting') ? <Square size={14}/> : <Play size={14}/>} 
                                {(b.status === 'Active' || b.status === 'Booting') ? 'DURDUR' : 'BAŞLAT'}
                            </button>
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="p-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"><Edit2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => !isDeploying && setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[56px] p-12 relative shadow-2xl overflow-y-auto max-h-[95vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">BOT <span className="text-blue-500">MİMARİSİ</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <Input label="Görünen İsim" value={editingBot.name} onChange={(v:any) => setEditingBot({...editingBot, name: v})} />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <div className="relative">
                                        <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={16} fill="currentColor"/>
                                        <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 pl-12 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none">
                                        <option value="productivity">Üretkenlik</option>
                                        <option value="games">Eğlence</option>
                                        <option value="moderation">Moderasyon</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 flex items-center gap-2"><Code size={14} className="text-blue-500"/> Python Kaynak Kodu (v3.10)</label>
                                <textarea value={editingBot.python_code} onChange={e => setEditingBot({...editingBot, python_code: e.target.value})} className="w-full h-full min-h-[250px] bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-emerald-500 resize-none outline-none leading-relaxed shadow-inner" />
                            </div>
                        </div>
                        
                        {isDeploying && (
                            <div className="bg-black rounded-[32px] p-8 border border-slate-800 font-mono text-[11px] space-y-1.5 shadow-2xl mb-8 overflow-y-auto max-h-40">
                                {terminalLines.map((l, i) => <p key={i} className="text-slate-400 font-bold italic">{l}</p>)}
                                <div ref={terminalEndRef} />
                            </div>
                        )}

                        <button onClick={async () => { await DatabaseService.saveBotConfiguration(editingBot); setIsModalOpen(false); load(); }} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[32px] text-[10px] tracking-widest uppercase transition-all shadow-2xl active:scale-95">YAPILANDIRMAYI SUNUCUYA KAYDET</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Input = ({ label, value, type = 'text', onChange }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" />
    </div>
);

const GlobalLogs = () => {
    const [logs, setLogs] = useState<(BotLog & { bots: BotType, users: UserType })[]>([]);
    useEffect(() => { 
        load(); 
        const i = setInterval(load, 3000); 
        return () => clearInterval(i); 
    }, []);
    const load = async () => setLogs(await DatabaseService.getGlobalLogs() as any);

    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">SİSTEM <span className="text-blue-500">TERMINALİ</span></h2>
            <div className="bg-black border border-slate-800 rounded-[40px] p-8 shadow-2xl font-mono text-[11px] min-h-[600px] max-h-[80vh] overflow-y-auto no-scrollbar space-y-1.5">
                {logs.map(l => (
                    <div key={l.id} className="flex gap-4 hover:bg-slate-900/40 p-1.5 rounded transition-colors group">
                        <span className="text-slate-700 font-black shrink-0">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                        <span className={`font-black uppercase shrink-0 ${l.status === 'terminal' ? 'text-blue-500' : 'text-emerald-500'}`}>{l.status}</span>
                        <span className="text-slate-600 uppercase font-black shrink-0">@{l.bots?.name || 'ROOT'}</span>
                        <span className="text-slate-300 italic flex-1">{l.action}</span>
                    </div>
                ))}
                {logs.length === 0 && <div className="text-slate-800 p-20 text-center font-black">LOG_SYSTEM_IDLE: Dinleme modunda...</div>}
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    useEffect(() => { DatabaseService.getUsers().then(setUsers); }, []);

    const toggleStatus = async (u: UserType) => {
        const next = u.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(u.id, next);
        DatabaseService.getUsers().then(setUsers);
    };

    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">ÜYE <span className="text-blue-500">YÖNETİM MERKEZİ</span></h2>
            <div className="bg-[#0f172a] border border-slate-800 rounded-[44px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 border-b border-slate-800">
                        <tr>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Yetki / Durum</th>
                            <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Eylemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <img src={u.avatar} className="w-12 h-12 rounded-2xl border border-slate-800 object-cover" />
                                        <div>
                                            <p className="text-sm font-black text-white uppercase">{u.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold">@{u.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black text-blue-500 uppercase italic">{u.role}</span>
                                        <span className={`text-[9px] font-black uppercase ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>{u.status}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <button onClick={() => toggleStatus(u)} className={`p-4 rounded-2xl transition-all ${u.status === 'Active' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        {u.status === 'Active' ? <Ban size={18}/> : <UserCheck size={18}/>}
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

const AnnouncementManagement = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    useEffect(() => { DatabaseService.getAnnouncements().then(setAnns); }, []);

    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">DUYURU <span className="text-blue-500">KONTROLÜ</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {anns.map(a => (
                    <div key={a.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[48px] flex items-center justify-between shadow-xl">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-950 border border-slate-800">
                                <Zap size={24} className="text-blue-500"/>
                            </div>
                            <h4 className="text-base font-black text-white uppercase italic">{a.title}</h4>
                        </div>
                        <button onClick={async () => { await DatabaseService.deleteAnnouncement(a.id); DatabaseService.getAnnouncements().then(setAnns); }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SystemSettings = () => null;

export default AdminDashboard;
