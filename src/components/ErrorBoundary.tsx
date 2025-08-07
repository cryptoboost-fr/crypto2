import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log l'erreur pour monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // En production, envoyer l'erreur à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple: Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Oops ! Une erreur s'est produite</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Nous sommes désolés, mais quelque chose s'est mal passé. 
                Notre équipe a été notifiée de ce problème.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                    Détails de l'erreur (développement)
                  </summary>
                  <div className="bg-muted p-3 rounded text-xs font-mono text-destructive overflow-auto max-h-32">
                    <div className="font-bold mb-2">{this.state.error.message}</div>
                    <div className="whitespace-pre-wrap">
                      {this.state.error.stack}
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="font-bold mb-1">Component Stack:</div>
                        <div className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Réessayer
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Si le problème persiste, contactez notre support à{' '}
                <a 
                  href="mailto:support@cryptoboost.world" 
                  className="text-primary hover:underline"
                >
                                      support@cryptoboost.world
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook pour les erreurs dans les composants fonctionnels
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Erreur capturée:', error, errorInfo);
    
    // En production, envoyer à un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Exemple: Sentry.captureException(error, { extra: errorInfo });
    }
  };
};