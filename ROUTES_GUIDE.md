# 🛣️ Guide Complet des Routes - CryptoBoost

## 🌐 **ROUTES PUBLIQUES** (Accessibles à tous)

### **Page d'accueil :**
- **`/`** → Page d'accueil avec présentation

### **Pages informatives :**
- **`/about`** → À propos de CryptoBoost
- **`/plans`** → Plans d'investissement publics
- **`/contact`** → Page de contact

---

## 🔐 **ROUTES D'AUTHENTIFICATION**

### **Connexion et inscription :**
- **`/auth/login`** → Page de connexion
- **`/auth/register`** → Page d'inscription

### **Redirections automatiques :**
- **`/login`** → Redirige vers `/auth/login`
- **`/register`** → Redirige vers `/auth/register`

---

## 👤 **ROUTES CLIENT** (Utilisateurs connectés)

### **Dashboard principal :**
- **`/client/dashboard`** → Dashboard principal client
- **`/client`** → Redirige vers `/client/dashboard`

### **Fonctionnalités client :**
- **`/client/wallet`** → Portefeuille crypto
- **`/client/plans`** → Plans d'investissement client
- **`/client/exchange`** → Plateforme d'échange
- **`/client/history`** → Historique des transactions
- **`/client/profile`** → Profil utilisateur
- **`/client/notifications`** → Notifications

### **Routes legacy (rétrocompatibilité) :**
- **`/dashboard`** → Redirige vers `/client/dashboard`
- **`/dashboard/wallet`** → Accessible via layout legacy
- **`/dashboard/plans`** → Accessible via layout legacy
- **`/dashboard/exchange`** → Accessible via layout legacy
- **`/dashboard/history`** → Accessible via layout legacy
- **`/dashboard/profile`** → Accessible via layout legacy
- **`/dashboard/notifications`** → Accessible via layout legacy

---

## 👨‍💼 **ROUTES ADMIN** (Administrateurs uniquement)

### **Dashboard administrateur :**
- **`/admin`** → Redirige vers `/admin/dashboard`
- **`/admin/dashboard`** → Dashboard administrateur

### **Gestion des utilisateurs :**
- **`/admin/users`** → Gestion des utilisateurs

### **Gestion financière :**
- **`/admin/transactions`** → Validation des transactions
- **`/admin/plans`** → Gestion des plans d'investissement
- **`/admin/wallets`** → Gestion des wallets crypto

### **Administration système :**
- **`/admin/logs`** → Logs système
- **`/admin/settings`** → Paramètres de l'application

---

## 🔄 **REDIRECTIONS APRÈS CONNEXION**

### **Logique de redirection automatique :**
```javascript
// Dans Login.tsx - après connexion réussie
if (user?.role === 'admin') {
  navigate('/admin/dashboard');
} else {
  navigate('/client/dashboard');
}
```

### **Logique de redirection après inscription :**
```javascript
// Dans Register.tsx - après inscription réussie
navigate('/client/dashboard'); // Toujours client
```

---

## 🛡️ **PROTECTION DES ROUTES**

### **Routes publiques :** Accessible à tous
- `/`, `/about`, `/plans`, `/contact`, `/auth/*`

### **Routes protégées client :** `requiredRole="client"`
- `/client/*`, `/dashboard/*` (legacy)
- Accessible aux clients ET admins

### **Routes protégées admin :** `requiredRole="admin"`
- `/admin/*`
- Accessible uniquement aux admins

---

## 🧭 **NAVIGATION DANS L'APPLICATION**

### **Utilisateur non connecté :**
1. **Accueil** (`/`) → Présentation
2. **Connexion** (`/auth/login`) → Formulaire
3. **Après connexion** → Redirection selon rôle

### **Client connecté :**
1. **Dashboard** (`/client/dashboard`) → Vue d'ensemble
2. **Navigation** → Sidebar avec toutes les options
3. **Déconnexion** → Retour à l'accueil

### **Admin connecté :**
1. **Admin Dashboard** (`/admin/dashboard`) → Statistiques globales
2. **Navigation** → Sidebar admin avec gestion complète
3. **Déconnexion** → Retour à l'accueil

---

## 🚨 **GESTION DES ERREURS**

### **Route inexistante :**
- **`/route-inexistante`** → Redirige vers `/` (page d'accueil)

### **Accès non autorisé :**
- **Client sur `/admin/*`** → Redirection ou erreur 403
- **Non connecté sur routes protégées** → Redirection vers `/auth/login`

---

## 🔧 **CONFIGURATION TECHNIQUE**

### **Lazy loading :** ✅
- Toutes les pages sont chargées à la demande
- Amélioration des performances

### **Suspense :** ✅
- Composants de loading pendant le chargement
- Expérience utilisateur fluide

### **Layouts :** ✅
- **PublicLayout** : Pages publiques
- **AuthLayout** : Pages d'authentification
- **ClientLayout** : Interface client
- **AdminLayout** : Interface administrateur

### **Protection :** ✅
- **ProtectedRoute** component avec gestion des rôles
- Vérification automatique des permissions

---

## ✅ **TESTS DE NAVIGATION**

### **Test 1 : Utilisateur non connecté**
```
/ → ✅ Page d'accueil
/about → ✅ Page à propos
/client/dashboard → ❌ Redirection vers /auth/login
/admin/dashboard → ❌ Redirection vers /auth/login
```

### **Test 2 : Client connecté**
```
/ → ✅ Page d'accueil
/client/dashboard → ✅ Dashboard client
/client/wallet → ✅ Portefeuille
/admin/dashboard → ❌ Accès refusé
```

### **Test 3 : Admin connecté**
```
/ → ✅ Page d'accueil
/client/dashboard → ✅ Dashboard client (admin peut accéder)
/admin/dashboard → ✅ Dashboard admin
/admin/users → ✅ Gestion utilisateurs
```

---

## 🎯 **RÉSUMÉ**

### ✅ **Routes configurées :** 25+ routes complètes
### ✅ **Protection :** Système de rôles fonctionnel
### ✅ **Performance :** Lazy loading activé
### ✅ **UX :** Navigation fluide avec loading states
### ✅ **Compatibilité :** Routes legacy maintenues

**Toutes les routes sont correctement configurées et fonctionnelles !** 🚀