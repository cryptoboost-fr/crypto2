# Setup Supabase complet (schéma + admin avec mot de passe)

Ce guide vous permet d'installer tout le schéma BDD et de créer un admin avec mot de passe par défaut côté Supabase Auth.

IMPORTANT: Pour des raisons de sécurité, la création d'un utilisateur Auth (email/mot de passe) ne peut pas être effectuée uniquement via SQL Editor. Il faut utiliser l'API Admin de Supabase (service_role) ou l'interface Dashboard. Le mot de passe transite côté serveur uniquement.

## 1) Créer le schéma + seeds
- Ouvrez Supabase → SQL Editor
- Collez et exécutez le contenu de:
  - `supabase/migrations/001_initial_schema.sql`

Effets:
- Crée toutes les tables (roles, users, investment_plans, user_investments, transactions, crypto_wallets, notifications, system_logs)
- Seeds idempotents:
  - Rôles: client, admin
  - Admin applicatif: users(email = admin@cryptoboost.world)
  - Plans: Starter, Pro, Expert

## 2) Créer l'admin Auth (email + mot de passe)
Option A — Dashboard Supabase
- Authentication → Users → Add user
- Email: admin@cryptoboost.world
- Password: ChangeMe!123 (modifiez ensuite)
- Cochez "Auto confirm"

Option B — Admin API (serveur uniquement):
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
Remplacez `<PROJECT_REF>` et `<SUPABASE_SERVICE_ROLE_KEY>`. Ne JAMAIS exposer la service role key côté client.

Vérification rapide dans SQL Editor:
```sql
select id, email from auth.users where lower(email) = lower('admin@cryptoboost.world');
```

## 3) Lier l'admin Auth au profil applicatif
Deux options:

A) Email par défaut (script statique)
- Exécutez `supabase/migrations/002_link_admin_auth.sql`
- Si vous voyez l'erreur "Auth user for admin@cryptoboost.world not found", vous n'avez pas encore créé l'utilisateur Auth (étape 2) ou l'email est différent.

B) Email variable (fonction réutilisable)
- Exécutez `supabase/migrations/003_link_admin_auth_function.sql` une fois
- Puis, dans SQL Editor:
```sql
select public.link_admin_auth('admin@cryptoboost.world');
-- ou votre email admin si différent
select public.link_admin_auth('votre.email@domaine.tld');
```

## 4) Contrôles finaux
- `auth.users`: contient l'email admin
- `public.roles`: admin + client présents
- `public.users`: ligne admin avec le même id que `auth.users.id` (et role admin)
- `investment_plans`, `transactions`, `user_investments`, `crypto_wallets`, `notifications`, `system_logs`: créées

## 5) Sécurité
- Conservez `SUPABASE_SERVICE_ROLE_KEY` côté serveur uniquement
- Changez le mot de passe par défaut à la première connexion
- Activez/affinez les politiques RLS si vous branchez l'Auth Supabase à l'app (les commentaires dans 001 indiquent les endroits à activer)