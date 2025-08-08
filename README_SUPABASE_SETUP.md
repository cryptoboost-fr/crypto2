# Setup Supabase complet (schéma + admin avec mot de passe)

Ce guide vous permet d'installer tout le schéma BDD et de créer un admin avec mot de passe par défaut côté Supabase Auth.

IMPORTANT: Pour des raisons de sécurité, la création d'un utilisateur Auth (email/mot de passe) ne peut pas être effectuée uniquement via SQL Editor. Il faut utiliser l'API Admin de Supabase (service_role). Le mot de passe transite côté serveur uniquement.

## 1) Créer le schéma + seeds
- Ouvrez Supabase → SQL Editor
- Collez et exécutez le contenu de:
  - `supabase/migrations/001_initial_schema.sql`

Cela crée toutes les tables (roles, users, investment_plans, etc.) et seed:
- Rôles: client, admin
- Admin applicatif: users(email = admin@cryptoboost.world)
- Plans: Starter, Pro, Expert

## 2) Créer l'admin Auth (email + mot de passe)
Exécutez la requête HTTP suivante (depuis un environnement serveur) en remplaçant les placeholders. NE PAS exposer la service_role key côté client.

```bash
curl -X POST "https://<PROJECT_REF>.supabase.co/auth/v1/admin/users" \
  -H "apikey: <SUPABASE_SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cryptoboost.world",
    "password": "ChangeMe!123",
    "email_confirm": true,
    "user_metadata": {"full_name": "System Administrator"}
  }'
```

- `<PROJECT_REF>`: visible dans Supabase (Project API)
- `<SUPABASE_SERVICE_ROLE_KEY>`: clé service role (ne jamais exposer publiquement)
- Changez le mot de passe immédiatement après la première connexion.

Alternative GUI: Supabase Dashboard → Authentication → Add User (email + mot de passe + "Auto confirm")

## 3) Lier l'admin Auth au profil applicatif
- Ouvrez Supabase → SQL Editor
- Exécutez:
  - `supabase/migrations/002_link_admin_auth.sql`

Ce script relie l'utilisateur Auth (auth.users) à la table applicative `public/users` (même id), en s'assurant que le rôle `admin` est assigné.

## Vérifications
- Table `auth.users`: contient l'email admin
- Table `public.roles`: `admin` + `client` présents
- Table `public.users`: ligne pour `admin@cryptoboost.world` avec l'id identique à `auth.users.id`
- Tables `investment_plans`, `transactions`, `user_investments`, `crypto_wallets`, `notifications`, `system_logs`: créées

## Notes de sécurité
- Conservez la clé `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement.
- Changez le mot de passe par défaut dès la première connexion.
- Activez RLS et politiques si vous branchez l'Auth Supabase à l'app (fichier 001 inclut des commentaires pour activer des politiques de base si besoin).