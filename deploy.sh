#!/bin/bash

# Script de déploiement automatisé pour CryptoBoost
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, prod

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-dev}
BRANCH=""
NETLIFY_SITE_ID=""

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Configuration par environnement
case $ENVIRONMENT in
    "dev")
        BRANCH="development"
        info "Déploiement en développement"
        ;;
    "staging")
        BRANCH="staging"
        info "Déploiement en staging"
        ;;
    "prod")
        BRANCH="main"
        info "Déploiement en production"
        ;;
    *)
        error "Environnement invalide. Utilisez: dev, staging, ou prod"
        ;;
esac

# Vérifications préalables
log "Vérifications préalables..."

# Vérifier que Git est installé
if ! command -v git &> /dev/null; then
    error "Git n'est pas installé"
fi

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé"
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    error "npm n'est pas installé"
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    error "Node.js version 18+ requis. Version actuelle: $(node --version)"
fi

log "✅ Toutes les vérifications sont passées"

# Vérifier l'état du repository
log "Vérification de l'état du repository Git..."

if [ -n "$(git status --porcelain)" ]; then
    warn "Des modifications non commitées ont été détectées"
    git status --short
    read -p "Voulez-vous continuer? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Déploiement annulé"
    fi
fi

# Changer de branche si nécessaire
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    log "Changement vers la branche $BRANCH..."
    git checkout $BRANCH || error "Impossible de changer vers la branche $BRANCH"
fi

# Mettre à jour la branche
log "Mise à jour de la branche $BRANCH..."
git pull origin $BRANCH || warn "Impossible de faire git pull"

# Installation des dépendances
log "Installation des dépendances..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

# Vérification des dépendances de sécurité
log "Audit de sécurité des dépendances..."
npm audit --audit-level moderate || warn "Vulnérabilités détectées dans les dépendances"

# Linting
log "Vérification du code (linting)..."
npm run lint || warn "Problèmes de linting détectés"

# Type checking
log "Vérification des types TypeScript..."
npm run type-check || warn "Erreurs de types détectées"

# Tests (si ils existent)
if npm run | grep -q "test"; then
    log "Exécution des tests..."
    npm test || error "Les tests ont échoué"
fi

# Build de l'application
log "Build de l'application..."
npm run build || error "Le build a échoué"

# Vérification que le dossier dist existe
if [ ! -d "dist" ]; then
    error "Le dossier dist n'a pas été créé"
fi

log "✅ Build réussi"

# Vérification des variables d'environnement
log "Vérification des variables d'environnement..."
if [ ! -f ".env" ]; then
    warn "Fichier .env non trouvé"
    if [ ! -f ".env.example" ]; then
        warn "Fichier .env.example non trouvé non plus"
    else
        info "Utilisez .env.example comme template pour créer .env"
    fi
fi

# Analyse de la taille du bundle
log "Analyse de la taille du bundle..."
if command -v du &> /dev/null; then
    BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
    info "Taille du bundle: $BUNDLE_SIZE"
fi

# Déploiement
case $ENVIRONMENT in
    "dev"|"staging")
        log "Déploiement sur Netlify (preview)..."
        if command -v netlify &> /dev/null; then
            netlify deploy --dir=dist --message="Deploy from script - $ENVIRONMENT - $(date)"
        else
            warn "CLI Netlify non installé. Installez avec: npm install -g netlify-cli"
            info "Vous pouvez déployer manuellement en uploadant le dossier 'dist' sur Netlify"
        fi
        ;;
    "prod")
        log "Déploiement en production..."
        read -p "⚠️  Êtes-vous sûr de vouloir déployer en production? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v netlify &> /dev/null; then
                netlify deploy --prod --dir=dist --message="Production deploy - $(date)"
            else
                warn "CLI Netlify non installé"
                info "Déployez manuellement via l'interface Netlify ou installez le CLI"
            fi
        else
            info "Déploiement en production annulé"
        fi
        ;;
esac

# Post-déploiement
log "Nettoyage..."

# Optionnel: supprimer node_modules pour économiser l'espace
read -p "Voulez-vous supprimer node_modules pour économiser l'espace? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf node_modules
    log "node_modules supprimé"
fi

log "🚀 Déploiement terminé pour l'environnement: $ENVIRONMENT"

# Informations utiles
echo
info "Prochaines étapes:"
case $ENVIRONMENT in
    "dev"|"staging")
        echo "- Vérifiez le preview deploy dans l'interface Netlify"
        echo "- Testez les fonctionnalités sur l'URL de preview"
        ;;
    "prod")
        echo "- Vérifiez que le site est accessible sur votre domaine"
        echo "- Testez les fonctionnalités critiques"
        echo "- Surveillez les logs et métriques"
        ;;
esac

echo "- Consultez les guides de déploiement:"
echo "  * SUPABASE_DEPLOYMENT.md pour la base de données"
echo "  * NETLIFY_DEPLOYMENT.md pour l'hébergement"
echo