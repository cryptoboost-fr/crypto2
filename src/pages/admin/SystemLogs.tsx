import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Search, 
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { utils } from '@/lib/supabase';
import { SystemLog } from '@/types';

export const SystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setLogs([
        {
          id: '1',
          user_id: 'user1',
          action: 'user_login',
          details: { ip: '192.168.1.1', user_agent: 'Mozilla/5.0...' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          user_id: 'user2',
          action: 'transaction_created',
          details: { amount: 500, crypto_type: 'BTC', type: 'deposit' },
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          user_id: undefined,
          action: 'system_error',
          details: { error: 'Database connection timeout', severity: 'high' },
          ip_address: '127.0.0.1',
          user_agent: 'System/1.0',
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          user_id: 'admin1',
          action: 'admin_action',
          details: { action: 'user_banned', target_user: 'user3' },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_login':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'transaction_created':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'system_error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'admin_action':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'user_login':
        return 'text-green-600 bg-green-100';
      case 'transaction_created':
        return 'text-blue-600 bg-blue-100';
      case 'system_error':
        return 'text-red-600 bg-red-100';
      case 'admin_action':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'user_login':
        return 'Connexion utilisateur';
      case 'transaction_created':
        return 'Transaction créée';
      case 'system_error':
        return 'Erreur système';
      case 'admin_action':
        return 'Action admin';
      default:
        return action;
    }
  };

  const filteredLogs = logs.filter((log: SystemLog) => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

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
            <h1 className="text-3xl font-bold">Logs Système</h1>
            <p className="text-muted-foreground">
              Surveillez l'activité de la plateforme
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
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
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">Total Logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{logs.filter(l => l.action === 'user_login').length}</div>
              <p className="text-xs text-muted-foreground">Connexions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{logs.filter(l => l.action === 'system_error').length}</div>
              <p className="text-xs text-muted-foreground">Erreurs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{logs.filter(l => l.action === 'admin_action').length}</div>
              <p className="text-xs text-muted-foreground">Actions Admin</p>
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
                    placeholder="Rechercher dans les logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={actionFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActionFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">Toutes les actions</option>
                  <option value="user_login">Connexions</option>
                  <option value="transaction_created">Transactions</option>
                  <option value="system_error">Erreurs</option>
                  <option value="admin_action">Actions Admin</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Logs Système ({filteredLogs.length})</CardTitle>
            <CardDescription>
              Historique des activités système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log: SystemLog) => (
                <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-4">
                    {getActionIcon(log.action)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{getActionText(log.action)}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        IP: {log.ip_address} • {log.user_agent?.substring(0, 50)}...
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Détails: {JSON.stringify(log.details)}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {utils.formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
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