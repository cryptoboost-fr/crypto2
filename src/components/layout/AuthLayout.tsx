import React from 'react';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-crypto-primary to-crypto-secondary rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">CryptoBoost</span>
            </Link>
          </div>

          {/* Auth Content */}
          <Outlet />
        </div>
      </div>

      {/* Right Side - Background */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-crypto-primary/20 to-crypto-secondary/20">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm"></div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-crypto-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crypto-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-crypto-accent/5 rounded-full blur-3xl animate-spin-slow"></div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white space-y-6 max-w-md">
            <h2 className="text-3xl font-bold">
              Rejoignez la révolution du trading IA
            </h2>
            <p className="text-lg text-white/80">
              Maximisez vos profits avec notre intelligence artificielle de pointe. 
              Sécurisé, automatisé, performant.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">87%</div>
                <div className="text-sm text-white/70">Taux de réussite</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">100K+</div>
                <div className="text-sm text-white/70">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-white/70">Surveillance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 