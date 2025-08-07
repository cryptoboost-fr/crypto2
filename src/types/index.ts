// User types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'client' | 'admin';
  status: 'active' | 'banned';
  avatar_url?: string;
  country?: string;
  total_invested: number;
  total_profit: number;
  created_at: string;
  updated_at: string;
}

// Investment plan types
export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount?: number;
  profit_target: number;
  duration_days: number;
  features?: string[];
  is_active: boolean;
  created_at: string;
}

// User investment types
export interface UserInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  profit_target: number;
  current_profit: number;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  created_at: string;
  plan?: InvestmentPlan;
}

// Transaction types
export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  crypto_type: string;
  amount: number;
  usd_value: number;
  wallet_address?: string;
  transaction_hash?: string;
  fee_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

// Crypto wallet types
export interface CryptoWallet {
  id: string;
  crypto_type: string;
  address: string;
  qr_code_url?: string;
  is_active: boolean;
  created_at: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

// System log types
export interface SystemLog {
  id: string;
  user_id?: string;
  action: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Dashboard stats types
export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_capital: number;
  active_investments: number;
  pending_transactions: number;
  total_profit: number;
  monthly_growth: number;
  weekly_growth: number;
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  profit?: number;
  date?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  error: string | null;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  confirm_password: string;
}

export interface InvestmentForm {
  plan_id: string;
  amount: number;
}

export interface TransactionForm {
  type: 'deposit' | 'withdrawal';
  crypto_type: string;
  amount: number;
  wallet_address?: string;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: any;
  children?: NavItem[];
}

// Theme types
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
} 