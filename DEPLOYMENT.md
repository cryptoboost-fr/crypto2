# 🚀 Guide de Déploiement CryptoBoost

## Déploiement Rapide sur Netlify

### 1. Préparation

#### Vérifier la configuration
```bash
npm run check-setup
```

#### Vérifier les types TypeScript
```bash
npm run type-check
```

### 2. Configuration Supabase

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre URL et clé API

#### Déployer le schéma
1. Dans votre projet Supabase, allez dans l'éditeur SQL
2. Copiez et exécutez le contenu de `supabase/migrations/001_initial_schema.sql`
3. Vérifiez que toutes les tables sont créées

### 3. Configuration des Variables d'Environnement

#### Créer le fichier .env.local
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
VITE_APP_NAME=CryptoBoost
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### 4. Déploiement Netlify

#### Option 1: Déploiement via Git
1. Poussez votre code sur GitHub
2. Connectez-vous à [netlify.com](https://netlify.com)
3. Cliquez sur "New site from Git"
4. Sélectionnez votre repository
5. Configurez les paramètres de build :
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Ajoutez les variables d'environnement dans les paramètres du site

#### Option 2: Déploiement manuel
```bash
# Build de production
npm run build

# Déployer le dossier dist sur Netlify
```

### 5. Configuration Post-Déploiement

#### Variables d'environnement Netlify
Dans les paramètres de votre site Netlify, ajoutez :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `VITE_APP_ENV`

#### Domaines personnalisés
1. Allez dans les paramètres du site
2. Section "Domain management"
3. Ajoutez votre domaine personnalisé

### 6. Vérification Post-Déploiement

#### Tests à effectuer
1. ✅ Page d'accueil se charge
2. ✅ Inscription/Connexion fonctionne
3. ✅ Dashboard client accessible
4. ✅ Dashboard admin accessible (avec compte admin)
5. ✅ Toutes les pages se chargent
6. ✅ Responsive design fonctionne

#### Créer un compte admin
1. Inscrivez-vous normalement
2. Dans Supabase, allez dans la table `users`
3. Changez le rôle de votre utilisateur de `client` à `admin`
4. Reconnectez-vous pour accéder au dashboard admin

### 7. Monitoring et Maintenance

#### Logs Netlify
- Surveillez les logs de build
- Vérifiez les erreurs en temps réel

#### Logs Supabase
- Surveillez les logs de base de données
- Vérifiez les performances des requêtes

#### Analytics
- Configurez Google Analytics si nécessaire
- Surveillez les métriques de performance

### 8. Sécurité

#### Vérifications de sécurité
- ✅ HTTPS activé (automatique sur Netlify)
- ✅ Headers de sécurité configurés
- ✅ RLS activé sur Supabase
- ✅ Variables d'environnement sécurisées

#### Mises à jour
- Surveillez les mises à jour des dépendances
- Testez en local avant de déployer
- Utilisez des branches de développement

### 9. Sauvegarde

#### Base de données
- Configurez des sauvegardes automatiques sur Supabase
- Exportez régulièrement les données importantes

#### Code
- Utilisez Git pour la versioning
- Créez des tags pour les releases importantes

### 10. Support

#### En cas de problème
1. Vérifiez les logs Netlify
2. Vérifiez les logs Supabase
3. Testez en local
4. Contactez le support si nécessaire

#### Ressources utiles
- [Documentation Netlify](https://docs.netlify.com)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React](https://react.dev)

---

## 🎉 Félicitations !

Votre application CryptoBoost est maintenant déployée et prête à être utilisée !

**URL de votre site :** `https://votre-site.netlify.app`

**Support :** support@cryptoboost.com 