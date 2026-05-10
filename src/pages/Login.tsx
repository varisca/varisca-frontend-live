import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestEmailOtp, verifyEmailOtp, isAuthenticated, loading } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/account';

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = window.setInterval(() => setCooldownLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldownLeft]);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    const res = await requestEmailOtp({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
    });
    setIsLoading(false);

    if (res.ok) {
      setStep('otp');
      setCooldownLeft(res.resendAfterSeconds);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setIsLoading(true);
    const ok = await verifyEmailOtp(email, otp.trim());
    setIsLoading(false);

    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid OTP');
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
            <h1 className="text-2xl font-display font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={step === 'otp'}
                  autoComplete="given-name"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={step === 'otp'}
                  autoComplete="family-name"
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={step === 'otp'}
                autoComplete="email"
                className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>

            {step === 'otp' && (
              <div>
                <label className="block text-sm font-medium mb-2">OTP</label>
                <input
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent tracking-widest text-center text-lg"
                  placeholder="Enter OTP"
                />
                <div className="flex items-center justify-between mt-3 text-sm">
                  <button
                    type="button"
                    className={cn(
                      'text-accent hover:underline font-medium',
                      (cooldownLeft > 0 || isLoading || loading) && 'opacity-50 pointer-events-none',
                    )}
                    onClick={async () => {
                      setError('');
                      const res = await requestEmailOtp({
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        email: email.trim(),
                      });
                      if (res.ok) setCooldownLeft(res.resendAfterSeconds);
                    }}
                  >
                    Resend OTP{cooldownLeft > 0 ? ` (${cooldownLeft}s)` : ''}
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                    }}
                  >
                    Edit details
                  </button>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              variant="accent" 
              size="lg" 
              className="w-full"
              disabled={isLoading || loading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {step === 'email' ? 'Sending OTP...' : 'Verifying...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {step === 'email' ? 'Send OTP' : 'Verify & Sign In'}
                  {step === 'email' ? <Mail size={18} /> : <ArrowRight size={18} />}
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">
                New to Varisca?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link to="/register">Create an account</Link>
          </Button>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;
