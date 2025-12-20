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
import { PremiumLoader } from '@/components/PremiumLoader';

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
  const [settingsLoading, setSettingsLoading] = useState(true);
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
      } finally {
        setSettingsLoading(false);
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

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFAF5] via-[#FFF8F0] to-[#FFFAF5]">
        <PremiumLoader message="Synchronizing Ledger..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFAF5] via-[#FFF8F0] to-[#FFFAF5] flex flex-col lg:flex-row">
      <SEO title="Authentification" description="Sign in or register for Maison." />

      {/* Left Side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111] relative overflow-hidden p-16 flex-col justify-between">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-accent transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Atelier
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <Link to="/" className="font-heading text-7xl font-black tracking-tighter text-white block">
            MAISON
          </Link>
          <div className="space-y-4">
            <p className="text-white/80 text-2xl font-medium italic leading-relaxed">
              {isLogin ? 'Welcome back to the Archive.' : 'Begin your collection.'}
            </p>
            <p className="text-white/40 text-sm font-medium leading-relaxed max-w-md">
              An exclusive registry for discerning collectors. Each artifact is meticulously curated to ensure authenticity and timeless value.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
            © MMXXV MAISON ARCHIVE
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden p-8 sm:p-12">
          <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-accent hover:text-primary transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Atelier
          </Link>
        </header>

        {/* Form Container */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 lg:py-16">
          <div className="w-full max-w-xl space-y-12">
            {/* Mobile Logo */}
            <div className="text-center lg:hidden">
              <Link to="/" className="font-heading text-4xl sm:text-6xl font-black tracking-tighter">
                MAISON
              </Link>
              <p className="mt-6 text-xl text-primary/60 font-medium italic">
                {isLogin ? 'Welcome back to the Archive.' : 'Begin your collection.'}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-xl p-10 sm:p-16 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-accent/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl" />

              <div className="relative z-10">
                {/* Desktop Title */}
                <div className="hidden lg:block mb-12">
                  <h2 className="font-heading text-3xl font-bold tracking-tight mb-2">
                    {isLogin ? 'Member Access' : 'New Registration'}
                  </h2>
                  <p className="text-sm text-primary/50 font-medium italic">
                    {isLogin ? 'Enter your credentials to continue' : 'Create your archival account'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Full Identity</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alexander McQueen"
                        className={`h-16 bg-accent/5 border-none rounded-2xl px-6 focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all font-medium text-base ${errors.fullName ? 'ring-2 ring-destructive' : ''}`}
                      />
                      {errors.fullName && (
                        <p className="text-xs text-destructive ml-2 font-bold flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-destructive" />
                          {errors.fullName}
                        </p>
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
                      placeholder="member@archive.com"
                      className={`h-16 bg-accent/5 border-none rounded-2xl px-6 focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all font-medium text-base ${errors.email ? 'ring-2 ring-destructive' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive ml-2 font-bold flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Access Key</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`h-16 bg-accent/5 border-none rounded-2xl px-6 pr-14 focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all font-medium text-base ${errors.password ? 'ring-2 ring-destructive' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive ml-2 font-bold flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 bg-[#111] text-white font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-accent transition-all duration-300 rounded-2xl mt-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-3">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      isLogin ? 'Enter Archive' : 'Initialize Membership'
                    )}
                  </Button>
                </form>

                <div className="mt-10 pt-10 border-t border-accent/10">
                  <div className="text-center space-y-4">
                    <p className="text-primary/50 font-medium text-sm">
                      {isLogin ? "New to the Maison?" : "Already registered?"}
                    </p>
                    {isLogin && !allowSignups ? (
                      <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 italic">
                          Registration Restricted to Concierge Invitations
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setErrors({});
                        }}
                        className="text-accent font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors border-b-2 border-accent hover:border-primary pb-1"
                      >
                        {isLogin ? 'Request New Membership' : 'Access Existing Account'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Auth;
