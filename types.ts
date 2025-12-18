
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
  python_code?: string; // Botun çekirdek çalışma kodları
  status?: 'Active' | 'Deploying' | 'Error' | 'Stopped';
  // Fixed: Added isNew and isPremium properties to match data.tsx and SearchPage usage
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
  status: 'success' | 'error' | 'info' | 'critical';
}

export interface BotConnection {
  id: string;
  user_id: string;
  bot_id: string;
  channel_id: string;
  is_admin_verified: boolean;
  last_check_at: string;
  status: 'Active' | 'MissingPermissions' | 'Stopped' | 'Pending';
}

export interface UserBot extends Bot {
  isAdEnabled: boolean;
  isActive: boolean;
  purchased: boolean;
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
  // Fixed: Added content_detail property used in Home.tsx line 206
  content_detail?: string;
}

export interface Notification {
  id: string;
  type: 'system' | 'payment' | 'security' | 'bot';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  target_type?: 'user' | 'global';
}

// Fixed: Added SubscriptionPlan interface used in data.tsx
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  color: string;
  icon: any;
  features: string[];
  isPopular?: boolean;
}

// Fixed: Added CryptoTransaction interface used in services/WalletService.ts
export interface CryptoTransaction {
  id: string;
  type: 'Withdrawal' | 'Deposit' | 'Internal' | 'Payment';
  amount: number;
  symbol: string;
  chain: string;
  toAddress: string;
  date: string;
  status: 'Processing' | 'Completed' | 'Failed';
  hash: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}
