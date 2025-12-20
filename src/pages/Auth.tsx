import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { SEO } from '@/components/SEO';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings' as any)
          .select('*')
          .eq('key', 'allow_signups')
          .single();
        if (data) {
          setAllowSignups((data as any).value === 'true');
        }
      } catch (err) {
        console.error('Error fetching auth settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; fullName?: string } = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (!isLogin) {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
        }
      } else {
        if (!allowSignups) {
          toast.error('Archival registration is currently restricted to concierge invitations.');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully!');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
        <SEO title="Securing Instance" description="Verifying archival access." />
        <header className="p-8 sm:p-12">
          <div className="font-heading text-4xl sm:text-6xl font-black tracking-tighter opacity-10">
            MAISON
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-48 h-[1px] bg-accent/10 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-accent animate-loading-bar" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/40 italic">
              Synchronizing Ledger...
            </span>
          </div>
        </main>
        <footer className="p-8 sm:p-12 border-t border-accent/5">
          <div className="text-[8px] font-black uppercase tracking-[0.4em] text-accent/20">
            © MMXXV MAISON ARCHIVE
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5] flex flex-col">
      <SEO title="Authentification" description="Sign in or register for Maison." />
      {/* Header */}
      <header className="p-8 sm:p-12">
        <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-accent hover:text-primary transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back to Atelier
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg space-y-12">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="font-heading text-4xl sm:text-6xl font-black tracking-tighter">
              MAISON
            </Link>
            <p className="mt-6 text-xl text-primary/60 font-medium italic">
              {isLogin ? 'Welcome back to the Archive.' : 'Begin your collection.'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-10 sm:p-16 rounded-[4rem] shadow-sm border border-accent/5">
            <form onSubmit={handleSubmit} className="space-y-8">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className={`h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium ${errors.fullName ? 'ring-2 ring-destructive' : ''}`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive ml-2 font-bold">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium ${errors.email ? 'ring-2 ring-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive ml-2 font-bold">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`h-14 bg-accent/5 border-none rounded-2xl px-6 pr-12 focus:ring-accent focus:bg-white transition-all font-medium ${errors.password ? 'ring-2 ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive ml-2 font-bold">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl hover:bg-accent transition-all rounded-2xl mt-4" disabled={isLoading}>
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-primary/60 font-medium italic text-lg mb-4">
                {isLogin ? "New to Maison?" : "Already part of the Archive?"}
              </p>
              {isLogin && !allowSignups ? (
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 italic">
                  Registration Restricted to Invitations
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  }}
                  className="text-accent font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors border-b-2 border-accent/20 pb-1"
                >
                  {isLogin ? 'Request Membership' : 'Sign into Account'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Auth;
