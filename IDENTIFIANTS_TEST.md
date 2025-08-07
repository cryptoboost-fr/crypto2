# 🔐 Identifiants de Test - CryptoBoost

## 👨‍💼 **ADMINISTRATEUR**

### **Email** : `admin@cryptoboost.com`
### **Mot de passe** : `CryptoAdmin2024!`

**Accès après connexion :**
- Interface d'administration complète
- Gestion des utilisateurs
- Validation des transactions
- Configuration système

---

## 👤 **NOUVEAU CLIENT (Test d'inscription)**

### **Instructions :**
1. Allez sur la page d'inscription
2. Remplissez le formulaire :
   - **Nom complet** : Votre nom de test
   - **Email** : `test@example.com` (ou votre email)
   - **Mot de passe** : `TestUser2024!` (minimum 8 caractères)
   - **Confirmer** : `TestUser2024!`

**Accès après inscription :**
- Connexion automatique (pas de confirmation d'email)
- Interface client
- Dashboard personnel

---

## 🔧 **DÉPANNAGE**

### **Problème 1 : "Rien ne se passe" à la connexion admin**
✅ **Solution** : 
- Vérifiez que la base de données Supabase est installée
- Exécutez le script `setup-complete-supabase.sql`
- L'admin sera créé automatiquement

### **Problème 2 : "Mot de passe doit avoir 6 caractères" mais j'en mets plus**
✅ **Solution** :
- **Minimum requis** : 8 caractères (pas 6)
- Utilisez des mots de passe comme : `MonMotDePasse2024!`
- Évitez les mots de passe trop courts

### **Problème 3 : Admin ne va pas sur la bonne page**
✅ **Solution** : 
- Les admins sont redirigés vers `/admin/dashboard`
- Les clients vers `/client/dashboard`
- Redirection automatique en fonction du rôle

---

## 🔍 **VÉRIFICATIONS**

### **1. Base de données installée ?**
```sql
-- Dans Supabase SQL Editor, vérifiez :
SELECT email, role, status FROM users WHERE role = 'admin';
```

### **2. Variables d'environnement correctes ?**
- **URL Supabase** : `https://ropzeweidvjkfeyyuiim.supabase.co`
- **Clé publique** : Configurée dans `.env`

### **3. Confirmations d'email désactivées ?**
- Dans Supabase > Authentication > Settings
- "Enable email confirmations" = **OFF**

---

## 📱 **TEST COMPLET**

### **Étape 1 : Test Admin**
1. Connexion avec `admin@cryptoboost.com` / `CryptoAdmin2024!`
2. Redirection vers `/admin/dashboard`
3. Vérification des fonctionnalités admin

### **Étape 2 : Test Client**
1. Inscription nouveau client
2. Connexion automatique
3. Redirection vers `/client/dashboard`
4. Test des fonctionnalités client

### **Étape 3 : Test Authentification**
1. Déconnexion
2. Reconnexion avec les mêmes identifiants
3. Vérification persistance des données

---

## 🚨 **PROBLÈMES COURANTS**

### **"Invalid login credentials"**
- Vérifiez l'email et mot de passe
- Assurez-vous que l'admin est créé dans Supabase
- Vérifiez la connexion Supabase

### **"Password should be at least 8 characters"**
- Utilisez un mot de passe de 8+ caractères
- Exemple valide : `TestUser2024!`

### **Page blanche ou erreur après connexion**
- Vérifiez les routes dans l'application
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous que les variables d'environnement sont correctes

---

## ✅ **VALIDATION FINALE**

Une fois connecté :
- ✅ Admin voit l'interface d'administration
- ✅ Client voit l'interface utilisateur
- ✅ Données utilisateur affichées correctement
- ✅ Navigation fonctionnelle