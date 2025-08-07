import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { utils } from '@/lib/supabase';
import { InvestmentPlan } from '@/types';

export const InvestmentPlans = () => {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setPlans([
        {
          id: '1',
          name: 'Starter',
          description: 'Plan parfait pour débuter dans le trading automatisé',
          min_amount: 50,
          max_amount: 199.99,
          profit_target: 15,
          duration_days: 30,
          features: ['Investissement minimum: 50€', 'Profit cible: 15%', 'Durée: 30 jours', 'Support email'],
          is_active: true,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Pro',
          description: 'Plan pour les investisseurs sérieux avec des performances optimisées',
          min_amount: 200,
          max_amount: 499.99,
          profit_target: 25,
          duration_days: 45,
          features: ['Investissement minimum: 200€', 'Profit cible: 25%', 'Durée: 45 jours', 'Support prioritaire', 'Analyses avancées'],
          is_active: true,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Expert',
          description: 'Plan premium avec les meilleures stratégies et support dédié',
          min_amount: 500,
          max_amount: undefined,
          profit_target: 35,
          duration_days: 60,
          features: ['Investissement minimum: 500€', 'Profit cible: 35%', 'Durée: 60 jours', 'Support dédié', 'Stratégies exclusives', 'Consultation personnalisée'],
          is_active: true,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (planId: string) => {
    setPlans(prev => 
      prev.map(plan => 
        plan.id === planId 
          ? { ...plan, is_active: !plan.is_active }
          : plan
      )
    );
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== planId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crypto-primary"></div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">Gestion des Plans</h1>
            <p className="text-muted-foreground">
              Gérez les plans d'investissement de la plateforme
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Plan
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{plans.length}</div>
              <p className="text-xs text-muted-foreground">Total Plans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{plans.filter(p => p.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Plans Actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{plans.filter(p => !p.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Plans Inactifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{utils.formatEUR(plans.reduce((sum, p) => sum + p.min_amount, 0))}</div>
              <p className="text-xs text-muted-foreground">Capital Minimum</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un plan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Plans List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Plans d'Investissement ({filteredPlans.length})</CardTitle>
            <CardDescription>
              Liste des plans disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-crypto-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{plan.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{plan.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          plan.is_active 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {plan.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Min: {utils.formatEUR(plan.min_amount)}</span>
                        {plan.max_amount && <span>Max: {utils.formatEUR(plan.max_amount)}</span>}
                        <span>Profit: {plan.profit_target}%</span>
                        <span>Durée: {plan.duration_days} jours</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPlan(plan)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(plan.id)}
                    >
                      {plan.is_active ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 