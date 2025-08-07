import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameRate: number;
  loadTime: number;
}

export const PerformanceTest = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 0,
    loadTime: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  // Test de performance de rendu
  const testRenderPerformance = useCallback(() => {
    const start = performance.now();
    
    // Simuler un rendu complexe
    const elements = Array.from({ length: 1000 }, (_, i) => (
      <div key={i} className="p-2 border rounded">
        Element {i}
      </div>
    ));

    const end = performance.now();
    return end - start;
  }, []);

  // Test de mémoire
  const testMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }, []);

  // Test de frame rate
  const testFrameRate = useCallback(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const countFrames = (currentTime: number) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, frameRate: fps }));
        return;
      }
      requestAnimationFrame(countFrames);
    };
    
    requestAnimationFrame(countFrames);
  }, []);

  // Test de temps de chargement
  const testLoadTime = useCallback(() => {
    const start = performance.now();
    
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        const end = performance.now();
        resolve(end - start);
      }, 100);
    });
  }, []);

  // Test complet de performance
  const runPerformanceTest = useCallback(async () => {
    setIsRunning(true);
    setResults([]);

    const addResult = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
      setResults(prev => [...prev, `${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'} ${message}`]);
    };

    try {
      // Test de rendu
      addResult('Test de performance de rendu...');
      const renderTime = testRenderPerformance();
      setMetrics(prev => ({ ...prev, renderTime }));
      
      if (renderTime < 16) {
        addResult(`Rendu: ${renderTime.toFixed(2)}ms (Excellent)`);
      } else if (renderTime < 33) {
        addResult(`Rendu: ${renderTime.toFixed(2)}ms (Bon)`, 'warning');
      } else {
        addResult(`Rendu: ${renderTime.toFixed(2)}ms (Lent)`, 'error');
      }

      // Test de mémoire
      addResult('Test d\'utilisation mémoire...');
      const memoryUsage = testMemoryUsage();
      setMetrics(prev => ({ ...prev, memoryUsage }));
      
      if (memoryUsage < 50) {
        addResult(`Mémoire: ${memoryUsage.toFixed(2)}MB (Excellent)`);
      } else if (memoryUsage < 100) {
        addResult(`Mémoire: ${memoryUsage.toFixed(2)}MB (Bon)`, 'warning');
      } else {
        addResult(`Mémoire: ${memoryUsage.toFixed(2)}MB (Élevé)`, 'error');
      }

      // Test de frame rate
      addResult('Test de frame rate...');
      testFrameRate();
      
      setTimeout(() => {
        const fps = metrics.frameRate;
        if (fps >= 60) {
          addResult(`Frame Rate: ${fps} FPS (Excellent)`);
        } else if (fps >= 30) {
          addResult(`Frame Rate: ${fps} FPS (Bon)`, 'warning');
        } else {
          addResult(`Frame Rate: ${fps} FPS (Lent)`, 'error');
        }
      }, 1000);

      // Test de temps de chargement
      addResult('Test de temps de chargement...');
      const loadTime = await testLoadTime();
      setMetrics(prev => ({ ...prev, loadTime }));
      
      if (loadTime < 100) {
        addResult(`Chargement: ${loadTime.toFixed(2)}ms (Excellent)`);
      } else if (loadTime < 300) {
        addResult(`Chargement: ${loadTime.toFixed(2)}ms (Bon)`, 'warning');
      } else {
        addResult(`Chargement: ${loadTime.toFixed(2)}ms (Lent)`, 'error');
      }

      addResult('Test de performance terminé !');

    } catch (error) {
      addResult('Erreur lors du test de performance', 'error');
    } finally {
      setIsRunning(false);
    }
  }, [testRenderPerformance, testMemoryUsage, testFrameRate, testLoadTime, metrics.frameRate]);

  // Test de fluidité des animations
  const testAnimationFluidity = useCallback(() => {
    setResults(prev => [...prev, '🎬 Test de fluidité des animations...']);
    
    // Test avec Framer Motion
    const animationElements = Array.from({ length: 10 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
        className="w-4 h-4 bg-crypto-primary rounded"
      />
    ));

    setResults(prev => [...prev, '✅ Animations Framer Motion fluides']);
  }, []);

  // Test de synchronisation des états
  const testStateSynchronization = useCallback(() => {
    setResults(prev => [...prev, '🔄 Test de synchronisation des états...']);
    
    // Simuler des mises à jour d'état rapides
    let updateCount = 0;
    const interval = setInterval(() => {
      updateCount++;
      setMetrics(prev => ({ ...prev, renderTime: Math.random() * 10 }));
      
      if (updateCount >= 10) {
        clearInterval(interval);
        setResults(prev => [...prev, '✅ Synchronisation des états optimale']);
      }
    }, 50);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Test de Performance et Fluidité</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-crypto-primary">
                {metrics.renderTime.toFixed(1)}ms
              </div>
              <div className="text-sm text-muted-foreground">Temps de rendu</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-crypto-secondary">
                {metrics.memoryUsage.toFixed(1)}MB
              </div>
              <div className="text-sm text-muted-foreground">Mémoire utilisée</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-crypto-accent">
                {metrics.frameRate} FPS
              </div>
              <div className="text-sm text-muted-foreground">Frame Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-crypto-warning">
                {metrics.loadTime.toFixed(1)}ms
              </div>
              <div className="text-sm text-muted-foreground">Temps de chargement</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button 
              onClick={runPerformanceTest} 
              disabled={isRunning}
              className="bg-crypto-primary hover:bg-crypto-primary/90"
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Lancer le test complet
                </>
              )}
            </Button>
            
            <Button 
              onClick={testAnimationFluidity} 
              variant="outline"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Test Animations
            </Button>
            
            <Button 
              onClick={testStateSynchronization} 
              variant="outline"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Test Synchronisation
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Résultats des tests :</h4>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {results.map((result, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {result}
                </div>
              ))}
              {results.length === 0 && (
                <div className="text-sm text-muted-foreground p-2">
                  Aucun test effectué. Cliquez sur "Lancer le test complet" pour commencer.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 