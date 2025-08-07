import { useEffect, useCallback, useRef } from 'react';

interface CustomPerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: string;
}

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

// Hook pour mesurer les performances
export const usePerformance = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  // Mesurer le FCP (First Contentful Paint)
  const measureFCP = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        metricsRef.current.fcp = fcpEntry.startTime;
        console.log(`🎯 FCP: ${fcpEntry.startTime.toFixed(2)}ms`);
      }
    });

    observer.observe({ entryTypes: ['paint'] });
    return () => observer.disconnect();
  }, []);

  // Mesurer le LCP (Largest Contentful Paint)
  const measureLCP = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        metricsRef.current.lcp = lastEntry.startTime;
        console.log(`🎯 LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    return () => observer.disconnect();
  }, []);

  // Mesurer le FID (First Input Delay)
  const measureFID = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          metricsRef.current.fid = fid;
          console.log(`🎯 FID: ${fid.toFixed(2)}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
    return () => observer.disconnect();
  }, []);

  // Mesurer le CLS (Cumulative Layout Shift)
  const measureCLS = useCallback(() => {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      metricsRef.current.cls = clsValue;
      console.log(`🎯 CLS: ${clsValue.toFixed(4)}`);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    return () => observer.disconnect();
  }, []);

  // Mesurer le TTFB (Time to First Byte)
  const measureTTFB = useCallback(() => {
    if (!window.performance || !window.performance.timing) return;

    const navigation = window.performance.timing;
    const ttfb = navigation.responseStart - navigation.navigationStart;
    
    metricsRef.current.ttfb = ttfb;
    console.log(`🎯 TTFB: ${ttfb.toFixed(2)}ms`);
  }, []);

  // Mesurer les ressources chargées
  const measureResourceTiming = useCallback(() => {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      console.warn('⚠️ Ressources lentes détectées:', slowResources);
    }

    // Analyser les types de ressources
    const resourceTypes = resources.reduce((acc, resource: any) => {
      const type = resource.initiatorType || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Types de ressources:', resourceTypes);
  }, []);

  // Marquer un point de performance personnalisé
  const markPerformance = useCallback((name: string) => {
    if (!window.performance || !window.performance.mark) return;

    window.performance.mark(name);
    console.log(`🏁 Performance mark: ${name}`);
  }, []);

  // Mesurer le temps entre deux marks
  const measureBetweenMarks = useCallback((name: string, startMark: string, endMark: string) => {
    if (!window.performance || !window.performance.measure) return;

    try {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }, []);

  // Initialiser toutes les mesures
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Attendre que la page soit chargée
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        cleanupFunctions.push(
          measureFCP(),
          measureLCP(),
          measureFID(),
          measureCLS()
        );
        measureTTFB();
        measureResourceTiming();
      });
    } else {
      cleanupFunctions.push(
        measureFCP(),
        measureLCP(),
        measureFID(),
        measureCLS()
      );
      measureTTFB();
      measureResourceTiming();
    }

    // Nettoyage
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup && cleanup());
    };
  }, [measureFCP, measureLCP, measureFID, measureCLS, measureTTFB, measureResourceTiming]);

  // Obtenir les métriques actuelles
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Envoyer les métriques (pour monitoring externe)
  const sendMetrics = useCallback((endpoint?: string) => {
    const metrics = getMetrics();
    
    // Log local
    console.log('📊 Performance Metrics:', metrics);
    
    // Envoyer à un service de monitoring (optionnel)
    if (endpoint && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(metrics));
    }
    
    return metrics;
  }, [getMetrics]);

  return {
    markPerformance,
    measureBetweenMarks,
    getMetrics,
    sendMetrics,
    metrics: metricsRef.current,
  };
};

// Hook pour optimiser les re-renders
export const useRenderOptimization = () => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    if (renderCount.current > 10 && timeSinceLastRender < 16) {
      console.warn('⚠️ Possible re-render excessif détecté');
    }
  });

  return {
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
  };
};

// Hook pour le lazy loading des modules
export const useLazyModule = <T>(
  moduleLoader: () => Promise<T>,
  dependencies: any[] = []
) => {
  const moduleRef = useRef<T | null>(null);
  const loadingRef = useRef(false);

  const loadModule = useCallback(async () => {
    if (moduleRef.current || loadingRef.current) return moduleRef.current;

    loadingRef.current = true;
    try {
      const module = await moduleLoader();
      moduleRef.current = module;
      return module;
    } finally {
      loadingRef.current = false;
    }
  }, dependencies);

  return {
    module: moduleRef.current,
    isLoading: loadingRef.current,
    loadModule,
  };
};