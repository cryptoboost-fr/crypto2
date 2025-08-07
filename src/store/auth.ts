import { create } from 'zustand';
import { supabase, userApi } from '@/lib/supabase';
import type { User, AuthState, LoginForm, RegisterForm } from '@/types';

interface AuthStore extends AuthState {
  // Actions
  signIn: (credentials: LoginForm) => Promise<{ error?: string; user?: User }>;
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
      console.log('🔐 Tentative de connexion pour:', credentials.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ Erreur d\'authentification Supabase:', error);
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      console.log('✅ Authentification Supabase réussie:', data.user?.email);

      if (data.user?.email) {
        console.log('🔍 Recherche du profil utilisateur...');
        const user = await userApi.getUserByEmail(data.user.email);
        
        if (!user) {
          console.error('❌ Profil utilisateur non trouvé dans la base');
          set({ error: 'Profil utilisateur non trouvé', loading: false });
          return { error: 'Profil utilisateur non trouvé' };
        }
        
        console.log('👤 Profil utilisateur trouvé:', user.role, user.full_name);
        set({ 
          user, 
          session: data.session, 
          loading: false,
          error: null 
        });
        
        return { user };
      }

      return {};
    } catch (error) {
      console.error('💥 Erreur inattendue lors de la connexion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      set({ error: errorMessage, loading: false });
      return { error: errorMessage };
    }
  },

  signUp: async (userData: RegisterForm) => {
    set({ loading: true, error: null });

    try {
      console.log('📝 Début d\'inscription pour:', userData.email);
      
      // Check password length
      if (userData.password.length < 8) {
        console.error('❌ Mot de passe trop court:', userData.password.length);
        set({ error: 'Le mot de passe doit contenir au moins 8 caractères', loading: false });
        return { error: 'Le mot de passe doit contenir au moins 8 caractères' };
      }

      // Check if passwords match
      if (userData.password !== userData.confirm_password) {
        console.error('❌ Mots de passe ne correspondent pas');
        set({ error: 'Les mots de passe ne correspondent pas', loading: false });
        return { error: 'Les mots de passe ne correspondent pas' };
      }

      console.log('✅ Validation client OK, envoi à Supabase...');
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined, // Désactive la redirection email
        }
      });

      if (error) {
        console.error('❌ Erreur Supabase signUp:', error);
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      console.log('✅ Inscription Supabase réussie:', data.user?.email);

      if (data.user) {
        console.log('👤 Création du profil utilisateur...');
        
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

        if (user) {
          console.log('✅ Profil client créé:', user.full_name);
          set({ 
            user, 
            session: data.session, 
            loading: false,
            error: null 
          });
        } else {
          console.error('❌ Échec création profil utilisateur');
          set({ error: 'Erreur lors de la création du profil', loading: false });
          return { error: 'Erreur lors de la création du profil' };
        }
      }

      return {};
    } catch (error) {
      console.error('💥 Erreur inattendue lors de l\'inscription:', error);
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