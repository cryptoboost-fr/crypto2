import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle,
  Star,
  DollarSign,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { utils } from '@/lib/supabase';
import { InvestmentPlan, UserInvestment } from '@/types';
import { useToast } from '@/components/ui/toaster';

export const Plans = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setPlans([
        {
          id: '1',
          name: 'Starter',
          description: 'Parfait pour débuter votre parcours d\'investissement',
          min_amount: 50,
          max_amount: 500,
          profit_target: 15,
          duration_days: 30,
          features: [
            'Investissement minimum: 50€',
            'Profit cible: 15%',
            'Durée: 30 jours',
            'Support email',
            'Rapports hebdomadaires'
          ],
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Pro',
          description: 'Pour les investisseurs sérieux qui veulent maximiser leurs gains',
          min_amount: 200,
          max_amount: 2000,
          profit_target: 25,
          duration_days: 45,
          features: [
            'Investissement minimum: 200€',
            'Profit cible: 25%',
            'Durée: 45 jours',
            'Support prioritaire',
            'Analyses avancées',
            'Rapports quotidiens',
            'Stratégies personnalisées'
          ],
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Expert',
          description: 'Performance maximale pour les investisseurs expérimentés',
          min_amount: 500,
          max_amount: 10000,
          profit_target: 35,
          duration_days: 60,
          features: [
            'Investissement minimum: 500€',
            'Profit cible: 35%',
            'Durée: 60 jours',
            'Support dédié',
            'Stratégies exclusives',
            'Consultation personnalisée',
            'Rapports en temps réel',
            'Accès VIP aux événements'
          ],
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ]);

      setUserInvestments([
        {
          id: '1',
          user_id: user?.id || '',
          plan_id: '2',
          amount: 500,
          profit_target: 125,
          current_profit: 45,
          status: 'active',
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          user_id: user?.id || '',
          plan_id: '1',
          amount: 100,
          profit_target: 15,
          current_profit: 8,
          status: 'completed',
          start_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [user?.id]);

  const handleInvest = () => {
    if (!selectedPlan || !investmentAmount) {
      toast('Veuillez sélectionner un plan et entrer un montant', 'error');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (amount < selectedPlan.min_amount || amount > selectedPlan.max_amount) {
      toast(`Le montant doit être entre ${utils.formatEUR(selectedPlan.min_amount)} et ${utils.formatEUR(selectedPlan.max_amount)}`, 'error');
      return;
    }

    if (amount > (user?.total_invested || 0)) {
      toast('Solde insuffisant pour cet investissement', 'error');
      return;
    }

    // Simulate investment creation
    toast('Investissement créé avec succès !', 'success');
    setInvestmentAmount('');
    setSelectedPlan(null);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <TrendingUp className="w-6 h-6" />;
      case 'expert':
        return <Star className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
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
        <h1 className="text-3xl font-bold">Packs d'Investissement</h1>
        <p className="text-muted-foreground">
          Choisissez le plan qui correspond à vos objectifs d'investissement
        </p>
      </motion.div>

      {/* User Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-crypto-primary to-crypto-secondary text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Solde disponible</p>
                <p className="text-2xl font-bold">{utils.formatEUR(user?.total_invested || 0)}</p>
              </div>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Investment Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`relative h-full ${plan.name === 'Pro' ? 'ring-2 ring-crypto-primary' : ''}`}>
              {plan.name === 'Pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-crypto-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    Populaire
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getPlanIcon(plan.name)}
                  <span>{plan.name}</span>
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profit cible</span>
                    <span className="font-bold text-green-600">{plan.profit_target}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Durée</span>
                    <span className="font-medium">{plan.duration_days} jours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Min/Max</span>
                    <span className="font-medium">
                      {utils.formatEUR(plan.min_amount)} - {utils.formatEUR(plan.max_amount)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Inclus :</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-sm text-muted-foreground">
                        +{plan.features.length - 3} autres avantages
                      </li>
                    )}
                  </ul>
                </div>

                {/* Invest Button */}
                <Button 
                  className="w-full" 
                  onClick={() => setSelectedPlan(plan)}
                >
                  Investir maintenant
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Investment Modal */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlan(null)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Investir dans {selectedPlan.name}</CardTitle>
              <CardDescription>
                Entrez le montant que vous souhaitez investir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Montant d'investissement</label>
                <Input
                  type="number"
                  placeholder={`Min: ${utils.formatEUR(selectedPlan.min_amount)}`}
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Montant entre {utils.formatEUR(selectedPlan.min_amount)} et {utils.formatEUR(selectedPlan.max_amount)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Profit cible:</span>
                  <span className="font-medium text-green-600">{selectedPlan.profit_target}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Durée:</span>
                  <span className="font-medium">{selectedPlan.duration_days} jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Profit estimé:</span>
                  <span className="font-medium">
                    {investmentAmount ? utils.formatEUR(parseFloat(investmentAmount) * selectedPlan.profit_target / 100) : '€0.00'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleInvest} className="flex-1">
                  Confirmer l'investissement
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedPlan(null)}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Investments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Mes Investissements</CardTitle>
            <CardDescription>
              Suivez vos investissements actifs et leur progression
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userInvestments.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun investissement actif</p>
                <p className="text-sm text-muted-foreground">
                  Commencez par investir dans un de nos packs ci-dessus
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userInvestments.map((investment) => {
                  const plan = plans.find(p => p.id === investment.plan_id);
                  const progress = (investment.current_profit / investment.profit_target) * 100;
                  const daysLeft = Math.ceil((new Date(investment.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={investment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{plan?.name} Pack</h4>
                          <p className="text-sm text-muted-foreground">
                            Investi le {utils.formatDate(investment.start_date)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                          {getStatusText(investment.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Montant investi:</span>
                          <span className="font-medium">{utils.formatEUR(investment.amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Profit actuel:</span>
                          <span className="font-medium text-green-600">
                            {utils.formatEUR(investment.current_profit)} / {utils.formatEUR(investment.profit_target)}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progression</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {investment.status === 'active' && (
                          <div className="flex justify-between text-sm">
                            <span>Temps restant:</span>
                            <span className="font-medium">{daysLeft} jours</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 