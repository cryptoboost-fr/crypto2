-- 🔧 RÉPARATION ADMIN - Correction des problèmes de connexion admin
-- Exécuter ce script dans Supabase SQL Editor si l'admin ne peut pas se connecter

-- Nettoyer les anciens admins défaillants
DELETE FROM auth.users WHERE email = 'admin@cryptoboost.world';
DELETE FROM public.users WHERE email = 'admin@cryptoboost.world';

-- Créer un nouvel admin avec les bonnes données
DO $$
DECLARE
    admin_user_id uuid;
    admin_email text := 'admin@cryptoboost.world';
    admin_password text := 'admin123';
    admin_id text;
BEGIN
    -- Générer un UUID pour l'admin
    admin_user_id := gen_random_uuid();
    admin_id := admin_user_id::text;
    
    -- Créer l'utilisateur dans auth.users avec les champs essentiels
    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        email_change_confirm_status
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        0
    );
    
    -- Confirmer l'email de l'admin
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE email = admin_email;
    
    -- Créer le profil dans public.users
    INSERT INTO public.users (
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
        admin_id,
        admin_email,
        'Admin CryptoBoost',
        'admin',
        'active',
        0.00,
        0.00,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Admin créé avec succès: %', admin_email;
    RAISE NOTICE '🔑 Mot de passe: %', admin_password;
    RAISE NOTICE '🆔 ID: %', admin_id;
    
END $$;

-- Vérifier que l'admin a été créé correctement
SELECT 
    u.id,
    u.email,
    u.role,
    u.full_name,
    u.status,
    u.total_invested,
    au.email_confirmed_at,
    'admin123' as password_temp
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@cryptoboost.world';

-- Tester la fonction dashboard
SELECT get_dashboard_stats();

-- Message de confirmation
SELECT '🎉 ADMIN RÉPARÉ - Vous pouvez maintenant vous connecter avec admin@cryptoboost.world / admin123' as message;