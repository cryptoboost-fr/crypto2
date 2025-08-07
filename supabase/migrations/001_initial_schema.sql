-- CryptoBoost Unified Database Schema
-- Migration: 001_initial_schema.sql

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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

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

-- Insert default investment plans
INSERT INTO investment_plans (name, description, min_amount, max_amount, profit_target, duration_days, features, is_active) VALUES
('Starter', 'Plan parfait pour débuter dans le trading automatisé', 50.00, 199.99, 15.00, 30, ARRAY['Investissement minimum: 50€', 'Profit cible: 15%', 'Durée: 30 jours', 'Support email'], true),
('Pro', 'Plan pour les investisseurs sérieux avec des performances optimisées', 200.00, 499.99, 25.00, 45, ARRAY['Investissement minimum: 200€', 'Profit cible: 25%', 'Durée: 45 jours', 'Support prioritaire', 'Analyses avancées'], true),
('Expert', 'Plan premium avec les meilleures stratégies et support dédié', 500.00, NULL, 35.00, 60, ARRAY['Investissement minimum: 500€', 'Profit cible: 35%', 'Durée: 60 jours', 'Support dédié', 'Stratégies exclusives', 'Consultation personnalisée'], true);

-- Insert default crypto wallets
INSERT INTO crypto_wallets (crypto_type, address, is_active) VALUES
('BTC', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', true),
('ETH', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', true),
('USDT', 'TQn9Y2khDD95J42FQtQTdwVVRZqjqH3q6B', true),
('USDC', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', true);

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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon, authenticated; 