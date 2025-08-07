import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Download, 
  Upload, 
  QrCode,
  CheckCircle,
  AlertCircle,
  Clock,
  Wallet as WalletIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { utils } from '@/lib/supabase';
import { CryptoWallet, Transaction } from '@/types';
import { useToast } from '@/components/ui/toaster';

export const Wallet = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setWallets([
        {
          id: '1',
          crypto_type: 'BTC',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          crypto_type: 'ETH',
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          crypto_type: 'USDT',
          address: 'TQn9Y2khDD95J42FQtQTdwVVRZqjqH3q6B',
          qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TQn9Y2khDD95J42FQtQTdwVVRZqjqH3q6B',
          is_active: true,
          created_at: new Date().toISOString(),
        },
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

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast('Adresse copiée !', 'success');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawAddress || !selectedCrypto) {
      toast('Veuillez remplir tous les champs', 'error');
      return;
    }

    // Simulate withdrawal request
    toast('Demande de retrait envoyée !', 'success');
    setWithdrawAmount('');
    setWithdrawAddress('');
    setSelectedCrypto('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
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
        <h1 className="text-3xl font-bold">Wallet Crypto</h1>
        <p className="text-muted-foreground">
          Gérez vos dépôts et retraits de cryptomonnaies
        </p>
      </motion.div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <WalletIcon className="w-5 h-5" />
                  <span>{wallet.crypto_type}</span>
                </CardTitle>
                <CardDescription>
                  Adresse de dépôt pour {wallet.crypto_type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <img 
                    src={wallet.qr_code_url} 
                    alt={`QR Code ${wallet.crypto_type}`}
                    className="w-32 h-32 border rounded-lg"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse de dépôt</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={wallet.address}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyAddress(wallet.address)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Dépôt
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedCrypto(wallet.crypto_type)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Retrait
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Withdrawal Form */}
      {selectedCrypto && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Retrait {selectedCrypto}</CardTitle>
              <CardDescription>
                Retirez vos {selectedCrypto} vers votre wallet externe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Montant</label>
                <Input
                  type="number"
                  placeholder="0.00000000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Adresse de destination</label>
                <Input
                  placeholder={`Adresse ${selectedCrypto}`}
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleWithdraw} className="flex-1">
                  Demander le retrait
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCrypto('')}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Transactions Récentes</CardTitle>
            <CardDescription>
              Historique de vos dépôts et retraits
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
                          <Download className="w-5 h-5" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'} {transaction.crypto_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {utils.formatCryptoAmount(transaction.amount, transaction.crypto_type, transaction.usd_value)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        <span className={`text-sm font-medium ${
                          transaction.status === 'approved' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getStatusText(transaction.status)}
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
    </div>
  );
}; 