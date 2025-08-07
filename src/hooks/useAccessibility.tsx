import React, { useEffect, useCallback } from 'react';

interface AccessibilityOptions {
  skipLinkTarget?: string;
  announcements?: boolean;
  keyboardNavigation?: boolean;
  contrastMode?: boolean;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    skipLinkTarget = 'main-content',
    announcements = true,
    keyboardNavigation = true,
    contrastMode = false
  } = options;

  // Fonction pour annoncer du contenu aux lecteurs d'écran
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcements) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Nettoyer après 1 seconde
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, [announcements]);

  // Gestion de la navigation au clavier
  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Échapper pour fermer les modales/dropdowns
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        const activeDropdown = document.querySelector('[aria-expanded="true"]');
        
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="fermer"], [aria-label*="close"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        } else if (activeDropdown instanceof HTMLElement) {
          activeDropdown.click();
        }
      }

      // Navigation avec les flèches dans les groupes de boutons
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const target = e.target as HTMLElement;
        const group = target.closest('[role="group"], [role="radiogroup"], [role="tablist"]');
        
        if (group) {
          e.preventDefault();
          const focusableElements = Array.from(
            group.querySelectorAll('button:not([disabled]), [role="tab"]:not([disabled])')
          ) as HTMLElement[];
          
          const currentIndex = focusableElements.indexOf(target);
          let nextIndex: number;

          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % focusableElements.length;
          } else {
            nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1;
          }

          focusableElements[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigation]);

  // Mode contraste élevé
  useEffect(() => {
    if (contrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [contrastMode]);

  // Détecter les préférences du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    handleChange();
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Focus trap pour les modales
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  // Créer un lien de saut de navigation
  const createSkipLink = useCallback(() => {
    const existingSkipLink = document.getElementById('skip-link');
    if (existingSkipLink) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-link';
    skipLink.href = `#${skipLinkTarget}`;
    skipLink.textContent = 'Aller au contenu principal';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }, [skipLinkTarget]);

  // Validation des contrastes de couleur
  const checkColorContrast = useCallback(() => {
    const elements = document.querySelectorAll('*');
    const warnings: string[] = [];

    elements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Ici on pourrait implémenter une vraie vérification de contraste
      // Pour l'instant, on se contente de vérifier si les couleurs sont définies
      if (backgroundColor === 'rgba(0, 0, 0, 0)' && color === 'rgba(0, 0, 0, 0)') {
        warnings.push(`Élément sans couleurs définies: ${element.tagName}`);
      }
    });

    if (warnings.length > 0) {
      console.warn('⚠️ Problèmes de contraste détectés:', warnings);
    }
  }, []);

  // Initialisation
  useEffect(() => {
    createSkipLink();
    
    // Vérifier les contrastes en développement
    if (process.env.NODE_ENV === 'development') {
      setTimeout(checkColorContrast, 1000);
    }
  }, [createSkipLink, checkColorContrast]);

  return {
    announceToScreenReader,
    trapFocus,
    checkColorContrast,
  };
};

// Composant Skip Link
export const SkipLink: React.FC<{ targetId: string }> = ({ targetId }) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-ring"
    >
      Aller au contenu principal
    </a>
  );
};

// Composant pour les annonces aux lecteurs d'écran
export const ScreenReaderAnnouncer: React.FC<{ children: React.ReactNode; priority?: 'polite' | 'assertive' }> = ({
  children,
  priority = 'polite'
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
};

// Classes CSS utilitaires pour l'accessibilité
export const accessibilityClasses = {
  srOnly: 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded',
  highContrast: 'high-contrast:border-2 high-contrast:border-current',
  reduceMotion: 'motion-reduce:animate-none motion-reduce:transition-none',
};