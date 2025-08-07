-- 🚨 HOTFIX: Correction erreur confirmed_at
-- Problème: Column "confirmed_at" is a generated column et ne peut pas être modifiée

-- ===============================================
-- 1. NETTOYAGE SÉCURISÉ (si admin créé avec erreur)
-- ===============================================

-- Supprimer l'admin problématique s'il existe
DELETE FROM public.users WHERE email = 'admin@cryptoboost.world';
DELETE FROM auth.users WHERE email = 'admin@cryptoboost.world';

-- ===============================================
-- 2. CONFIRMATION UTILISATEURS EXISTANTS (CORRIGÉ)
-- ===============================================

-- Confirmer seulement email_confirmed_at (confirmed_at est auto-généré)
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- ===============================================
-- 3. CRÉATION ADMIN CORRIGÉE
-- ===============================================

DO $$
DECLARE
    admin_email TEXT := 'admin@cryptoboost.world';
    admin_password TEXT := 'CryptoAdmin2024!';
    admin_name TEXT := 'Administrateur CryptoBoost';
    new_user_id UUID;
    encrypted_password TEXT;
    existing_user_id UUID;
BEGIN
    -- Vérifier si l'admin existe déjà
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF existing_user_id IS NOT NULL THEN
        RAISE NOTICE '✅ Admin existe déjà avec email: %', admin_email;
    ELSE
        RAISE NOTICE '🔐 Création du nouvel administrateur...';
        
        -- Générer UUID et chiffrer mot de passe
        new_user_id := uuid_generate_v4();
        encrypted_password := crypt(admin_password, gen_salt('bf'));
        
        -- Insérer dans auth.users (SANS confirmed_at qui est auto-généré)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            email_change_confirm_status,
            raw_app_meta_data,
            raw_user_meta_data
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            admin_email,
            encrypted_password,
            NOW(),
            NOW(),
            NOW(),
            0,
            '{"provider": "email", "providers": ["email"]}',
            '{}'
        );
        
        -- Insérer dans public.users
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
        
        RAISE NOTICE '✅ Administrateur créé avec succès !';
        RAISE NOTICE '📧 Email: %', admin_email;
        RAISE NOTICE '🔑 Mot de passe: %', admin_password;
    END IF;
END $$;

-- ===============================================
-- 4. VÉRIFICATION
-- ===============================================

-- Vérifier que l'admin est créé et confirmé
SELECT 
    email, 
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email = 'admin@cryptoboost.world';

-- Vérifier le profil dans public.users
SELECT 
    email, 
    full_name, 
    role, 
    status 
FROM public.users 
WHERE email = 'admin@cryptoboost.world';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🎉 Correction terminée !';
    RAISE NOTICE '🔗 Vous pouvez maintenant vous connecter avec:';
    RAISE NOTICE '📧 Email: admin@cryptoboost.world';
    RAISE NOTICE '🔑 Password: CryptoAdmin2024!';
END $$;