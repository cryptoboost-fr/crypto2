import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Save,
  Shield,
  Bell,
  Globe,
  Database,
  Key,
  Users,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'CryptoBoost',
    siteDescription: 'Plateforme de trading automatisé',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxInvestmentAmount: 10000,
    minInvestmentAmount: 50,
    transactionFee: 0.1,
    supportEmail: 'support@cryptoboost.world'
  });

  const handleSave = () => {
    // Simulate save
    console.log('Settings saved:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">
              Configurez les paramètres de la plateforme
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </motion.div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Paramètres Généraux</span>
            </CardTitle>
            <CardDescription>
              Configuration générale de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nom du site</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium">
                Mode maintenance
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="registrationEnabled"
                checked={settings.registrationEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="registrationEnabled" className="text-sm font-medium">
                Inscriptions autorisées
              </label>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Financial Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Paramètres Financiers</span>
            </CardTitle>
            <CardDescription>
              Configuration des montants et frais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Montant minimum (€)</label>
                <Input
                  type="number"
                  value={settings.minInvestmentAmount}
                  onChange={(e) => setSettings(prev => ({ ...prev, minInvestmentAmount: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Montant maximum (€)</label>
                <Input
                  type="number"
                  value={settings.maxInvestmentAmount}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxInvestmentAmount: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frais de transaction (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.transactionFee}
                  onChange={(e) => setSettings(prev => ({ ...prev, transactionFee: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Support Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Support Client</span>
            </CardTitle>
            <CardDescription>
              Informations de contact du support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email support</label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                />
              </div>

            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configuration des notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="emailNotifications" className="text-sm font-medium">
                Notifications par email
              </label>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 