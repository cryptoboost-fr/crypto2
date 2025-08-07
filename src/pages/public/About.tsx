import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  Bot, 
  Settings, 
  CheckCircle,
  Users,
  Award,
  Clock,
  Zap,
  BarChart3,
  DollarSign,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Sécurité maximale',
      description: 'Vos fonds restent sur vos comptes d\'échange. Nos bots n\'ont jamais accès à vos retraits.',
    },
    {
      icon: TrendingUp,
      title: 'Performance prouvée',
      description: 'Stratégies testées sur plus de 100,000 transactions avec 87% de réussite.',
    },
    {
      icon: Bot,
      title: 'IA nouvelle génération',
      description: 'Notre intelligence artificielle détecte les opportunités d\'arbitrage en temps réel.',
    },
    {
      icon: Settings,
      title: 'Automatisation totale',
      description: 'Activez → relaxez → observez vos gains croître automatiquement.',
    },
  ];

  const stats = [
    { number: '2,500+', label: 'Utilisateurs actifs' },
    { number: '87%', label: 'Trades gagnants' },
    { number: '24/7', label: 'Support client' },
    { number: '100K+', label: 'Transactions' },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              À propos de CryptoBoost
            </h1>
            <p className="text-xl text-white/80 mb-8">
              La révolution du trading automatisé avec Intelligence Artificielle
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-white/70">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Notre Mission
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Démocratiser l'accès au trading automatisé de haute performance en utilisant 
              les dernières avancées en Intelligence Artificielle.
            </p>
            <p className="text-lg text-muted-foreground">
              Chez CryptoBoost, nous croyons que tout le monde devrait pouvoir bénéficier 
              des opportunités du marché crypto, sans avoir besoin de passer des heures 
              à analyser les graphiques ou à surveiller les prix.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir CryptoBoost ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une solution complète pour maximiser vos profits crypto en toute sécurité
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Notre Technologie
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme de pointe utilisant les dernières innovations en IA et trading
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">Intelligence Artificielle Avancée</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Algorithmes de machine learning pour la détection de patterns</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Analyse en temps réel des données de marché</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Optimisation continue des stratégies de trading</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Gestion automatique des risques</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">Infrastructure Sécurisée</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Serveurs haute performance avec redondance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Chiffrement de bout en bout des données</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Surveillance 24/7 des systèmes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-crypto-success mt-0.5 flex-shrink-0" />
                  <span>Conformité aux standards de sécurité</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Notre Équipe
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des experts en trading, IA et développement qui partagent votre passion pour l'innovation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Alexandre Dubois',
                role: 'CEO & Fondateur',
                description: 'Expert en trading algorithmique avec 10+ ans d\'expérience',
              },
              {
                name: 'Marie Chen',
                role: 'CTO',
                description: 'Spécialiste en IA et machine learning, ancienne Google',
              },
              {
                name: 'Thomas Moreau',
                role: 'Head of Trading',
                description: 'Trader professionnel avec expertise en crypto et DeFi',
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center">
                  <CardHeader>
                    <div className="w-20 h-20 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-lg font-medium text-crypto-primary">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}; 