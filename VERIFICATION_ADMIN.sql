-- 🔍 VÉRIFICATION: Admin créé correctement après HOTFIX

-- ===============================================
-- 1. VÉRIFICATION AUTH.USERS
-- ===============================================

-- Vérifier l'admin dans la table d'authentification Supabase
SELECT 
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    role as auth_role
FROM auth.users 
WHERE email = 'admin@cryptoboost.world';

-- ===============================================
-- 2. VÉRIFICATION PUBLIC.USERS
-- ===============================================

-- Vérifier l'admin dans la table application
SELECT 
    email,
    full_name,
    role,
    status,
    total_invested,
    total_profit,
    created_at
FROM public.users 
WHERE email = 'admin@cryptoboost.world';

-- ===============================================
-- 3. VÉRIFICATION DONNÉES PAR DÉFAUT
-- ===============================================

-- Vérifier les plans d'investissement
SELECT 
    name,
    min_amount,
    max_amount,
    profit_target,
    duration_days,
    is_active
FROM investment_plans 
ORDER BY min_amount;

-- Vérifier les wallets crypto
SELECT 
    crypto_type,
    address,
    is_active
FROM crypto_wallets 
ORDER BY crypto_type;

-- ===============================================
-- 4. STATISTIQUES GÉNÉRALES
-- ===============================================

-- Compter les utilisateurs
SELECT 
    'Total users' as metric,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Active users' as metric,
    COUNT(*) as count
FROM public.users 
WHERE status = 'active'
UNION ALL
SELECT 
    'Admin users' as metric,
    COUNT(*) as count
FROM public.users 
WHERE role = 'admin';

-- ===============================================
-- 5. TEST FONCTION DASHBOARD
-- ===============================================

-- Tester la fonction get_dashboard_stats()
SELECT get_dashboard_stats() as dashboard_stats;

-- ===============================================
-- 6. RÉSUMÉ DE VÉRIFICATION
-- ===============================================

DO $$
DECLARE
    admin_exists BOOLEAN;
    admin_confirmed BOOLEAN;
    plans_count INTEGER;
    wallets_count INTEGER;
BEGIN
    -- Vérifier si l'admin existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'admin@cryptoboost.world'
    ) INTO admin_exists;
    
    -- Vérifier si l'admin est confirmé
    SELECT email_confirmed_at IS NOT NULL
    FROM auth.users 
    WHERE email = 'admin@cryptoboost.world'
    INTO admin_confirmed;
    
    -- Compter les plans
    SELECT COUNT(*) FROM investment_plans WHERE is_active = true INTO plans_count;
    
    -- Compter les wallets
    SELECT COUNT(*) FROM crypto_wallets WHERE is_active = true INTO wallets_count;
    
    -- Afficher le résumé
    RAISE NOTICE '===============================================';
    RAISE NOTICE '🎯 RÉSUMÉ DE VÉRIFICATION';
    RAISE NOTICE '===============================================';
    
    IF admin_exists THEN
        RAISE NOTICE '✅ Admin existe: admin@cryptoboost.world';
    ELSE
        RAISE NOTICE '❌ Admin manquant: admin@cryptoboost.world';
    END IF;
    
    IF admin_confirmed THEN
        RAISE NOTICE '✅ Admin confirmé (email_confirmed_at défini)';
    ELSE
        RAISE NOTICE '❌ Admin non confirmé';
    END IF;
    
    RAISE NOTICE '📊 Plans actifs: % / 3 attendus', plans_count;
    RAISE NOTICE '💳 Wallets actifs: % / 4 attendus', wallets_count;
    
    IF admin_exists AND admin_confirmed AND plans_count >= 3 AND wallets_count >= 4 THEN
        RAISE NOTICE '🎉 INSTALLATION RÉUSSIE !';
        RAISE NOTICE '🔗 Vous pouvez vous connecter avec:';
        RAISE NOTICE '📧 Email: admin@cryptoboost.world';
        RAISE NOTICE '🔑 Password: CryptoAdmin2024!';
        RAISE NOTICE '🌐 URL: /auth/login';
    ELSE
        RAISE NOTICE '⚠️  Installation incomplète - vérifiez les détails ci-dessus';
    END IF;
    
    RAISE NOTICE '===============================================';
END $$;