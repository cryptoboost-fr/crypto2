#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration CryptoBoost...\n');

// Vérifier les fichiers essentiels
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.js',
  'src/App.tsx',
  'src/main.tsx',
  'src/lib/supabase.ts',
  'src/store/auth.ts',
  'supabase/migrations/001_initial_schema.sql'
];

console.log('📁 Vérification des fichiers essentiels...');
let missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    missingFiles.push(file);
  }
});

// Vérifier les pages
const pagesDir = 'src/pages';
const requiredPages = [
  'public/Home.tsx',
  'public/About.tsx',
  'public/Plans.tsx',
  'public/Contact.tsx',
  'auth/Login.tsx',
  'auth/Register.tsx',
  'client/Dashboard.tsx',
  'client/Wallet.tsx',
  'client/Plans.tsx',
  'client/Exchange.tsx',
  'client/History.tsx',
  'client/Profile.tsx',
  'client/Notifications.tsx',
  'admin/Dashboard.tsx',
  'admin/Users.tsx',
  'admin/Transactions.tsx',
  'admin/InvestmentPlans.tsx',
  'admin/CryptoWallets.tsx',
  'admin/SystemLogs.tsx',
  'admin/Settings.tsx'
];

console.log('\n📄 Vérification des pages...');
let missingPages = [];

requiredPages.forEach(page => {
  const pagePath = path.join(pagesDir, page);
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${page}`);
  } else {
    console.log(`❌ ${page} - MANQUANT`);
    missingPages.push(page);
  }
});

// Vérifier les composants UI
const uiComponentsDir = 'src/components/ui';
const requiredComponents = [
  'button.tsx',
  'card.tsx',
  'input.tsx',
  'toaster.tsx'
];

console.log('\n🧩 Vérification des composants UI...');
let missingComponents = [];

requiredComponents.forEach(component => {
  const componentPath = path.join(uiComponentsDir, component);
  if (fs.existsSync(componentPath)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - MANQUANT`);
    missingComponents.push(component);
  }
});

// Vérifier les layouts
const layoutsDir = 'src/components/layout';
const requiredLayouts = [
  'PublicLayout.tsx',
  'AuthLayout.tsx',
  'ClientLayout.tsx',
  'AdminLayout.tsx'
];

console.log('\n🏗️ Vérification des layouts...');
let missingLayouts = [];

requiredLayouts.forEach(layout => {
  const layoutPath = path.join(layoutsDir, layout);
  if (fs.existsSync(layoutPath)) {
    console.log(`✅ ${layout}`);
  } else {
    console.log(`❌ ${layout} - MANQUANT`);
    missingLayouts.push(layout);
  }
});

// Résumé
console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('================================');

const totalMissing = missingFiles.length + missingPages.length + missingComponents.length + missingLayouts.length;

if (totalMissing === 0) {
  console.log('🎉 Tous les fichiers sont présents !');
  console.log('✅ Configuration complète');
  console.log('✅ Prêt pour le développement');
  console.log('✅ Prêt pour le déploiement');
} else {
  console.log(`⚠️  ${totalMissing} fichier(s) manquant(s)`);
  
  if (missingFiles.length > 0) {
    console.log(`📁 Fichiers essentiels manquants: ${missingFiles.length}`);
  }
  if (missingPages.length > 0) {
    console.log(`📄 Pages manquantes: ${missingPages.length}`);
  }
  if (missingComponents.length > 0) {
    console.log(`🧩 Composants UI manquants: ${missingComponents.length}`);
  }
  if (missingLayouts.length > 0) {
    console.log(`🏗️ Layouts manquants: ${missingLayouts.length}`);
  }
}

console.log('\n🚀 Prochaines étapes:');
console.log('1. Configurer les variables d\'environnement (.env.local)');
console.log('2. Déployer le schéma Supabase');
console.log('3. Lancer l\'application: npm run dev');
console.log('4. Tester le workflow complet');

console.log('\n📚 Documentation: README.md');
console.log('🔧 Support: support@cryptoboost.world'); 