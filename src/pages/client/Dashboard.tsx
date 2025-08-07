import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { utils } from '@/lib/supabase';
import { UserInvestment, Transaction } from '@/types';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setInvestments([
        {
          id: '1',
          user_id: user?.id || '',
          plan_id: '1',
          amount: 500,
          profit_target: 575,
          current_profit: 520,
          status: 'active',
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          user_id: user?.id || '',
          plan_id: '2',
          amount: 200,
          profit_target: 250,
          current_profit: 210,
          status: 'active',
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]);

      setTransactions([
        {
          id: '1',
          user_id: user?.id || '',
          type: 'deposit',
          crypto_type: 'BTC',
          amount: 0.001,
          usd_value: 500,
          status: 'approved',
          fee_amount: 0.00001,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          user_id: user?.id || '',
          type: 'withdrawal',
          crypto_type: 'ETH',
          amount: 0.5,
          usd_value: 200,
          status: 'pending',
          fee_amount: 0.005,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]);

      setLoading(false);
    }, 1000);
  }, [user?.id]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfit = investments.reduce((sum, inv) => sum + inv.current_profit, 0);
  const profitPercentage = totalInvested > 0 ? ((totalProfit - totalInvested) / totalInvested) * 100 : 0;
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;

  const stats = [
    {
      title: 'Solde Total',
      value: utils.formatEUR(user?.total_invested || 0),
      change: '+4.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Profit Total',
      value: utils.formatEUR(user?.total_profit || 0),
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Investissements Actifs',
      value: activeInvestments.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Activity,
    },
    {
      title: 'Transactions en Attente',
      value: pendingTransactions.toString(),
      change: '0',
      changeType: 'neutral' as const,
      icon: Clock,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crypto-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Bonjour, {user?.full_name?.split(' ')[0]} !</h1>
        <p className="text-muted-foreground">
          Voici un aperçu de vos investissements et de votre activité
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : stat.changeType === 'negative' as any ? (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  ) : null}
                  {stat.change} depuis le mois dernier
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Investments Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Vos Investissements</CardTitle>
            <CardDescription>
              Aperçu de vos investissements actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun investissement actif</p>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Investissement #{investment.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {utils.formatEUR(investment.amount)} • {utils.formatEUR(investment.profit_target)} cible
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {utils.formatEUR(investment.current_profit)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {((investment.current_profit - investment.amount) / investment.amount * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transactions Récentes</CardTitle>
            <CardDescription>
              Vos dernières transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune transaction récente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'deposit' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {utils.formatCryptoAmount(transaction.amount, transaction.crypto_type, transaction.usd_value)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {transaction.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : transaction.status === 'pending' ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          transaction.status === 'approved' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {transaction.status === 'approved' ? 'Approuvé' :
                           transaction.status === 'pending' ? 'En attente' : 'Rejeté'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {utils.formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>
              Évolution de vos investissements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Graphique de performance à venir</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 