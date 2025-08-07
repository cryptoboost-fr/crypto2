-- 🔍 DIAGNOSTIC ADMIN - Vérification complète
-- Exécuter ce script dans Supabase SQL Editor pour diagnostiquer les problèmes

-- 1. Vérifier la structure des tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'investment_plans', 'crypto_wallets');

-- 2. Vérifier les utilisateurs dans auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Vérifier les utilisateurs dans la table public.users
SELECT 
    id,
    email,
    role,
    full_name,
    status,
    total_invested,
    total_profit,
    created_at
FROM public.users 
ORDER BY created_at DESC;

-- 4. Vérifier les plans d'investissement
SELECT 
    id,
    name,
    min_amount,
    max_amount,
    annual_return,
    is_active
FROM investment_plans 
WHERE is_active = true;

-- 5. Vérifier les portefeuilles crypto
SELECT 
    id,
    crypto_type,
    wallet_address,
    is_active
FROM crypto_wallets 
WHERE is_active = true;

-- 6. Vérifier la fonction dashboard
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_dashboard_stats';

-- 7. Test de connexion - Compter les utilisateurs
SELECT COUNT(*) as total_users FROM public.users;

-- 8. Vérifier les politiques RLS
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'investment_plans', 'crypto_wallets', 'transactions', 'user_investments', 'notifications');

-- 9. Vérifier l'admin spécifique
SELECT 
    u.id,
    u.email,
    u.role,
    u.full_name,
    u.status,
    u.total_invested,
    au.email_confirmed_at,
    au.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@cryptoboost.world';

-- 10. Si l'admin n'existe pas, afficher un message
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ ADMIN MANQUANT - Exécuter le script de création'
        WHEN COUNT(*) = 1 THEN '✅ Admin trouvé'
        ELSE '⚠️ Plusieurs admins trouvés'
    END as statut_admin
FROM public.users 
WHERE email = 'admin@cryptoboost.world';