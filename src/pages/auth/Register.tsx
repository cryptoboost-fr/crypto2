import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm_password?: string;
    full_name?: string;
  }>({});
  
  const { signUp } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // Validation nom complet
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Le nom complet est obligatoire';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Le nom doit contenir au moins 2 caractères';
    }
    
    // Validation email
    if (!formData.email) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule et une minuscule';
    }
    
    // Validation confirmation mot de passe
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'La confirmation du mot de passe est obligatoire';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signUp(formData);
      
      if (result.error) {
        toast(result.error, 'error');
        setErrors({ email: result.error });
      } else {
        toast('Compte créé avec succès ! Vous êtes maintenant connecté.', 'success');
        navigate('/client/dashboard');
      }
    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
      toast('Une erreur inattendue s\'est produite', 'error');
      setErrors({ email: 'Erreur lors de la création du compte' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirm_password') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez CryptoBoost et commencez à investir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate role="form" aria-labelledby="register-title">
            {/* Champ nom complet */}
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium block">
                Nom complet *
              </label>
              <div className="relative">
                <User 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                  aria-hidden="true"
                />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Votre nom complet"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                  className="pl-10"
                  aria-invalid={!!errors.full_name}
                  aria-describedby={errors.full_name ? "full_name-error" : "full_name-help"}
                />
              </div>
              <div id="full_name-help" className="text-xs text-muted-foreground">
                Minimum 2 caractères
              </div>
              {errors.full_name && (
                <div 
                  id="full_name-error" 
                  className="text-sm text-red-600 mt-1" 
                  role="alert"
                  aria-live="polite"
                >
                  {errors.full_name}
                </div>
              )}
            </div>

            {/* Champ email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium block">
                Email *
              </label>
              <div className="relative">
                <Mail 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  autoComplete="email"
                  className="pl-10"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <div 
                  id="email-error" 
                  className="text-sm text-red-600 mt-1" 
                  role="alert"
                  aria-live="polite"
                >
                  {errors.email}
                </div>
              )}
            </div>

            {/* Champ mot de passe */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium block">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Créez un mot de passe sécurisé"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  className="pl-10 pr-10"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : "password-help"}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div id="password-help" className="text-xs text-muted-foreground">
                Minimum 8 caractères avec majuscules et minuscules
              </div>
              {errors.password && (
                <div 
                  id="password-error" 
                  className="text-sm text-red-600 mt-1" 
                  role="alert"
                  aria-live="polite"
                >
                  {errors.password}
                </div>
              )}
            </div>

            {/* Champ confirmation mot de passe */}
            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-sm font-medium block">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" 
                  aria-hidden="true"
                />
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmez votre mot de passe"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  className="pl-10 pr-10"
                  aria-invalid={!!errors.confirm_password}
                  aria-describedby={errors.confirm_password ? "confirm_password-error" : "confirm_password-help"}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm_password')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                  aria-label={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                  tabIndex={0}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div id="confirm_password-help" className="text-xs text-muted-foreground">
                Doit être identique au mot de passe
              </div>
              {errors.confirm_password && (
                <div 
                  id="confirm_password-error" 
                  className="text-sm text-red-600 mt-1" 
                  role="alert"
                  aria-live="polite"
                >
                  {errors.confirm_password}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={isLoading}
              aria-describedby={isLoading ? "loading-text" : undefined}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    role="status"
                    aria-hidden="true"
                  ></div>
                  <span id="loading-text">Création du compte...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Créer mon compte</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Link
                to="/auth/login"
                className="text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                Se connecter
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              En créant un compte, vous acceptez nos{' '}
              <Link 
                to="/terms" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link 
                to="/privacy" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                politique de confidentialité
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}; 