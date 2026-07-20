import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestPhoneOtp, verifyPhoneOtp, isAuthenticated, loading } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
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
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    const res = await requestPhoneOtp(cleanPhone);
    setIsLoading(false);
    
    if (res.ok) {
      setStep('otp');
      setCooldownLeft(res.resendAfterSeconds);
    } else {
      setError(res.error || 'Failed to send OTP. Please try again.');
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
    const cleanPhone = phone.replace(/\D/g, '');
    const ok = await verifyPhoneOtp(cleanPhone, otp.trim());
    setIsLoading(false);

    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid OTP');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center py-16 bg-gradient-to-br from-background via-background/95 to-accent/5">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="font-display text-3xl font-bold tracking-tight">
                Varisca<span className="text-accent">.</span>
              </span>
            </Link>
            <h1 className="text-2xl font-display font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your mobile number to sign in with OTP
            </p>
          </div>

          {/* Form */}
          <form onSubmit={step === 'input' ? handleSendOtp : handleVerifyOtp} className="space-y-6">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {step === 'input' ? (
              /* Mobile Number Input */
              <div className="space-y-2">
                <label className="block text-sm font-medium">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full h-12 pl-12 pr-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent font-medium tracking-wide text-sm"
                    placeholder="Enter 10-digit number"
                    autoFocus
                  />
                </div>
              </div>
            ) : (
              /* OTP Code Verification Input */
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">One-Time Password (OTP)</label>
                    <span className="text-xs text-muted-foreground">
                      Sent to +91 {phone}
                    </span>
                  </div>
                  <input
                    inputMode="numeric"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent tracking-widest text-center text-xl font-bold"
                    placeholder="0 0 0 0 0 0"
                    autoFocus
                  />
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <button
                      type="button"
                      className={cn(
                        'text-accent hover:underline font-semibold',
                        (cooldownLeft > 0 || isLoading || loading) && 'opacity-50 pointer-events-none',
                      )}
                      onClick={async () => {
                        setError('');
                        const cleanPhone = phone.replace(/\D/g, '');
                        const res = await requestPhoneOtp(cleanPhone);
                        if (res.ok) setCooldownLeft(res.resendAfterSeconds);
                      }}
                    >
                      Resend OTP{cooldownLeft > 0 ? ` (${cooldownLeft}s)` : ''}
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                      onClick={() => {
                        setStep('input');
                        setOtp('');
                        setError('');
                      }}
                    >
                      Edit number
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              variant="accent" 
              size="lg" 
              className="w-full h-12 shadow-sm font-semibold"
              disabled={isLoading || loading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {step === 'input' ? 'Sending OTP...' : 'Verifying...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {step === 'input' ? 'Send OTP' : 'Verify & Sign In'}
                  {step === 'input' ? <Phone size={18} /> : <ArrowRight size={18} />}
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
          <Button variant="outline" size="lg" className="w-full h-12 font-medium" asChild>
            <Link to="/register">Create an account</Link>
          </Button>
        </motion.div>
      </div>
    </main>
  );
};

export default Login;
