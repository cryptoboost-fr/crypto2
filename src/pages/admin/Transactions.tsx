import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download, 
  Upload,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { utils } from '@/lib/supabase';
import { Transaction, User } from '@/types';
import { useToast } from '@/components/ui/toaster';

export const Transactions = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          email: 'john@example.com',
          full_name: 'John Doe',
          role: 'client',
          status: 'active',
          total_invested: 1500,
          total_profit: 250,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'jane@example.com',
          full_name: 'Jane Smith',
          role: 'client',
          status: 'active',
          total_invested: 800,
          total_profit: 120,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);

      setTransactions([
        {
          id: '1',
          user_id: '1',
          type: 'deposit',
          crypto_type: 'BTC',
          amount: 0.002,
          usd_value: 1000,
          status: 'pending',
          fee_amount: 0.00001,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          user_id: '2',
          type: 'withdrawal',
          crypto_type: 'ETH',
          amount: 1.5,
          usd_value: 600,
          status: 'pending',
          fee_amount: 0.005,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          user_id: '1',
          type: 'deposit',
          crypto_type: 'USDT',
          amount: 500,
          usd_value: 500,
          status: 'approved',
          fee_amount: 1,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          user_id: '2',
          type: 'withdrawal',
          crypto_type: 'BTC',
          amount: 0.001,
          usd_value: 500,
          status: 'rejected',
          fee_amount: 0.00001,
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = (transactionId: string) => {
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: 'approved', updated_at: new Date().toISOString() }
          : t
      )
    );
    toast('Transaction approuvée !', 'success');
    setSelectedTransaction(null);
  };

  const handleReject = (transactionId: string) => {
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: 'rejected', updated_at: new Date().toISOString() }
          : t
      )
    );
    toast('Transaction rejetée !', 'success');
    setSelectedTransaction(null);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name : 'Utilisateur inconnu';
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'N/A';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'deposit' ? (
      <Download className="w-4 h-4 text-green-600" />
    ) : (
      <Upload className="w-4 h-4 text-orange-600" />
    );
  };

  const getTypeText = (type: string) => {
    return type === 'deposit' ? 'Dépôt' : 'Retrait';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = getUserName(transaction.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.crypto_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const rejectedCount = transactions.filter(t => t.status === 'rejected').length;

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
        <h1 className="text-3xl font-bold">Gestion des Transactions</h1>
        <p className="text-muted-foreground">
          Validez les dépôts et retraits des utilisateurs
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">En attente</p>
                  <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Approuvées</p>
                  <p className="text-2xl font-bold text-green-800">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Rejetées</p>
                  <p className="text-2xl font-bold text-red-800">{rejectedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par utilisateur ou crypto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Tous les types</option>
                  <option value="deposit">Dépôt</option>
                  <option value="withdrawal">Retrait</option>
                </select>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
            <CardDescription>
              Liste des transactions en attente de validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune transaction trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {getTypeText(transaction.type)} {transaction.crypto_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getUserName(transaction.user_id)} • {getUserEmail(transaction.user_id)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {utils.formatCryptoAmount(transaction.amount, transaction.crypto_type, transaction.usd_value)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`text-sm font-medium ${
                            transaction.status === 'approved' ? 'text-green-600' :
                            transaction.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {getStatusText(transaction.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {utils.formatDate(transaction.created_at)}
                        </p>
                        {transaction.status === 'pending' && (
                          <div className="flex space-x-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Voir
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getTypeIcon(selectedTransaction.type)}
                <span>Détails de la transaction</span>
              </CardTitle>
              <CardDescription>
                {getTypeText(selectedTransaction.type)} {selectedTransaction.crypto_type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Utilisateur:</span>
                  <span className="text-sm">{getUserName(selectedTransaction.user_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{getUserEmail(selectedTransaction.user_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Montant:</span>
                  <span className="text-sm font-medium">
                    {utils.formatCryptoAmount(selectedTransaction.amount, selectedTransaction.crypto_type, selectedTransaction.usd_value)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Frais:</span>
                  <span className="text-sm">
                    {utils.formatCryptoAmount(selectedTransaction.fee_amount, selectedTransaction.crypto_type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm">{utils.formatDate(selectedTransaction.created_at)}</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Action requise</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Cette transaction nécessite votre validation. Vérifiez les détails avant de prendre une décision.
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleApprove(selectedTransaction.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleReject(selectedTransaction.id)}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}; 