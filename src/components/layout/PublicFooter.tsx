import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
 
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github
} from 'lucide-react';

export const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produit: [
      { name: 'Fonctionnement', href: '/about' },
      { name: 'Plans d\'investissement', href: '/plans' },
      { name: 'Sécurité', href: '/about#security' },
      { name: 'API', href: '/api' },
    ],
    support: [
      { name: 'Centre d\'aide', href: '/help' },
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Statut', href: '/status' },
    ],
    entreprise: [
      { name: 'À propos', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Carrières', href: '/careers' },
      { name: 'Presse', href: '/press' },
    ],
    legal: [
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Licences', href: '/licenses' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/cryptoboost' },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/cryptoboost' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/cryptoboost' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/cryptoboost' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/cryptoboost' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">CryptoBoost</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Maximisez vos profits avec l'Intelligence Artificielle. 
              Trading automatisé sécurisé et performant.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contact@cryptoboost.world</span>
              </div>

              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Paris, France</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Produit</h3>
            <ul className="space-y-3">
              {footerLinks.produit.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {footerLinks.entreprise.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-sm text-muted-foreground">
                © {currentYear} CryptoBoost. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 