# Guide de Déploiement Netlify - CryptoBoost

## Prérequis

1. **Compte Netlify**: Créez un compte sur [netlify.com](https://www.netlify.com)
2. **Repository Git**: Code source hébergé sur GitHub, GitLab ou Bitbucket
3. **Node.js**: Version 18+ pour le build local

## Méthodes de Déploiement

### Méthode 1: Déploiement via Git (Recommandée)

#### 1. Connecter votre repository

1. Connectez-vous à [app.netlify.com](https://app.netlify.com)
2. Cliquez sur "New site from Git"
3. Choisissez votre provider Git (GitHub, GitLab, Bitbucket)
4. Sélectionnez le repository `cryptoboost-unified`
5. Choisissez la branche `bugfix/app-fixes` (ou `main` après merge)

#### 2. Configuration du build

Netlify devrait automatiquement détecter les paramètres grâce au fichier `netlify.toml`, mais vérifiez :

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: (laisser vide)

#### 3. Variables d'environnement

Dans les paramètres de votre site Netlify :

1. Allez dans `Site settings > Environment variables`
2. Ajoutez les variables suivantes :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
VITE_APP_NAME=CryptoBoost
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

#### 4. Déploiement automatique

Une fois configuré, Netlify déploiera automatiquement :
- À chaque push sur la branche principale
- À chaque merge de PR
- Vous pouvez aussi déclencher manuellement depuis l'interface

### Méthode 2: Déploiement manuel via CLI

#### 1. Installation du CLI Netlify

```bash
npm install -g netlify-cli
```

#### 2. Build local

```bash
# Installer les dépendances
npm install

# Build de production
npm run build
```

#### 3. Déploiement

```bash
# Connexion à Netlify
netlify login

# Déploiement initial
netlify deploy --prod --dir=dist
```

### Méthode 3: Drag & Drop

1. Buildez localement avec `npm run build`
2. Allez sur [app.netlify.com](https://app.netlify.com)
3. Glissez-déposez le dossier `dist` dans la zone de déploiement

## Configuration avancée

### Fichier netlify.toml (déjà configuré)

Le fichier `netlify.toml` contient la configuration optimisée :

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

# Redirections pour SPA React Router
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers de sécurité
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

# Cache des assets statiques
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Domaine personnalisé

1. Dans `Site settings > Domain management`
2. Cliquez sur "Add custom domain"
3. Entrez votre domaine (ex: `cryptoboost.world`)
4. Configurez les DNS selon les instructions

### SSL/HTTPS

Netlify fournit automatiquement un certificat SSL gratuit Let's Encrypt.

### Preview Deploys

Netlify créé automatiquement des déploiements de prévisualisation pour :
- Les Pull Requests
- Les branches de développement

## Optimisations Performance

### 1. Build optimizations

Le build est déjà optimisé avec :
- Tree shaking (suppression du code inutilisé)
- Minification CSS/JS
- Compression des images
- Code splitting par route

### 2. CDN et mise en cache

Netlify utilise un CDN global avec mise en cache automatique :
- Assets statiques : cache 1 an
- HTML : cache adaptatif
- API : pas de cache

### 3. Compression

Netlify active automatiquement :
- Gzip/Brotli compression
- Optimisation des images
- Minification HTML

## Monitoring et Analytics

### 1. Analytics Netlify

Activez dans `Site settings > Analytics` :
- Trafic et performances
- Core Web Vitals
- Erreurs JavaScript

### 2. Formulaires Netlify

Si vous ajoutez des formulaires de contact :

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <!-- vos champs -->
</form>
```

### 3. Functions Netlify (optionnel)

Pour des API endpoints simples :

```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify!" })
  };
};
```

## Variables d'environnement par contexte

```toml
# Dans netlify.toml
[context.production.environment]
  NODE_ENV = "production"
  VITE_APP_VERSION = "1.0.0"

[context.deploy-preview.environment]
  NODE_ENV = "development"
  VITE_APP_VERSION = "preview"

[context.branch-deploy.environment]
  NODE_ENV = "staging"
```

## Déploiement par étapes

### 1. Développement
- Branch: `development`
- URL: `dev--cryptoboost.netlify.app`
- Variables: environnement de dev

### 2. Staging
- Branch: `staging`
- URL: `staging--cryptoboost.netlify.app`
- Variables: environnement de test

### 3. Production
- Branch: `main`
- URL: `cryptoboost.netlify.app` ou domaine personnalisé
- Variables: environnement de production

## Webhooks et intégrations

### 1. Slack notifications

```bash
# Dans les paramètres Netlify
Webhook URL: https://hooks.slack.com/your-webhook
Events: Deploy succeeded, Deploy failed
```

### 2. GitHub status checks

Netlify mettra automatiquement à jour le statut des PR GitHub.

## Troubleshooting

### Erreurs courantes

1. **Build failed: Module not found**
   ```bash
   # Vérifiez package.json et supprimez node_modules
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment variables not working**
   - Vérifiez que les variables commencent par `VITE_`
   - Relancez le build après modification

3. **404 on page refresh**
   - Vérifiez que les redirections SPA sont configurées
   - Le fichier `netlify.toml` doit contenir la règle de redirection

4. **Build timeout**
   ```bash
   # Augmentez le timeout dans netlify.toml
   [build]
     command = "npm run build"
     commandOrigin = "ui"
     environment = { NODE_OPTIONS = "--max-old-space-size=4096" }
   ```

### Logs et debugging

```bash
# Logs de build local
netlify dev

# Logs de build Netlify
# Disponibles dans l'interface web sous "Deploys > Deploy log"
```

## Scripts utiles

```bash
# Développement local avec Netlify Dev
netlify dev

# Preview d'un deploy
netlify deploy --dir=dist

# Deploy en production
netlify deploy --prod --dir=dist

# Ouvrir l'admin Netlify
netlify open

# Voir le statut du site
netlify status
```

## Sécurité

### 1. Variables sensibles

⚠️ **IMPORTANT**: Les variables `VITE_*` sont exposées côté client !
- Utilisez uniquement des clés publiques (comme la clé Supabase anon)
- Jamais de clés privées ou secrets

### 2. Headers de sécurité

Les headers de sécurité sont configurés dans `netlify.toml` :
- CSP (Content Security Policy)
- HSTS (HTTP Strict Transport Security)
- Protection XSS

### 3. Access control

Pour des sections privées :
```toml
# Dans netlify.toml
[[redirects]]
  from = "/admin/*"
  to = "/admin/index.html"
  status = 200
  force = true
  headers = {X-Robots-Tag = "noindex"}
```

## Support et documentation

- [Documentation Netlify](https://docs.netlify.com/)
- [Netlify CLI](https://cli.netlify.com/)
- [Status Page](https://netlifystatus.com/)
- [Community Forum](https://community.netlify.com/)

## Checklist de déploiement

- [ ] Repository Git configuré
- [ ] Variables d'environnement définies
- [ ] Fichier `netlify.toml` en place
- [ ] Build local réussi (`npm run build`)
- [ ] Tests passés (`npm test`)
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] SSL activé
- [ ] Analytics configurées
- [ ] Monitoring en place

Votre application CryptoBoost est maintenant prête pour la production ! 🚀