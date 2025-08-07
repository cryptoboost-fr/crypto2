-- ===============================================
-- SCRIPT D'INSTALLATION COMPLÈTE SUPABASE
-- CryptoBoost Application
-- ===============================================
-- 
-- INSTRUCTIONS D'UTILISATION :
-- 1. Copiez ce script entier
-- 2. Connectez-vous à votre projet Supabase : https://ropzeweidvjkfeyyuiim.supabase.co
-- 3. Allez dans SQL Editor
-- 4. MODIFIEZ LES VARIABLES CI-DESSOUS SI NÉCESSAIRE :
--    - admin_email : Email admin (défaut : admin@cryptoboost.com)
--    - admin_password : Mot de passe (défaut : CryptoAdmin2024!)
--    - admin_name : Nom complet
-- 5. Collez et exécutez le script
-- 6. Votre base de données sera complètement configurée !
-- ===============================================

-- ⚠️ VARIABLES À MODIFIER SI NÉCESSAIRE ⚠️
DO $$
DECLARE
    -- 🔧 CONFIGUREZ CES VARIABLES (valeurs par défaut configurées) :
    admin_email TEXT := 'admin@cryptoboost.world';           -- Email admin par défaut
    admin_password TEXT := 'CryptoAdmin2024!';             -- Mot de passe par défaut
    admin_name TEXT := 'Administrateur CryptoBoost';       -- Nom par défaut
    
    -- Variables système (ne pas modifier)
    new_user_id UUID;
    user_exists INTEGER;
    encrypted_password TEXT;
BEGIN
    RAISE NOTICE '🚀 Début de l''installation CryptoBoost...';
    RAISE NOTICE '🌐 Projet Supabase: https://ropzeweidvjkfeyyuiim.supabase.co';
    
    -- Vérifier si l'utilisateur admin existe déjà
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF user_exists > 0 THEN
        RAISE NOTICE '⚠️  Un utilisateur avec l''email % existe déjà', admin_email;
        RAISE NOTICE '💡 L''installation du schéma continuera, mais l''admin ne sera pas recréé';
    END IF;

    RAISE NOTICE '📊 Installation du schéma de base de données...';
END $$;

-- ===============================================
-- 1. SCHÉMA DE BASE DE DONNÉES COMPLET
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  avatar_url VARCHAR,

  country VARCHAR,
  total_invested DECIMAL(15,2) DEFAULT 0, -- Amount in EUR
  total_profit DECIMAL(15,2) DEFAULT 0, -- Amount in EUR
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment plans table
CREATE TABLE IF NOT EXISTS investment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  min_amount DECIMAL(15,2) NOT NULL, -- Amount in EUR
  max_amount DECIMAL(15,2), -- Amount in EUR
  profit_target DECIMAL(5,2) NOT NULL, -- Percentage target
  duration_days INTEGER NOT NULL,
  features TEXT[], -- Array of features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User investments table
CREATE TABLE IF NOT EXISTS user_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES investment_plans(id),
  amount DECIMAL(15,2) NOT NULL, -- Amount in EUR
  profit_target DECIMAL(15,2) NOT NULL, -- Amount in EUR
  current_profit DECIMAL(15,2) DEFAULT 0, -- Amount in EUR
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (deposits/withdrawals)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  crypto_type VARCHAR NOT NULL,
  amount DECIMAL(15,8) NOT NULL, -- Crypto amount
  usd_value DECIMAL(15,2) NOT NULL, -- Value in EUR
  wallet_address VARCHAR,
  transaction_hash VARCHAR,
  fee_amount DECIMAL(15,8) DEFAULT 0, -- Fee in crypto
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'failed')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crypto wallets table
CREATE TABLE IF NOT EXISTS crypto_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crypto_type VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  qr_code_url VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 2. INDEX POUR PERFORMANCES
-- ===============================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_status ON user_investments(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);

