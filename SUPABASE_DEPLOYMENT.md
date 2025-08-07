# Guide de Déploiement Supabase - CryptoBoost

## Prérequis

1. **Compte Supabase**: Créez un compte sur [supabase.com](https://supabase.com)
2. **CLI Supabase**: Installez le CLI Supabase
   ```bash
   npm install -g supabase
   ```

## Étapes de Déploiement

### 1. Créer un nouveau projet Supabase

1. Connectez-vous à [app.supabase.com](https://app.supabase.com)
2. Cliquez sur "New Project"
3. Choisissez votre organisation
4. Donnez un nom à votre projet : `cryptoboost-production`
5. Générez un mot de passe sécurisé pour la base de données
6. Choisissez la région (Europe West pour de meilleures performances en France)

### 2. Configuration des variables d'environnement

1. Dans votre projet Supabase, allez dans `Settings > API`
2. Copiez les informations suivantes :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `Project API Key (anon public)` → `VITE_SUPABASE_ANON_KEY`

3. Mettez à jour votre fichier `.env` :
   ```env
   VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
   VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_ici
   VITE_APP_NAME=CryptoBoost
   VITE_APP_VERSION=1.0.0
   NODE_ENV=production
   ```

### 3. Exécuter les migrations

#### Option A: Via SQL Editor (Recommandé pour le premier déploiement)

1. Connectez-vous à votre projet Supabase
2. Allez dans `SQL Editor`
3. Cliquez sur "New Query"
4. Copiez et exécutez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
5. Cliquez sur "Run" pour exécuter le script

#### Option B: Via CLI Supabase

```bash
# Initialiser Supabase dans le projet (si pas déjà fait)
supabase init

# Lier votre projet local au projet Supabase
supabase link --project-ref VOTRE_PROJECT_ID

# Pousser les migrations
supabase db push
```

### 4. Configuration de la sécurité (RLS - Row Level Security)

Les politiques de sécurité sont automatiquement créées via la migration. Vérifiez qu'elles sont bien appliquées dans `Authentication > Policies`.

### 5. Configuration de l'authentification

1. Allez dans `Authentication > Settings`
2. Configurez les options selon vos besoins :
   - **Site URL**: `https://votre-domaine.netlify.app` (ou votre domaine)
   - **Redirect URLs**: Ajoutez les URLs autorisées pour la redirection
   - **Email Templates**: Personnalisez les emails d'invitation/confirmation

### 6. Configuration des utilisateurs Admin

Pour créer un utilisateur admin, exécutez cette requête SQL dans le SQL Editor :

```sql
-- Créer un utilisateur admin (remplacez l'email par le vôtre)
INSERT INTO auth.users (id, email, encrypted_password, role, email_confirmed_at, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'admin@votre-domaine.com',
  crypt('votre_mot_de_passe_securise', gen_salt('bf')),
  'authenticated',
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- Insérer dans la table users avec le rôle admin
INSERT INTO users (id, email, full_name, role, status)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@votre-domaine.com'),
  'admin@votre-domaine.com',
  'Administrateur',
  'admin',
  'active'
);
```

### 7. Données de test (Optionnel)

Pour ajouter des données de test, exécutez les requêtes suivantes dans le SQL Editor :

```sql
-- Ajouter des plans d'investissement de base
INSERT INTO investment_plans (name, description, min_amount, max_amount, profit_target, duration_days, features) VALUES
('Plan Starter', 'Plan d''entrée pour débuter', 100.00, 1000.00, 5.00, 30, ARRAY['Support 24/7', 'Rapport mensuel']),
('Plan Pro', 'Plan intermédiaire avec plus d''avantages', 1000.00, 10000.00, 8.00, 60, ARRAY['Support prioritaire', 'Rapport hebdomadaire', 'Analyse personnalisée']),
('Plan Elite', 'Plan premium avec tous les avantages', 10000.00, NULL, 12.00, 90, ARRAY['Support dédié', 'Rapport quotidien', 'Analyse avancée', 'Accès VIP']);

-- Ajouter des cryptomonnaies de base
INSERT INTO crypto_wallets (name, symbol, network, address, balance, is_active) VALUES
('Bitcoin', 'BTC', 'Bitcoin', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 0.00000000, true),
('Ethereum', 'ETH', 'Ethereum', '0x742c35Cc6634C0532925a3b8D6Cc6bcB17D3c7BD', 0.000000000000000000, true),
('Binance Coin', 'BNB', 'BSC', '0x742c35Cc6634C0532925a3b8D6Cc6bcB17D3c7BD', 0.000000000000000000, true);
```

### 8. Surveillance et Monitoring

1. **Logs**: Surveillez les logs dans `Logs > API Logs`
2. **Métriques**: Consultez les métriques dans `Reports`
3. **Backup**: Configurez des sauvegardes automatiques dans `Settings > Database`

### 9. Variables d'environnement de production

Assurez-vous que vos variables d'environnement de production sont correctement configurées :

```env
# Production - Supabase
VITE_SUPABASE_URL=https://votre-projet-production.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_production_ici

# Production - App
VITE_APP_NAME=CryptoBoost
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

### 10. Test de connexion

Pour tester que tout fonctionne correctement :

1. Déployez votre application frontend
2. Essayez de vous connecter/inscrire
3. Vérifiez que les données s'affichent correctement
4. Testez les fonctionnalités CRUD

## Commandes utiles

```bash
# Vérifier l'état du projet
supabase status

# Voir les logs en temps réel
supabase logs

# Faire un backup
supabase db dump --data-only > backup.sql

# Restaurer depuis un backup
supabase db reset --file backup.sql
```

## Sécurité en Production

1. **Jamais** exposer votre `service_role` key côté client
2. Utilisez uniquement la clé `anon` côté frontend
3. Configurez des politiques RLS strictes
4. Activez la vérification email obligatoire
5. Configurez des limites de taux (rate limiting)
6. Surveillez les logs d'authentification

## Support

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)