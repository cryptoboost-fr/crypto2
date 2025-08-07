// Utilitaires pour optimiser la performance et la fluidité
import React from 'react';

// Debounce function pour optimiser les recherches
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function pour limiter les appels fréquents
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer pour le lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  });
};

// Optimisation des animations avec requestAnimationFrame
export const smoothScroll = (target: number, duration: number = 500) => {
  const start = window.pageYOffset;
  const distance = target - start;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, start, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  };

  const ease = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  requestAnimationFrame(animation);
};

// Cache pour les données fréquemment utilisées
export class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

// Optimisation des images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Optimisation des composants avec React.memo
export const memoizeComponent = <P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};

// Gestionnaire de performance pour les transitions
export const createTransitionManager = () => {
  let isTransitioning = false;

  return {
    startTransition: () => {
      isTransitioning = true;
      document.body.style.pointerEvents = 'none';
    },
    endTransition: () => {
      isTransitioning = false;
      document.body.style.pointerEvents = 'auto';
    },
    isTransitioning: () => isTransitioning,
  };
};

// Optimisation des listes avec virtualisation
export const createVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight,
  };
};

// Optimisation des formulaires
export const createFormOptimizer = () => {
  const validators = new Map<string, (value: any) => string | null>();

  return {
    addValidator: (field: string, validator: (value: any) => string | null) => {
      validators.set(field, validator);
    },
    validateField: (field: string, value: any): string | null => {
      const validator = validators.get(field);
      return validator ? validator(value) : null;
    },
    validateForm: (data: Record<string, any>): Record<string, string> => {
      const errors: Record<string, string> = {};
      for (const [field, validator] of validators) {
        const error = validator(data[field]);
        if (error) errors[field] = error;
      }
      return errors;
    },
  };
};

// Optimisation des notifications
export const createNotificationManager = () => {
  const notifications: Array<{ id: string; message: string; type: string; timestamp: number }> = [];
  const maxNotifications = 5;

  return {
    add: (message: string, type: string = 'info') => {
      const id = Date.now().toString();
      notifications.push({ id, message, type, timestamp: Date.now() });
      
      // Limiter le nombre de notifications
      if (notifications.length > maxNotifications) {
        notifications.shift();
      }

      // Auto-remove après 5 secondes
      setTimeout(() => {
        (this as any)?.remove?.(id);
      }, 5000);

      return id;
    },
    remove: (id: string) => {
      const index = notifications.findIndex(n => n.id === id);
      if (index > -1) {
        notifications.splice(index, 1);
      }
    },
    getAll: () => [...notifications],
    clear: () => {
      notifications.length = 0;
    },
  };
};

// Optimisation des requêtes API
export const createApiOptimizer = () => {
  const pendingRequests = new Map<string, Promise<any>>();

  return {
    request: async <T>(
      key: string,
      requestFn: () => Promise<T>
    ): Promise<T> => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
      }

      const promise = requestFn();
      pendingRequests.set(key, promise);

      try {
        const result = await promise;
        return result;
      } finally {
        pendingRequests.delete(key);
      }
    },
    cancel: (key: string) => {
      pendingRequests.delete(key);
    },
    clear: () => {
      pendingRequests.clear();
    },
  };
};

// Optimisation des animations
export const createAnimationOptimizer = () => {
  const animations = new Set<number>();

  return {
    add: (animationId: number) => {
      animations.add(animationId);
    },
    remove: (animationId: number) => {
      animations.delete(animationId);
    },
    cancelAll: () => {
      animations.forEach(id => {
        cancelAnimationFrame(id);
      });
      animations.clear();
    },
    isAnimating: () => animations.size > 0,
  };
};

// Export des utilitaires principaux
export const performanceUtils = {
  debounce,
  throttle,
  createIntersectionObserver,
  smoothScroll,
  DataCache,
  preloadImage,
  memoizeComponent,
  createTransitionManager,
  createVirtualizedList,
  createFormOptimizer,
  createNotificationManager,
  createApiOptimizer,
  createAnimationOptimizer,
}; 