-- ===============================================
-- 3. TRIGGERS ET FONCTIONS
-- ===============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 4. SÉCURITÉ RLS (ROW LEVEL SECURITY)
-- ===============================================

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Anyone can view active plans" ON investment_plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON investment_plans;
DROP POLICY IF EXISTS "Users can view own investments" ON user_investments;
DROP POLICY IF EXISTS "Users can create own investments" ON user_investments;
DROP POLICY IF EXISTS "Admins can manage all investments" ON user_investments;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON transactions;
DROP POLICY IF EXISTS "Anyone can view active wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Admins can manage wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all logs" ON system_logs;
DROP POLICY IF EXISTS "System can insert logs" ON system_logs;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for investment_plans
CREATE POLICY "Anyone can view active plans" ON investment_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON investment_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for user_investments
CREATE POLICY "Users can view own investments" ON user_investments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own investments" ON user_investments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all investments" ON user_investments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all transactions" ON transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for crypto_wallets
CREATE POLICY "Anyone can view active wallets" ON crypto_wallets FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage wallets" ON crypto_wallets FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for system_logs
CREATE POLICY "Admins can view all logs" ON system_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can insert logs" ON system_logs FOR INSERT WITH CHECK (true);

-- ===============================================
-- 5. DONNÉES PAR DÉFAUT
-- ===============================================

