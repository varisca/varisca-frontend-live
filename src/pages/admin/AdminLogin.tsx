import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

/** Map API/network errors to clear copy (avoid showing “wrong password” for DNS/offline). */
function formatAdminLoginError(raw: string): string {
  const t = raw.toLowerCase();
  if (t.includes('invalid credentials') || t.includes('invalid email or password') || t.includes('unauthorized')) {
    return 'Invalid email or password';
  }
  if (t.includes('timed out')) {
    return raw;
  }
  if (
    t.includes('failed to fetch') ||
    t.includes('network error') ||
    t.includes('load failed') ||
    t.includes('name_not_resolved') ||
    t.includes('err_network')
  ) {
    return 'Cannot reach the API (network/DNS). Open https://api.varisca.in/api/health in this browser. If that fails, try Wi‑Fi or another network — this is not a wrong password.';
  }
  return raw;
}

const AdminLogin = () => {
  const { login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(email, password);
    if (result.ok) {
      toast.success('Welcome back!', { description: 'Logged into admin panel' });
      navigate(from, { replace: true });
    } else {
      const msg = formatAdminLoginError(result.error);
      setError(msg);
      toast.error('Login failed', { description: msg });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/3 blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-8 shadow-2xl shadow-black/5">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-orange-600 shadow-lg shadow-accent/30 mb-4">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Varisca Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your admin dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10 bg-muted/30 border-border/50 focus:border-accent/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10 bg-muted/30 border-border/50 focus:border-accent/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-accent to-orange-600 hover:from-accent/90 hover:to-orange-600/90 text-white font-semibold shadow-lg shadow-accent/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>


        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          © 2026 Varisca. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
