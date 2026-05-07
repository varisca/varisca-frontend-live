import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/account', { replace: true });
    return null;
  }

  const passwordRules = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number (0-9)', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const failedRules = passwordRules.filter(r => !r.test(formData.password));
      if (failedRules.length > 0) {
        newErrors.password = failedRules[0].label + ' required';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptTerms) newErrors.terms = 'You must accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    const success = await register({
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
    });
    setIsLoading(false);

    if (success) {
      navigate('/account');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-3xl font-bold">
                Varisca<span className="text-accent">.</span>
              </span>
            </Link>
            <h1 className="text-2xl font-display font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Join the Varisca community today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={e => updateField('firstName', e.target.value)}
                  className={cn(
                    "w-full h-12 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent",
                    errors.firstName ? "border-destructive" : "border-border"
                  )}
                />
                {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => updateField('lastName', e.target.value)}
                  className={cn(
                    "w-full h-12 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent",
                    errors.lastName ? "border-destructive" : "border-border"
                  )}
                />
                {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => updateField('email', e.target.value)}
                className={cn(
                  "w-full h-12 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent",
                  errors.email ? "border-destructive" : "border-border"
                )}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => updateField('password', e.target.value)}
                  className={cn(
                    "w-full h-12 px-4 pr-12 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent",
                    errors.password ? "border-destructive" : "border-border"
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              {/* Live password strength indicator */}
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordRules.map(rule => {
                    const passed = rule.test(formData.password);
                    return (
                      <div key={rule.label} className={cn("flex items-center gap-2 text-xs transition-colors", passed ? "text-green-500" : "text-muted-foreground")}>
                        <span className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0", passed ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/40")}>
                          {passed && <Check size={9} />}
                        </span>
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => updateField('confirmPassword', e.target.value)}
                className={cn(
                  "w-full h-12 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-accent",
                  errors.confirmPassword ? "border-destructive" : "border-border"
                )}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  className={cn(
                    "w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors",
                    acceptTerms 
                      ? "bg-accent border-accent text-accent-foreground" 
                      : "border-border"
                  )}
                >
                  {acceptTerms && <Check size={14} />}
                </button>
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/policy/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="text-sm text-destructive mt-1">{errors.terms}</p>}
            </div>

            <Button 
              type="submit" 
              variant="accent" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default Register;
