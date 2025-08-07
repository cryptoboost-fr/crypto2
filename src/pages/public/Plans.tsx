import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Star } from 'lucide-react';

export const Plans = () => {
  const plans = [
    {
      name: 'Starter',
      price: '50€',
      description: 'Parfait pour débuter',
      features: [
        'Investissement minimum: 50€',
        'Profit cible: 15%',
        'Durée: 30 jours',
        'Support email'
      ],
      popular: false,
    },
    {
      name: 'Pro',
      price: '200€',
      description: 'Pour les investisseurs sérieux',
      features: [
        'Investissement minimum: 200€',
        'Profit cible: 25%',
        'Durée: 45 jours',
        'Support prioritaire',
        'Analyses avancées'
      ],
      popular: true,
    },
    {
      name: 'Expert',
      price: '500€',
      description: 'Performance maximale',
      features: [
        'Investissement minimum: 500€',
        'Profit cible: 35%',
        'Durée: 60 jours',
        'Support dédié',
        'Stratégies exclusives',
        'Consultation personnalisée'
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Nos Plans d'Investissement</h1>
        <p className="text-muted-foreground">
          Choisissez le plan qui correspond à vos objectifs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`relative h-full ${plan.popular ? 'ring-2 ring-crypto-primary' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-crypto-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    Populaire
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">{plan.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6">
                  Commencer maintenant
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 