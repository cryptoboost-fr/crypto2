import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MapPin, Send } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Contactez-nous</h1>
        <p className="text-muted-foreground">
          Nous sommes là pour vous aider
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Envoyez-nous un message</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom complet</label>
                <Input placeholder="Votre nom" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="votre@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Sujet</label>
                <Input placeholder="Sujet de votre message" />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea 
                  className="w-full p-3 border rounded-md resize-none"
                  rows={5}
                  placeholder="Votre message..."
                />
              </div>
              <Button className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Envoyer le message
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
              <CardDescription>
                Nos coordonnées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-crypto-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@cryptoboost.world</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-crypto-primary" />
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">
                    123 Rue de la Crypto<br />
                    75001 Paris, France
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}; 