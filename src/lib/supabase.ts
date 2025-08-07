import { createClient } from '@supabase/supabase-js';
import type { User, Transaction, InvestmentPlan, UserInvestment, Notification, CryptoWallet } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'cryptoboost-unified',
    },
  },
});

// Network connectivity check
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
    return !error;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    return false;
  }
};

// User API functions
export const userApi = {
  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data;
  },

  // Create user profile
  async createUser(userData: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  },

  // Get user investments
  async getUserInvestments(userId: string): Promise<UserInvestment[]> {
    const { data, error } = await supabase
      .from('user_investments')
      .select(`
        *,
        plan:investment_plans(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
    
    return data || [];
  },

  // Get user transactions
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
    
    return data || [];
  },

  // Get user notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
    
    return data || [];
  },
};

// Investment API functions
export const investmentApi = {
  // Get all active plans
  async getActivePlans(): Promise<InvestmentPlan[]> {
    const { data, error } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_amount', { ascending: true });
    
    if (error) {
      console.error('Error fetching investment plans:', error);
      return [];
    }
    
    return data || [];
  },

  // Create user investment
  async createInvestment(investmentData: Partial<UserInvestment>): Promise<UserInvestment | null> {
    const { data, error } = await supabase
      .from('user_investments')
      .insert([investmentData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating investment:', error);
      return null;
    }
    
    return data;
  },

  // Update investment
  async updateInvestment(investmentId: string, updates: Partial<UserInvestment>): Promise<UserInvestment | null> {
    const { data, error } = await supabase
      .from('user_investments')
      .update(updates)
      .eq('id', investmentId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating investment:', error);
      return null;
    }
    
    return data;
  },
};

// Transaction API functions
export const transactionApi = {
  // Create transaction
  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
    
    return data;
  },

  // Update transaction
  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
    
    return data;
  },

  // Get pending transactions (admin)
  async getPendingTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending transactions:', error);
      return [];
    }
    
    return data || [];
  },
};

// Admin API functions
export const adminApi = {
  // Get dashboard stats
  async getDashboardStats(): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_dashboard_stats');
    
    if (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
    
    return data;
  },

  // Get all users
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data || [];
  },

  // Get crypto wallets
  async getCryptoWallets(): Promise<CryptoWallet[]> {
    const { data, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('is_active', true)
      .order('crypto_type', { ascending: true });
    
    if (error) {
      console.error('Error fetching crypto wallets:', error);
      return [];
    }
    
    return data || [];
  },

  // Create system log
  async createSystemLog(logData: Partial<any>): Promise<any> {
    const { data, error } = await supabase
      .from('system_logs')
      .insert([logData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating system log:', error);
      return null;
    }
    
    return data;
  },
};

// Utility functions
export const utils = {
  // Format currency (EUR by default)
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Format EUR specifically
  formatEUR(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Format balance display (€ symbol)
  formatBalance(amount: number): string {
    return `€${amount.toFixed(2)}`;
  },

  // Format crypto amounts with EUR equivalent
  formatCryptoAmount(amount: number, cryptoType: string, eurValue?: number): string {
    const cryptoAmount = `${amount.toFixed(8)} ${cryptoType}`;
    if (eurValue) {
      return `${cryptoAmount} (${utils.formatEUR(eurValue)})`;
    }
    return cryptoAmount;
  },

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  // Format relative time
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'À l\'instant';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }

    return this.formatDate(dateString);
  },

  // Format percentage
  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  },

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Generate random ID
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  },
}; 