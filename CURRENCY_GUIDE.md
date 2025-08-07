# Guide de Gestion des Monnaies - CryptoBoost

## 🎯 **Monnaie de Référence : Euro (EUR)**

CryptoBoost utilise l'**Euro (EUR)** comme monnaie de référence pour tous les soldes et montants affichés à l'utilisateur.

## 📊 **Structure des Données**

### **Tables avec Montants en EUR**

#### `users`
- `total_invested` DECIMAL(15,2) - **Montant en EUR**
- `total_profit` DECIMAL(15,2) - **Montant en EUR**

#### `investment_plans`
- `min_amount` DECIMAL(15,2) - **Montant minimum en EUR**
- `max_amount` DECIMAL(15,2) - **Montant maximum en EUR**

#### `user_investments`
- `amount` DECIMAL(15,2) - **Montant investi en EUR**
- `profit_target` DECIMAL(15,2) - **Objectif de profit en EUR**
- `current_profit` DECIMAL(15,2) - **Profit actuel en EUR**

#### `transactions`
- `amount` DECIMAL(15,8) - **Montant en crypto**
- `usd_value` DECIMAL(15,2) - **Valeur équivalente en EUR**
- `fee_amount` DECIMAL(15,8) - **Frais en crypto**

## 💰 **Fonctions de Formatage**

### **Utils disponibles dans `src/lib/supabase.ts`**

```typescript
// Formatage EUR par défaut
utils.formatCurrency(amount) // €1,234.56

// Formatage EUR spécifique
utils.formatEUR(amount) // €1,234.56

// Formatage balance simple
utils.formatBalance(amount) // €1,234.56

// Formatage crypto avec équivalent EUR
utils.formatCryptoAmount(0.001, 'BTC', 500) // 0.00100000 BTC (€500,00)
```

## 🎨 **Affichage dans l'Interface**

### **Header Client**
```typescript
// Solde et Profit en EUR
<span>Solde: {utils.formatEUR(user?.total_invested || 0)}</span>
<span>Profit: {utils.formatEUR(user?.total_profit || 0)}</span>
```

### **Dashboard**
```typescript
// Statistiques en EUR
{
  title: 'Solde Total',
  value: utils.formatEUR(user?.total_invested || 0),
}

// Investissements en EUR
{utils.formatEUR(investment.amount)} • {utils.formatEUR(investment.profit_target)} cible
```

### **Transactions**
```typescript
// Montant crypto avec équivalent EUR
{utils.formatCryptoAmount(transaction.amount, transaction.crypto_type, transaction.usd_value)}
// Affiche: 0.00100000 BTC (€500,00)
```

## 🔄 **Conversion Crypto → EUR**

### **Processus de Conversion**

1. **Dépôt** : L'utilisateur envoie des cryptos
2. **Conversion** : Le montant crypto est converti en EUR au taux du moment
3. **Stockage** : La valeur EUR est stockée dans `usd_value`
4. **Affichage** : L'interface montre le montant crypto + équivalent EUR

### **Exemple**
```
Dépôt: 0.001 BTC
Taux: 1 BTC = €50,000
Stockage: amount = 0.001, usd_value = 500.00
Affichage: "0.00100000 BTC (€500,00)"
```

## 📱 **Pages Publiques**

### **Plans d'Investissement**
```typescript
const plans = [
  {
    name: 'Starter',
    price: '50€', // Prix en EUR
    min_amount: 50, // Montant minimum en EUR
  }
];
```

## 🛡️ **Sécurité et Validation**

### **Validation des Montants**
- Tous les montants EUR sont validés côté client et serveur
- Les montants crypto sont limités à 8 décimales
- Les montants EUR sont limités à 2 décimales

### **Formatage Sécurisé**
```typescript
// Évite les problèmes de précision
utils.formatEUR(amount) // Utilise Intl.NumberFormat
```

## 🌍 **Internationalisation**

### **Format Français**
```typescript
// Format: 1 234,56 €
new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
```

## 📋 **Checklist de Vérification**

- [ ] Tous les soldes affichés en EUR
- [ ] Tous les profits affichés en EUR
- [ ] Plans d'investissement en EUR
- [ ] Transactions avec équivalent EUR
- [ ] Formatage cohérent dans toute l'app
- [ ] Validation des montants EUR
- [ ] Documentation des fonctions de formatage

## 🚀 **Bonnes Pratiques**

1. **Toujours utiliser** `utils.formatEUR()` pour afficher les montants EUR
2. **Toujours utiliser** `utils.formatCryptoAmount()` pour les montants crypto
3. **Valider** les montants côté client et serveur
4. **Documenter** les conversions de taux
5. **Tester** l'affichage sur différents navigateurs

---

**Note** : Cette configuration garantit une expérience utilisateur cohérente avec l'Euro comme monnaie de référence, tout en conservant la flexibilité pour les transactions crypto. 