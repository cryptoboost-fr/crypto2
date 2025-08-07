import { create } from 'zustand';
import { supabase, userApi } from '@/lib/supabase';
import type { User, AuthState, LoginForm, RegisterForm } from '@/types';

interface AuthStore extends AuthState {
  // Actions
  signIn: (credentials: LoginForm) => Promise<{ error?: string }>;
  signUp: (userData: RegisterForm) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signIn: async (credentials: LoginForm) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      if (data.user?.email) {
        const user = await userApi.getUserByEmail(data.user.email);
        set({ 
          user, 
          session: data.session, 
          loading: false,
          error: null 
        });
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      set({ error: errorMessage, loading: false });
      return { error: errorMessage };
    }
  },

  signUp: async (userData: RegisterForm) => {
    set({ loading: true, error: null });

    try {
      // Check if passwords match
      if (userData.password !== userData.confirm_password) {
        set({ error: 'Les mots de passe ne correspondent pas', loading: false });
        return { error: 'Les mots de passe ne correspondent pas' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      if (data.user) {
        // Create user profile
        const user = await userApi.createUser({
          id: data.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: 'client',
          status: 'active',
          total_invested: 0,
          total_profit: 0,
        });

        set({ 
          user, 
          session: data.session, 
          loading: false,
          error: null 
        });
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      set({ error: errorMessage, loading: false });
      return { error: errorMessage };
    }
  },

  signOut: async () => {
    set({ loading: true });

    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        session: null, 
        loading: false,
        error: null 
      });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ loading: false });
    }
  },

  refreshUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email) {
        const user = await userApi.getUserByEmail(session.user.email);
        set({ user, session, loading: false });
      } else {
        set({ user: null, session: null, loading: false });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      set({ user: null, session: null, loading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Initialize auth state
export const initializeAuth = () => {
  const { refreshUser } = useAuthStore.getState();
  
  // Get initial session
  refreshUser();

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event);
    
    if (session?.user?.email) {
      const user = await userApi.getUserByEmail(session.user.email);
      useAuthStore.setState({ user, session, loading: false });
    } else {
      useAuthStore.setState({ user: null, session: null, loading: false });
    }
  });
}; 