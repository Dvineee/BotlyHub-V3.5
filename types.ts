
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'Admin' | 'User' | 'Moderator';
  status: 'Active' | 'Passive';
  badges: string[];
  joinDate: string;
  email?: string;
  phone?: string;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  category: string;
  bot_link: string;
  screenshots: string[];
  python_code?: string;
  status: 'Active' | 'Deploying' | 'Error' | 'Stopped' | 'Booting';
  runtime_id?: string; // Process ID (PID)
  uptime_start?: string;
  memory_usage?: number; // MB
  cpu_usage?: number; // %
  last_ping?: string;
  isNew?: boolean;
  isPremium?: boolean;
}

export interface BotLog {
  id: string;
  bot_id: string;
  user_id: string;
  channel_id?: string;
  action: string;
  timestamp: string;
  status: 'success' | 'error' | 'info' | 'critical' | 'terminal';
  details?: string;
}

export interface Channel {
  id: string;
  user_id: string;
  name: string;
  memberCount: number;
  icon: string;
  isAdEnabled: boolean;
  connectedBotIds: string[];
  revenue: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  icon_name: string;
  color_scheme: string;
  is_active: boolean;
  action_type: 'link' | 'popup';
}

export interface Notification {
  id: string;
  type: 'system' | 'payment' | 'security' | 'bot';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}
