import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { utils } from '@/lib/supabase';
import { useToast } from '@/components/ui/toaster';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export const Exchange = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [fromCrypto, setFromCrypto] = useState('BTC');
  const [toCrypto, setToCrypto] = useState('ETH');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [estimatedAmount, setEstimatedAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<CryptoPrice[]>([]);

  // Mock crypto prices
  useEffect(() => {
    setPrices([
      { symbol: 'BTC', price: 45000, change24h: 2.5, volume24h: 25000000000 },
      { symbol: 'ETH', price: 3200, change24h: -1.2, volume24h: 15000000000 },
      { symbol: 'USDT', price: 1, change24h: 0.01, volume24h: 50000000000 },
      { symbol: 'USDC', price: 1, change24h: 0.02, volume24h: 30000000000 },
      { symbol: 'LTC', price: 120, change24h: 3.1, volume24h: 2000000000 },
    ]);
  }, []);

  // Calculate exchange rate
  useEffect(() => {
    const fromPrice = prices.find(p => p.symbol === fromCrypto)?.price || 0;
    const toPrice = prices.find(p => p.symbol === toCrypto)?.price || 0;
    
    if (fromPrice && toPrice) {
      const rate = toPrice / fromPrice;
      setExchangeRate(rate);
      
      if (amount) {
        const estimated = parseFloat(amount) * rate;
        setEstimatedAmount(estimated);
      }
    }
  }, [fromCrypto, toCrypto, amount, prices]);

  const handleExchange = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast('Veuillez entrer un montant valide', 'error');
      return;
    }

    if (fromCrypto === toCrypto) {
      toast('Vous ne pouvez pas échanger la même crypto', 'error');
      return;
    }

    setLoading(true);
    
    // Simulate exchange
    setTimeout(() => {
      toast('Échange effectué avec succès !', 'success');
      setAmount('');
      setEstimatedAmount(0);
      setLoading(false);
    }, 2000);
  };

  const handleSwap = () => {
    const temp = fromCrypto;
    setFromCrypto(toCrypto);
    setToCrypto(temp);
  };

  const getPriceChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPriceChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Échange Crypto</h1>
        <p className="text-muted-foreground">
          Échangez vos cryptomonnaies en temps réel
        </p>
      </motion.div>

      {/* Exchange Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Effectuer un échange</CardTitle>
            <CardDescription>
              Taux de change en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vous envoyez</label>
              <div className="flex space-x-2">
                <select
                  value={fromCrypto}
                  onChange={(e) => setFromCrypto(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm flex-1"
                >
                  {prices.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="0.00000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Prix: {utils.formatEUR(prices.find(p => p.symbol === fromCrypto)?.price || 0)}
              </p>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwap}
                className="rounded-full w-10 h-10 p-0"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vous recevez</label>
              <div className="flex space-x-2">
                <select
                  value={toCrypto}
                  onChange={(e) => setToCrypto(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm flex-1"
                >
                  {prices.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.symbol}
                    </option>
                  ))}
                </select>
                <Input
                  value={estimatedAmount.toFixed(8)}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Prix: {utils.formatEUR(prices.find(p => p.symbol === toCrypto)?.price || 0)}
              </p>
            </div>

            {/* Exchange Rate */}
            {exchangeRate > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Taux de change</span>
                  <span className="text-sm">
                    1 {fromCrypto} = {exchangeRate.toFixed(8)} {toCrypto}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Frais d'échange</span>
                  <span className="text-sm text-muted-foreground">0.1%</span>
                </div>
              </div>
            )}

            {/* Exchange Button */}
            <Button 
              onClick={handleExchange}
              disabled={loading || !amount || fromCrypto === toCrypto}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Effectuer l'échange
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Market Prices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Prix du Marché</CardTitle>
            <CardDescription>
              Prix en temps réel des principales cryptomonnaies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prices.map((crypto) => (
                <div key={crypto.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-crypto-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{crypto.symbol}</span>
                    </div>
                    <div>
                      <p className="font-medium">{crypto.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        Vol: {utils.formatCurrency(crypto.volume24h / 1000000)}M
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{utils.formatEUR(crypto.price)}</p>
                    <div className="flex items-center space-x-1">
                      {getPriceChangeIcon(crypto.change24h)}
                      <span className={`text-sm ${getPriceChangeColor(crypto.change24h)}`}>
                        {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Exchanges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Échanges Récents</CardTitle>
            <CardDescription>
              Historique de vos derniers échanges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">BTC → ETH</p>
                    <p className="text-sm text-muted-foreground">
                      0.001 BTC → 0.032 ETH
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Terminé</p>
                  <p className="text-sm text-muted-foreground">
                    {utils.formatDate(new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">ETH → USDT</p>
                    <p className="text-sm text-muted-foreground">
                      0.5 ETH → 1600 USDT
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Terminé</p>
                  <p className="text-sm text-muted-foreground">
                    {utils.formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}; 