-- Insert default investment plans (only if they don't exist)
INSERT INTO investment_plans (name, description, min_amount, max_amount, profit_target, duration_days, features, is_active)
SELECT * FROM (VALUES
  ('Starter', 'Plan parfait pour débuter dans le trading automatisé', 50.00, 199.99, 15.00, 30, ARRAY['Investissement minimum: 50€', 'Profit cible: 15%', 'Durée: 30 jours', 'Support email'], true),
  ('Pro', 'Plan pour les investisseurs sérieux avec des performances optimisées', 200.00, 499.99, 25.00, 45, ARRAY['Investissement minimum: 200€', 'Profit cible: 25%', 'Durée: 45 jours', 'Support prioritaire', 'Analyses avancées'], true),
  ('Expert', 'Plan premium avec les meilleures stratégies et support dédié', 500.00, NULL, 35.00, 60, ARRAY['Investissement minimum: 500€', 'Profit cible: 35%', 'Durée: 60 jours', 'Support dédié', 'Stratégies exclusives', 'Consultation personnalisée'], true)
) AS new_plans(name, description, min_amount, max_amount, profit_target, duration_days, features, is_active)
WHERE NOT EXISTS (SELECT 1 FROM investment_plans WHERE name = new_plans.name);

-- Insert default crypto wallets (only if they don't exist)
INSERT INTO crypto_wallets (crypto_type, address, is_active)
SELECT * FROM (VALUES
  ('BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', true),
  ('ETH', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', true),
  ('USDT', 'TQn9Y2khDD95J42FQtQTdwVVRZqjqH3q6B', true),
  ('USDC', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', true)
) AS new_wallets(crypto_type, address, is_active)
WHERE NOT EXISTS (SELECT 1 FROM crypto_wallets WHERE crypto_type = new_wallets.crypto_type);

-- ===============================================
-- 6. FONCTIONS SYSTÈME
-- ===============================================

-- Create function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM users WHERE status = 'active'),
    'active_users', (SELECT COUNT(*) FROM users WHERE status = 'active' AND updated_at > NOW() - INTERVAL '7 days'),
    'total_capital', (SELECT COALESCE(SUM(total_invested), 0) FROM users),
    'active_investments', (SELECT COUNT(*) FROM user_investments WHERE status = 'active'),
    'pending_transactions', (SELECT COUNT(*) FROM transactions WHERE status = 'pending'),
    'total_profit', (SELECT COALESCE(SUM(total_profit), 0) FROM users),
    'monthly_growth', 0,
    'weekly_growth', 0
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- 7. PERMISSIONS
-- ===============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon, authenticated;

-- ===============================================
-- 8. CONFIGURATION AUTHENTIFICATION (Désactiver confirmations email)
-- ===============================================

-- Confirmer automatiquement tous les utilisateurs existants
UPDATE auth.users 
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      phone_confirmed_at = NOW()
WHERE 
  email_confirmed_at IS NULL 
  OR phone_confirmed_at IS NULL;

-- ===============================================
-- 9. CRÉATION DE L'ADMINISTRATEUR
-- ===============================================

DO $$
DECLARE
    -- ⚠️ VARIABLES À MODIFIER (répétées ici pour sécurité)
    admin_email TEXT := 'admin@cryptoboost.world';           -- ⚠️ CHANGEZ CETTE EMAIL
    admin_password TEXT := 'AdminCrypto2024!';             -- ⚠️ CHANGEZ CE MOT DE PASSE
    admin_name TEXT := 'Administrateur CryptoBoost';       -- ⚠️ CHANGEZ CE NOM
    
    -- Variables système
    new_user_id UUID;
    user_exists INTEGER;
    encrypted_password TEXT;
BEGIN
    RAISE NOTICE '👤 Vérification de l''administrateur...';
    
    -- Vérifier si l'utilisateur admin existe déjà
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF user_exists > 0 THEN
        RAISE NOTICE '⚠️  Un utilisateur avec l''email % existe déjà', admin_email;
        
        -- Mettre à jour le rôle en admin au cas où
        UPDATE users SET 
            role = 'admin',
            full_name = admin_name,
            status = 'active',
            updated_at = NOW()
        WHERE email = admin_email;
        
        RAISE NOTICE '✅ Utilisateur existant mis à jour en tant qu''admin';
        
    ELSE
        RAISE NOTICE '🔐 Création du nouvel administrateur...';
        
        -- Générer un UUID pour le nouvel utilisateur
        new_user_id := uuid_generate_v4();
        
        -- Chiffrer le mot de passe
        encrypted_password := crypt(admin_password, gen_salt('bf'));
        
        -- Insérer dans auth.users (table système Supabase)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
                  phone_confirmed_at,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            admin_email,
            encrypted_password,
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            NOW(),
            NOW(),
            null,
            null,
            '',
            '',
            ''
        );
        
        -- Insérer dans la table users (table application)
        INSERT INTO users (
            id,
            email,
            full_name,
            role,
            status,
            total_invested,
            total_profit,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            admin_email,
            admin_name,
            'admin',
            'active',
            0,
            0,
            NOW(),
            NOW()
        );
        
        -- Créer une notification de bienvenue pour l'admin
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            is_read,
            created_at
        ) VALUES (
            new_user_id,
            '🎉 Bienvenue sur CryptoBoost !',
            'Votre compte administrateur a été créé avec succès. Vous avez maintenant accès à toutes les fonctionnalités d''administration.',
            'success',
            false,
            NOW()
        );
        
        -- Log de création d'admin
        INSERT INTO system_logs (
            user_id,
            action,
            details,
            created_at
        ) VALUES (
            new_user_id,
            'ADMIN_CREATED',
            json_build_object(
                'admin_email', admin_email,
                'created_by', 'installation_script',
                'timestamp', NOW()
            ),
            NOW()
        );
        
        RAISE NOTICE '✅ Administrateur créé avec succès !';
        RAISE NOTICE '📧 Email: %', admin_email;
        RAISE NOTICE '🔑 Mot de passe: % (changez-le après connexion)', admin_password;
        RAISE NOTICE '👤 ID utilisateur: %', new_user_id;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== INSTALLATION TERMINÉE AVEC SUCCÈS ! ===';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Prochaines étapes :';
    RAISE NOTICE '1. Connectez-vous avec l''email: %', admin_email;
    RAISE NOTICE '2. Changez le mot de passe par défaut';
    RAISE NOTICE '3. Configurez les wallets crypto dans l''admin';
    RAISE NOTICE '4. Testez les fonctionnalités';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Données créées :';
    RAISE NOTICE '   • 3 plans d''investissement par défaut';
    RAISE NOTICE '   • 4 wallets crypto configurés';
    RAISE NOTICE '   • 1 administrateur opérationnel';
    RAISE NOTICE '   • Système de sécurité RLS activé';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Sécurité : Row Level Security (RLS) activée sur toutes les tables';
    RAISE NOTICE '🚀 Votre application CryptoBoost est prête !';
    
END $$;

-- ===============================================
-- FIN DU SCRIPT D'INSTALLATION
-- ===============================================