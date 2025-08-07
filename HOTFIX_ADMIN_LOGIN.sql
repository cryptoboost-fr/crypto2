-- 🚨 HOTFIX ADMIN LOGIN - Réparation ultra-rapide
-- Exécuter ce script dans Supabase SQL Editor pour corriger immédiatement l'admin

-- Supprimer l'admin existant (s'il existe)
DELETE FROM public.users WHERE email = 'admin@cryptoboost.world';
DELETE FROM auth.users WHERE email = 'admin@cryptoboost.world';

-- Créer l'admin avec un UUID simple
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
    email_change_confirm_status
) VALUES (
    'c4e15a36-3ff4-4e39-9f25-98765432abcd',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@cryptoboost.world',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    0
);

-- Créer le profil admin
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
    'c4e15a36-3ff4-4e39-9f25-98765432abcd',
    'admin@cryptoboost.world',
    'Admin CryptoBoost',
    'admin',
    'active',
    0.00,
    0.00,
    NOW(),
    NOW()
);

-- Vérifier que tout est OK
SELECT 
    'Admin créé avec succès !' as message,
    u.email,
    u.full_name,
    u.role,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@cryptoboost.world';

-- Message final
SELECT '🎉 HOTFIX TERMINÉ - Testez maintenant avec admin@cryptoboost.world / admin123' as resultat;