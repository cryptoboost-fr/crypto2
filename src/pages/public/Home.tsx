import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  Bot, 
  Settings, 
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Clock,
  Zap,
  BarChart3,
  DollarSign,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Home = () => {
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

  const testimonials = [
    {
      name: 'Marc D.',
      title: 'Entrepreneur à Paris',
      content: 'En 30 jours, mes 500€ sont devenus 680€. Interface d\'une simplicité déconcertante !',
      rating: 5,
    },
    {
      name: 'Sarah K.',
      title: 'Développeuse à Lyon',
      content: 'Le plan Expert m\'a permis de doubler mes gains crypto. Enfin une solution qui marche.',
      rating: 5,
    },
    {
      name: 'David R.',
      title: 'Investisseur à Tel Aviv',
      content: 'Plus besoin de surveiller 24h/24. CryptoBoost fait tout à ma place.',
      rating: 5,
    },
  ];

  const mediaLogos = ['TechCrunch', 'Les Échos', 'BFM Business', 'Crypto News'];

  const stats = [
    { number: '2,500+', label: 'Utilisateurs actifs' },
    { number: '87%', label: 'Trades gagnants' },
    { number: '24/7', label: 'Support client' },
    { number: '100K+', label: 'Transactions' },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '50€',
      description: 'Parfait pour débuter',
      features: ['Investissement minimum: 50€', 'Profit cible: 15%', 'Durée: 30 jours', 'Support email'],
      popular: false,
    },
    {
      name: 'Pro',
      price: '200€',
      description: 'Pour les investisseurs sérieux',
      features: ['Investissement minimum: 200€', 'Profit cible: 25%', 'Durée: 45 jours', 'Support prioritaire', 'Analyses avancées'],
      popular: true,
    },
    {
      name: 'Expert',
      price: '500€',
      description: 'Performance maximale',
      features: ['Investissement minimum: 500€', 'Profit cible: 35%', 'Durée: 60 jours', 'Support dédié', 'Stratégies exclusives', 'Consultation personnalisée'],
      popular: false,
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-crypto-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-crypto-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-crypto-accent/5 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                Maximisez vos profits avec{' '}
                <span className="text-gradient">l'Intelligence Artificielle</span>
              </motion.h1>

              <motion.h2
                className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                Trading automatisé sécurisé avec 87% de réussite. 
                Vos fonds restent sur vos comptes d'échange.
              </motion.h2>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link to="/auth/register">
                  <Button size="lg" variant="gradient" className="text-lg px-8 py-4">
                    Commencer maintenant
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    En savoir plus
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
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

      {/* Plans Section */}
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
              Plans d'investissement
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos objectifs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full relative ${plan.popular ? 'ring-2 ring-crypto-primary' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-crypto-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                        Populaire
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-gradient">{plan.price}</div>
                    <CardDescription className="text-lg">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-crypto-success flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/auth/register">
                      <Button variant="gradient" className="w-full">
                        Commencer
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les témoignages de nos utilisateurs satisfaits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à maximiser vos profits ?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Rejoignez des milliers d'investisseurs qui font confiance à CryptoBoost
            </p>
            <Link to="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Commencer gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 