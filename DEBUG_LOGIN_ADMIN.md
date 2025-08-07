# 🔧 DEBUG LOGIN ADMIN - Guide de résolution

## 🚨 Problème identifié
**Erreur 500 Supabase lors de la connexion admin** - L'utilisateur admin semble manquant ou mal configuré dans la base de données.

## 📋 Étapes de diagnostic

### 1. Exécuter le diagnostic
```sql
-- Dans Supabase SQL Editor, exécuter:
-- scripts/diagnostic-admin.sql
```

### 2. Vérifier la console du navigateur
- Ouvrir les **Outils de développement** (F12)
- Aller dans l'onglet **Console**
- Tenter de se connecter avec `admin@cryptoboost.world` / `admin123`
- Observer les messages de debug :
  - `🔐 Tentative de connexion pour: admin@cryptoboost.world`
  - `❌ Erreur d'authentification Supabase: ...` ← **Le problème est ici**

### 3. Analyser l'erreur Supabase
L'erreur 500 indique généralement :
- ❌ L'utilisateur admin n'existe pas dans `auth.users`
- ❌ Problème de synchronisation entre `auth.users` et `public.users`
- ❌ Données corrompues dans les tables

## 🔧 Solution de réparation

### Étape 1: Exécuter le script de réparation
```sql
-- Dans Supabase SQL Editor, exécuter:
-- scripts/repair-admin.sql
```

### Étape 2: Vérifier les credentials
- **Email**: `admin@cryptoboost.world`
- **Mot de passe**: `admin123`

### Étape 3: Tester la connexion
1. Aller sur https://cryptoboost.world/auth/login
2. Saisir les credentials
3. Vérifier la console pour les logs de debug
4. L'admin doit être redirigé vers `/admin/dashboard`

## 🎯 Messages de succès attendus

### Dans la console du navigateur :
```
🔐 Tentative de connexion pour: admin@cryptoboost.world
✅ Authentification Supabase réussie: admin@cryptoboost.world
🔍 Recherche du profil utilisateur...
👤 Profil utilisateur trouvé: admin Admin
```

### Dans Supabase après réparation :
```
✅ Admin créé avec succès: admin@cryptoboost.world
🔑 Mot de passe: admin123
🆔 ID: [uuid-généré]
🎉 ADMIN RÉPARÉ - Vous pouvez maintenant vous connecter
```

## 🔍 Vérifications post-réparation

### 1. Vérifier l'admin dans Supabase
```sql
SELECT 
    u.id,
    u.email,
    u.role,
    u.is_active,
    au.email_confirmed_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@cryptoboost.world';
```

### 2. Tester les fonctions admin
```sql
-- Test de la fonction dashboard
SELECT get_dashboard_stats();
```

### 3. Vérifier les données de base
```sql
-- Compter les plans d'investissement
SELECT COUNT(*) FROM investment_plans WHERE is_active = true;

-- Compter les portefeuilles crypto
SELECT COUNT(*) FROM crypto_wallets WHERE is_active = true;
```

## 🚀 Test final
1. **Connexion** : https://cryptoboost.world/auth/login
2. **Credentials** : `admin@cryptoboost.world` / `admin123`
3. **Redirection** : `/admin/dashboard`
4. **Dashboard** : Doit afficher les statistiques

## 📞 Si le problème persiste

### Vérifier les logs Supabase
1. Aller dans Supabase Dashboard
2. Section **Logs** > **Auth Logs**
3. Chercher les erreurs pendant la tentative de connexion

### Vérifier la configuration réseau
```javascript
// Dans la console du navigateur
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

### Réinitialisation complète
Si tout échoue, exécuter le script complet :
```sql
-- scripts/setup-complete-supabase.sql
```

## ✅ Statut de résolution
- ✅ Scripts de diagnostic créés
- ✅ Script de réparation admin créé  
- ✅ Logs de debug ajoutés au code
- ✅ Guide de débogage complet
- 🔄 **À faire** : Exécuter `repair-admin.sql` dans Supabase