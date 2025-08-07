import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/components/ui/toaster';

interface AutoSaveOptions {
  delay?: number; // Délai en ms avant de sauvegarder (défaut: 2000ms)
  key: string; // Clé unique pour identifier la sauvegarde
  onSave: (data: any) => Promise<void> | void; // Fonction de sauvegarde
  onRestore?: (data: any) => void; // Fonction de restauration
  enabled?: boolean; // Activer/désactiver l'auto-save
  showToast?: boolean; // Afficher les notifications
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export const useAutoSave = <T,>(data: T, options: AutoSaveOptions) => {
  const {
    delay = 2000,
    key,
    onSave,
    onRestore,
    enabled = true,
    showToast = true
  } = options;

  const { toast } = useToast();
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const isInitialMount = useRef(true);

  // Fonction pour sauvegarder les données
  const saveData = useCallback(async (dataToSave: T) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isSaving: true }));

    try {
      // Sauvegarder en localStorage comme backup
      localStorage.setItem(`autosave_${key}`, JSON.stringify({
        data: dataToSave,
        timestamp: new Date().toISOString()
      }));

      // Appeler la fonction de sauvegarde personnalisée
      await onSave(dataToSave);

      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false
      }));

      if (showToast) {
        toast('Sauvegarde automatique effectuée', 'success');
      }

    } catch (error) {
      setState(prev => ({ ...prev, isSaving: false }));
      
      if (showToast) {
        toast('Erreur lors de la sauvegarde automatique', 'error');
      }
      
      console.error('Auto-save error:', error);
    }
  }, [enabled, key, onSave, showToast, toast]);

  // Fonction pour restaurer les données
  const restoreData = useCallback(() => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const { data: savedData, timestamp } = JSON.parse(saved);
        const savedDate = new Date(timestamp);
        
        // Vérifier si la sauvegarde n'est pas trop ancienne (24h max)
        const isRecent = Date.now() - savedDate.getTime() < 24 * 60 * 60 * 1000;
        
        if (isRecent && onRestore) {
          onRestore(savedData);
          setState(prev => ({ ...prev, lastSaved: savedDate }));
          
          if (showToast) {
            toast('Données restaurées depuis la sauvegarde automatique', 'info');
          }
          
          return savedData;
        }
      }
    } catch (error) {
      console.error('Restore error:', error);
    }
    
    return null;
  }, [key, onRestore, showToast, toast]);

  // Fonction pour vider la sauvegarde
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
    setState(prev => ({
      ...prev,
      lastSaved: null,
      hasUnsavedChanges: false
    }));
  }, [key]);

  // Fonction pour sauvegarder manuellement
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData(data);
  }, [data, saveData]);

  // Effet pour détecter les changements et déclencher l'auto-save
  useEffect(() => {
    // Ignorer le premier rendu
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Vérifier si les données ont réellement changé
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    previousDataRef.current = data;
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    if (!enabled) return;

    // Annuler le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Programmer la sauvegarde
    timeoutRef.current = setTimeout(() => {
      saveData(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveData]);

  // Effet pour la restauration au montage
  useEffect(() => {
    if (onRestore) {
      restoreData();
    }
  }, [restoreData, onRestore]);

  // Effet pour sauvegarder avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges && enabled) {
        // Sauvegarder immédiatement (synchrone)
        try {
          localStorage.setItem(`autosave_${key}`, JSON.stringify({
            data,
            timestamp: new Date().toISOString()
          }));
        } catch (error) {
          console.error('Emergency save error:', error);
        }

        // Avertir l'utilisateur
        event.preventDefault();
        event.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges, enabled, key, data]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    saveNow,
    restoreData,
    clearSavedData
  };
};

// Hook spécialisé pour les formulaires
export const useFormAutoSave = <T extends Record<string, any>,>(
  formData: T,
  options: Omit<AutoSaveOptions, 'onSave'> & {
    onSave: (data: T) => Promise<void> | void;
    validateBeforeSave?: (data: T) => boolean;
  }
) => {
  const { validateBeforeSave, ...autoSaveOptions } = options;

  const wrappedOnSave = useCallback(async (data: T) => {
    // Valider avant de sauvegarder si une fonction de validation est fournie
    if (validateBeforeSave && !validateBeforeSave(data)) {
      throw new Error('Validation failed');
    }

    await options.onSave(data);
  }, [validateBeforeSave, options]);

  return useAutoSave(formData, {
    ...autoSaveOptions,
    onSave: wrappedOnSave
  });
};

// Composant indicateur d'état d'auto-save
export const AutoSaveIndicator = ({ state }: { state: AutoSaveState }) => {
  if (state.isSaving) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
        Sauvegarde...
      </div>
    );
  }

  if (state.hasUnsavedChanges) {
    return (
      <div className="flex items-center text-sm text-orange-500">
        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
        Modifications non sauvegardées
      </div>
    );
  }

  if (state.lastSaved) {
    return (
      <div className="flex items-center text-sm text-green-500">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Sauvegardé {formatRelativeTime(state.lastSaved)}
      </div>
    );
  }

  return null;
};

// Utilitaire pour formater le temps relatif
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'à l\'instant';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours}h`;
  }

  return `le ${date.toLocaleDateString()}`;
};