import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface ShortcutAction {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  adminOnly?: boolean;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Actions de navigation
  const navigateToPage = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  // Actions spécifiques
  const showShortcuts = useCallback(() => {
    const shortcuts = getShortcuts(user?.role === 'admin');
    const shortcutList = shortcuts
      .map(s => `${s.key}: ${s.description}`)
      .join('\n');
    
    alert(`Raccourcis clavier CryptoBoost:\n\n${shortcutList}`);
  }, [user?.role]);

  const refreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="rechercher" i], input[placeholder*="search" i]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    const sidebarToggle = document.querySelector('[data-sidebar-toggle]') as HTMLButtonElement;
    if (sidebarToggle) {
      sidebarToggle.click();
    }
  }, []);

  // Raccourcis pour tous les utilisateurs
  const commonShortcuts: ShortcutAction[] = [
    // Navigation générale
    { key: '?', action: showShortcuts, description: 'Afficher les raccourcis' },
    { key: 'h', action: () => navigateToPage('/'), description: 'Aller à l\'accueil' },
    { key: 'd', action: () => navigateToPage('/dashboard'), description: 'Aller au dashboard' },
    { key: 'w', action: () => navigateToPage('/dashboard/wallet'), description: 'Aller au wallet' },
    { key: 'p', action: () => navigateToPage('/dashboard/plans'), description: 'Aller aux plans' },
    { key: 'e', action: () => navigateToPage('/dashboard/exchange'), description: 'Aller à l\'exchange' },
    { key: 't', action: () => navigateToPage('/dashboard/history'), description: 'Aller à l\'historique' },
    { key: 'n', action: () => navigateToPage('/dashboard/notifications'), description: 'Aller aux notifications' },
    
    // Actions générales
    { key: 'r', ctrlKey: true, action: refreshPage, description: 'Ctrl+R: Actualiser la page' },
    { key: 'ArrowLeft', altKey: true, action: goBack, description: 'Alt+←: Page précédente' },
    { key: 'ArrowRight', altKey: true, action: goForward, description: 'Alt+→: Page suivante' },
    { key: '/', action: focusSearch, description: '/: Rechercher' },
    { key: 'b', action: toggleSidebar, description: 'B: Basculer la sidebar' },
  ];

  // Raccourcis spécifiques aux admins
  const adminShortcuts: ShortcutAction[] = [
    { key: 'a', action: () => navigateToPage('/admin/dashboard'), description: 'A: Admin dashboard', adminOnly: true },
    { key: 'u', action: () => navigateToPage('/admin/users'), description: 'U: Gestion utilisateurs', adminOnly: true },
    { key: 'x', action: () => navigateToPage('/admin/transactions'), description: 'X: Transactions', adminOnly: true },
    { key: 'l', action: () => navigateToPage('/admin/logs'), description: 'L: Logs système', adminOnly: true },
    { key: 's', action: () => navigateToPage('/admin/settings'), description: 'S: Paramètres', adminOnly: true },
  ];

  // Fonction pour obtenir tous les raccourcis disponibles
  const getShortcuts = useCallback((isAdmin: boolean) => {
    const shortcuts = [...commonShortcuts];
    if (isAdmin) {
      shortcuts.push(...adminShortcuts);
    }
    return shortcuts;
  }, [commonShortcuts, adminShortcuts]);

  // Gestionnaire d'événements clavier
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorer si l'utilisateur tape dans un champ de saisie
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      // Autoriser uniquement Ctrl+R pour actualiser
      if (event.ctrlKey && event.key === 'r') {
        return;
      }
      return;
    }

    // Ignorer si des modificateurs non supportés sont pressés
    if (event.altKey && event.ctrlKey) {
      return;
    }

    const shortcuts = getShortcuts(user?.role === 'admin');
    
    for (const shortcut of shortcuts) {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const metaMatches = !!shortcut.metaKey === event.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        // Vérifier les permissions admin
        if (shortcut.adminOnly && user?.role !== 'admin') {
          continue;
        }

        event.preventDefault();
        event.stopPropagation();
        
        try {
          shortcut.action();
        } catch (error) {
          console.error('Erreur lors de l\'exécution du raccourci:', error);
        }
        
        break;
      }
    }
  }, [user?.role, getShortcuts]);

  // Enregistrement des écouteurs d'événements
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // Ajouter une indication visuelle des raccourcis disponibles
    const addShortcutHints = () => {
      const buttons = document.querySelectorAll('[data-shortcut]');
      buttons.forEach(button => {
        const shortcut = button.getAttribute('data-shortcut');
        if (shortcut && !button.querySelector('.shortcut-hint')) {
          const hint = document.createElement('span');
          hint.className = 'shortcut-hint text-xs opacity-60 ml-2';
          hint.textContent = `(${shortcut})`;
          button.appendChild(hint);
        }
      });
    };

    // Observer pour les changements DOM
    const observer = new MutationObserver(addShortcutHints);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Appel initial
    addShortcutHints();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [handleKeyDown]);

  // Fonction utilitaire pour ajouter des raccourcis à des éléments
  const addShortcutToElement = useCallback((element: HTMLElement, shortcut: string) => {
    element.setAttribute('data-shortcut', shortcut);
    element.setAttribute('title', `${element.getAttribute('title') || ''} (${shortcut})`.trim());
  }, []);

  return {
    shortcuts: getShortcuts(user?.role === 'admin'),
    addShortcutToElement,
    showShortcuts,
  };
};

// Hook pour les raccourcis spécifiques à une page
export const usePageShortcuts = (pageShortcuts: ShortcutAction[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      for (const shortcut of pageShortcuts) {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const altMatches = !!shortcut.altKey === event.altKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
        const metaMatches = !!shortcut.metaKey === event.metaKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pageShortcuts]);
};

// Composant pour afficher les raccourcis disponibles
export const ShortcutHelper = () => {
  const { shortcuts } = useKeyboardShortcuts();

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 max-w-sm z-50">
      <h3 className="font-semibold mb-2">Raccourcis clavier</h3>
      <div className="space-y-1 text-sm">
        {shortcuts.slice(0, 5).map((shortcut, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-muted-foreground">{shortcut.key}</span>
            <span>{shortcut.description}</span>
          </div>
        ))}
        <div className="text-xs text-muted-foreground mt-2">
          Appuyez sur "?" pour voir tous les raccourcis
        </div>
      </div>
    </div>
  );
};