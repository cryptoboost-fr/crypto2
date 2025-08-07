import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="main-content" role="main" aria-label="Contenu principal">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}; 