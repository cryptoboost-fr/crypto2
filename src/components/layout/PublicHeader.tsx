import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronDown,
  Zap,
  Shield,
  TrendingUp,
  Bot
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';

export const PublicHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Fonctionnement', href: '/about' },
    { name: 'Plans', href: '/plans' },
    { name: 'Contact', href: '/contact' },
  ];

  const features = [
    {
      name: 'Sécurité maximale',
      description: 'Vos fonds restent sur vos comptes d\'échange',
      icon: Shield,
      href: '/about#security',
    },
    {
      name: 'Performance prouvée',
      description: '87% de réussite sur 100,000+ transactions',
      icon: TrendingUp,
      href: '/about#performance',
    },
    {
      name: 'IA nouvelle génération',
      description: 'Détection d\'opportunités en temps réel',
      icon: Bot,
      href: '/about#ai',
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">CryptoBoost</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Features Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsFeaturesOpen(true)}
                onMouseLeave={() => setIsFeaturesOpen(false)}
                className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <span>Fonctionnalités</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isFeaturesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseEnter={() => setIsFeaturesOpen(true)}
                  onMouseLeave={() => setIsFeaturesOpen(false)}
                  className="absolute top-full left-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-4"
                >
                  <div className="grid gap-4">
                    {features.map((feature) => (
                      <Link
                        key={feature.name}
                        to={feature.href}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-medium text-foreground">{feature.name}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'}>
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/client/profile">
                  <Button variant="gradient" size="sm">
                    Mon Compte
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="gradient" size="sm">
                    Commencer
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.href
                      ? 'text-primary bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Features */}
              <div className="px-3 py-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Fonctionnalités</h3>
                {features.map((feature) => (
                  <Link
                    key={feature.name}
                    to={feature.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span>{feature.name}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <Link to={user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/client/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="gradient" className="w-full">
                        Mon Compte
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="gradient" className="w-full">
                        Commencer
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </nav>
    </header>
  );
}; 