import { useEffect, useCallback, useState } from 'react';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
}

interface AccessibilityOptions {
  enableFocusTraps?: boolean;
  enableSkipLinks?: boolean;
  enableAnnouncements?: boolean;
  autoDetectPreferences?: boolean;
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    enableFocusTraps = true,
    enableSkipLinks = true,
    enableAnnouncements = true,
    autoDetectPreferences = true
  } = options;

  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: false,
    screenReader: false
  });

  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  // Détecter les préférences d'accessibilité
  const detectPreferences = useCallback(() => {
    if (!autoDetectPreferences) return;

    const mediaQueries = {
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(min-resolution: 2dppx)') // Approximation pour large text
    };

    const newPreferences: Partial<AccessibilityPreferences> = {
      reduceMotion: mediaQueries.reduceMotion.matches,
      highContrast: mediaQueries.highContrast.matches,
      largeText: mediaQueries.largeText.matches,
      screenReader: detectScreenReader()
    };

    setPreferences(prev => ({ ...prev, ...newPreferences }));

    // Écouter les changements
    Object.entries(mediaQueries).forEach(([key, mq]) => {
      mq.addEventListener('change', () => {
        setPreferences(prev => ({
          ...prev,
          [key]: mq.matches
        }));
      });
    });
  }, [autoDetectPreferences]);

  // Détecter l'utilisation d'un lecteur d'écran
  const detectScreenReader = useCallback(() => {
    // Méthodes de détection de lecteur d'écran
    return !!(
      navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack|Orca/i) ||
      window.speechSynthesis ||
      'speechSynthesis' in window
    );
  }, []);

  // Annoncer du contenu aux lecteurs d'écran
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableAnnouncements) return;

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Supprimer après annonce
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, [enableAnnouncements]);

  // Gérer le focus trap
  const createFocusTrap = useCallback((container: HTMLElement) => {
    if (!enableFocusTraps) return () => {};

    const focusableSelector = `
      button:not([disabled]),
      [href],
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"]):not([disabled]),
      [contenteditable]
    `;

    const focusableElements = container.querySelectorAll(focusableSelector) as NodeListOf<HTMLElement>;
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus initial
    firstFocusable?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enableFocusTraps]);

  // Créer des skip links
  const createSkipLinks = useCallback(() => {
    if (!enableSkipLinks) return;

    const skipLinksId = 'skip-links';
    if (document.getElementById(skipLinksId)) return;

    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.id = skipLinksId;
    skipLinksContainer.className = 'skip-links';
    
    const skipLinks = [
      { href: '#main-content', text: 'Aller au contenu principal' },
      { href: '#navigation', text: 'Aller à la navigation' },
      { href: '#search', text: 'Aller à la recherche' }
    ];

    skipLinks.forEach(link => {
      const skipLink = document.createElement('a');
      skipLink.href = link.href;
      skipLink.textContent = link.text;
      skipLink.className = 'skip-link';
      skipLinksContainer.appendChild(skipLink);
    });

    document.body.insertBefore(skipLinksContainer, document.body.firstChild);

    // Styles pour les skip links
    if (!document.getElementById('skip-links-styles')) {
      const styles = document.createElement('style');
      styles.id = 'skip-links-styles';
      styles.textContent = `
        .skip-links {
          position: absolute;
          top: -40px;
          left: 6px;
          z-index: 1000;
        }
        
        .skip-link {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }
        
        .skip-link:focus {
          position: static;
          width: auto;
          height: auto;
          background: #3B82F6;
          color: white;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          margin-right: 8px;
        }
      `;
      document.head.appendChild(styles);
    }
  }, [enableSkipLinks]);

  // Détecter l'utilisation du clavier
  const detectKeyboardUsage = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
        setPreferences(prev => ({ ...prev, keyboardNavigation: true }));
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Améliorer la navigation au clavier
  const enhanceKeyboardNavigation = useCallback(() => {
    // Ajouter des indicateurs de focus visibles
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-user *:focus {
        outline: 2px solid #3B82F6 !important;
        outline-offset: 2px !important;
      }
      
      .keyboard-user button:focus,
      .keyboard-user a:focus,
      .keyboard-user input:focus,
      .keyboard-user select:focus,
      .keyboard-user textarea:focus {
        box-shadow: 0 0 0 2px #3B82F6 !important;
      }
    `;
    document.head.appendChild(style);

    // Ajouter la classe conditionnellement
    const updateBodyClass = () => {
      if (isKeyboardUser) {
        document.body.classList.add('keyboard-user');
      } else {
        document.body.classList.remove('keyboard-user');
      }
    };

    updateBodyClass();
    return updateBodyClass;
  }, [isKeyboardUser]);

  // Appliquer les préférences d'accessibilité
  const applyPreferences = useCallback(() => {
    // Réduire les animations
    if (preferences.reduceMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.style.removeProperty('--transition-duration');
    }

    // Augmenter le contraste
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Agrandir le texte
    if (preferences.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [preferences]);

  // Ajouter des attributs ARIA manquants
  const enhanceAriaAttributes = useCallback(() => {
    // Ajouter des labels ARIA aux éléments interactifs sans label
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
    
    interactiveElements.forEach(element => {
      const el = element as HTMLElement;
      
      // Vérifier si l'élément a déjà un label accessible
      if (!el.getAttribute('aria-label') && 
          !el.getAttribute('aria-labelledby') && 
          !el.textContent?.trim()) {
        
        // Essayer de deviner un label basé sur le contexte
        const placeholder = el.getAttribute('placeholder');
        const title = el.getAttribute('title');
        const className = el.className;
        
        if (placeholder) {
          el.setAttribute('aria-label', placeholder);
        } else if (title) {
          el.setAttribute('aria-label', title);
        } else if (className.includes('search')) {
          el.setAttribute('aria-label', 'Rechercher');
        } else if (className.includes('menu')) {
          el.setAttribute('aria-label', 'Menu');
        } else if (className.includes('close')) {
          el.setAttribute('aria-label', 'Fermer');
        }
      }
    });

    // Ajouter des rôles ARIA aux éléments de liste
    const lists = document.querySelectorAll('ul, ol');
    lists.forEach(list => {
      if (!list.getAttribute('role')) {
        list.setAttribute('role', 'list');
      }
      
      const items = list.querySelectorAll('li');
      items.forEach(item => {
        if (!item.getAttribute('role')) {
          item.setAttribute('role', 'listitem');
        }
      });
    });
  }, []);

  // Vérifier l'accessibilité de la page
  const checkAccessibility = useCallback(() => {
    const issues: string[] = [];

    // Vérifier les images sans alt
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} image(s) sans attribut alt`);
    }

    // Vérifier les liens sans texte
    const emptyLinks = document.querySelectorAll('a:not([aria-label]):empty');
    if (emptyLinks.length > 0) {
      issues.push(`${emptyLinks.length} lien(s) sans texte`);
    }

    // Vérifier les boutons sans label
    const unlabeledButtons = document.querySelectorAll('button:not([aria-label]):empty');
    if (unlabeledButtons.length > 0) {
      issues.push(`${unlabeledButtons.length} bouton(s) sans label`);
    }

    // Vérifier les inputs sans label
    const unlabeledInputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} input(s) sans label`);
    }

    return issues;
  }, []);

  // Initialisation
  useEffect(() => {
    detectPreferences();
    createSkipLinks();
    const cleanupKeyboard = detectKeyboardUsage();
    const updateBodyClass = enhanceKeyboardNavigation();
    
    // Observer pour les changements DOM
    const observer = new MutationObserver(() => {
      enhanceAriaAttributes();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      cleanupKeyboard();
      observer.disconnect();
    };
  }, [detectPreferences, createSkipLinks, detectKeyboardUsage, enhanceKeyboardNavigation, enhanceAriaAttributes]);

  // Appliquer les préférences quand elles changent
  useEffect(() => {
    applyPreferences();
  }, [applyPreferences]);

  return {
    preferences,
    isKeyboardUser,
    announce,
    createFocusTrap,
    checkAccessibility,
    setPreferences,
    enhanceAriaAttributes
  };
};

// Hook pour les composants modaux
export const useModalAccessibility = (isOpen: boolean, modalRef: React.RefObject<HTMLElement>) => {
  const { createFocusTrap, announce } = useAccessibility();

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Annoncer l'ouverture du modal
    announce('Modal ouvert', 'assertive');

    // Créer le focus trap
    const cleanup = createFocusTrap(modalRef.current);

    // Gérer la fermeture avec Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        announce('Modal fermé', 'assertive');
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, modalRef, createFocusTrap, announce]);
};