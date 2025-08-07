-- Script pour créer un utilisateur administrateur
-- À exécuter dans Supabase SQL Editor
-- 
-- INSTRUCTIONS:
-- 1. Remplacez 'admin@votre-domaine.com' par votre email admin
-- 2. Remplacez 'VotreMotDePasseSecurise123!' par un mot de passe sécurisé
-- 3. Modifiez 'Votre Nom Complet' selon vos préférences

-- Vérifier si l'email existe déjà
DO $$
DECLARE
    admin_email TEXT := 'admin@votre-domaine.com';
    admin_password TEXT := 'VotreMotDePasseSecurise123!';
    admin_name TEXT := 'Administrateur CryptoBoost';
    user_exists INTEGER;
    new_user_id UUID;
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE email = admin_email;
    
    IF user_exists > 0 THEN
        RAISE NOTICE 'Un utilisateur avec l''email % existe déjà', admin_email;
        
        -- Mettre à jour le rôle s'il n'est pas admin
        UPDATE users 
        SET role = 'admin', 
            full_name = admin_name,
            updated_at = NOW()
        WHERE email = admin_email AND role != 'admin';
        
        IF FOUND THEN
            RAISE NOTICE 'Rôle mis à jour vers admin pour %', admin_email;
        ELSE
            RAISE NOTICE 'L''utilisateur % est déjà admin', admin_email;
        END IF;
    ELSE
        -- Créer un nouvel utilisateur admin
        new_user_id := uuid_generate_v4();
        
        -- 1. Créer dans auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            phone_confirmed_at,
            confirmed_at,
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
            crypt(admin_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            NOW(),
            NOW(),
            0,
            '{"provider":"email","providers":["email"]}',
            '{}'
        );
        
        -- 2. Créer dans users
        INSERT INTO users (
            id,
            email,
            full_name,
            role,
            status,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            admin_email,
            admin_name,
            'admin',
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Utilisateur admin créé avec succès: %', admin_email;
        RAISE NOTICE 'ID utilisateur: %', new_user_id;
    END IF;
END $$;

-- Vérifier la création
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.status,
    u.created_at
FROM users u
WHERE u.role = 'admin'
ORDER BY u.created_at DESC;