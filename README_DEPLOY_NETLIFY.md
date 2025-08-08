# Déploiement Netlify (Frontend)

Ce dossier fournit une procédure simple et fiable pour déployer le frontend sur Netlify, 100% compatible avec l'infrastructure (ingress Kubernetes) et sans hardcode d'URL.

## Prérequis
- Un backend déjà exposé publiquement par votre cluster (ingress), accessible sur un domaine HTTPS
- La variable d'environnement REACT_APP_BACKEND_URL (définie dans Netlify) pointant vers le backend avec préfixe `/api`
  - Exemple: https://votre-domaine-backend.tld/api

## Étapes
1. Connectez le repository GitHub à Netlify
2. Réglez la commande de build et le dossier de publication (déjà présents dans netlify.toml):
   - Build command: `yarn build`
   - Publish directory: `frontend/build`
3. Dans Netlify → Site settings → Build & Deploy → Environment:
   - Ajoutez REACT_APP_BACKEND_URL = https://votre-domaine-backend.tld/api
4. Déployez. Aucune réécriture Netlify n'est nécessaire: les appels API utilisent REACT_APP_BACKEND_URL.

## Vérifications post-déploiement
- La page charge et affiche le bloc "Health backend" avec un JSON
- Le bloc "Rôles" liste au moins `client` et `admin`
- Le bouton "Tester Action" renvoie un JSON `status: processed`
- Le bloc "Synchronisation" met à jour l'heure serveur toutes les 5s

## Dépannage
- Si rien ne s'affiche dans Health/Sync, vérifiez que REACT_APP_BACKEND_URL est défini et joignable
- CORS: assurez-vous que FRONTEND_ORIGIN est renseigné côté backend si vous restreignez les origines
- Ne modifiez jamais les fichiers .env locaux protégés; utilisez les variables d'environnement Netlify