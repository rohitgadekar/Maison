import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PremiumToggle } from '@/components/PremiumToggle';
import { UserPlus, Settings2, ShieldAlert, Check, Globe } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PremiumLoader } from '@/components/PremiumLoader';
import { useCurrency, SUPPORTED_CURRENCIES } from '@/context/CurrencyContext';

const AdminSettings = () => {
    const { storeCurrency, setStoreCurrency } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [allowSignups, setAllowSignups] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        fullName: ''
    });



    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings' as any)
                    .select('*')
                    .eq('key', 'allow_signups')
                    .maybeSingle();

                if (data) {
                    setAllowSignups((data as any).value === 'true');
                }
            } catch (err) {
                console.error('Settings fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);



    const handleToggleSignups = async () => {
        if (isSaving) return;
        setIsSaving(true);
        const nextValue = !allowSignups;

        try {
            const { error } = await supabase
                .from('site_settings' as any)
                .upsert({
                    key: 'allow_signups',
                    value: nextValue.toString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            if (error) throw error;
            setAllowSignups(nextValue);
            toast.success(`Sign-ups have been ${nextValue ? 'enabled' : 'disabled'}`);
        } catch (err: any) {
            toast.error('Failed to update settings: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddUser = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Create a secondary client that doesn't persist session to avoid logging out the admin
            const tempClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                { auth: { persistSession: false } }
            );

            const { data, error } = await tempClient.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.fullName,
                    }
                }
            });

            if (error) throw error;

            if (data?.user) {
                toast.success('Member initialized. If verification is active, check email.');
                setNewUser({ email: '', password: '', fullName: '' });
            }
        } catch (err: any) {
            toast.error('User creation failed: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <PremiumLoader message="Configuring Atelier Systems..." />
            </div>
        );
    }

    return (
        <div className="lg:p-8 max-w-5xl mx-auto">
            <div className="mb-16">
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Platform Architecture</span>
                <h1 className="font-heading text-5xl font-bold tracking-tighter">Website <span className="italic font-light text-accent">Settings.</span></h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Sign-up Toggle Card */}
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-accent/5 transition-all duration-700 hover:shadow-2xl">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-16 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent">
                            <Settings2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-heading text-2xl font-bold tracking-tight uppercase">Registry Access</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Member Onboarding Control</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-8 rounded-[2rem] bg-accent/5 border border-accent/10">
                            <div>
                                <p className="font-bold text-lg mb-1">Allow New Sign-ups</p>
                                <p className="text-xs text-primary/50 italic font-medium">Toggle public account registration</p>
                            </div>
                            <PremiumToggle
                                checked={allowSignups}
                                onCheckedChange={handleToggleSignups}
                            />
                        </div>

                        {!allowSignups && (
                            <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-rose-50/[0.5] text-rose-500 border border-rose-100">
                                <ShieldAlert className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold leading-relaxed">
                                    Archive Registration Locked. New members can currently only be invited through the administrative terminal.
                                </p>
                            </div>
                        )}
                        {allowSignups && (
                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Check className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold leading-relaxed">
                                    Open Enrollment Active. The Maison is currently accepting new archival memberships.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-accent/5 transition-all duration-700 hover:shadow-2xl">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-16 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent">
                            <Globe className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-heading text-2xl font-bold tracking-tight uppercase">Monetary Standard</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Global Store Currency</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Base Currency</Label>
                        <Select
                            value={storeCurrency}
                            onValueChange={(val: any) => setStoreCurrency(val)}
                        >
                            <SelectTrigger className="h-24 bg-white border border-accent/10 rounded-[2rem] px-8 focus:ring-accent/20 focus:ring-4 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-accent/30 hover:-translate-y-0.5 group overflow-hidden relative">
                                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="flex items-center gap-6 relative z-10 w-full">
                                    <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-start text-left flex-1">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent/60 mb-1 group-hover:text-accent transition-colors">Selected Standard</span>
                                        <SelectValue placeholder="Select Currency" />
                                    </div>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-[2.5rem] border-accent/10 bg-white/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)] p-4 min-w-[360px] animate-in fade-in zoom-in-95 duration-300">
                                <div className="px-6 py-4 border-b border-accent/10 mb-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent/50 italic">Global Markets</p>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2 p-2">
                                    {SUPPORTED_CURRENCIES.map((currency) => (
                                        <SelectItem
                                            key={currency.code}
                                            value={currency.code}
                                            className="group/item relative py-4 px-6 rounded-[1.5rem] cursor-pointer outline-none transition-all duration-300 border border-transparent focus:bg-accent focus:text-white hover:bg-accent hover:text-white data-[state=checked]:bg-accent/5 data-[state=checked]:border-accent/20"
                                        >
                                            <div className="flex items-center gap-5 relative z-10">
                                                <span className="font-black text-2xl w-10 text-center opacity-40 group-hover/item:opacity-100 group-focus/item:opacity-100 group-data-[state=checked]/item:text-accent group-data-[state=checked]/item:opacity-100 transition-opacity text-primary group-hover/item:text-white group-focus/item:text-white">
                                                    {currency.symbol}
                                                </span>
                                                <div className="flex flex-col items-start">
                                                    <span className="font-bold text-base leading-none mb-1.5 text-primary group-hover/item:text-white group-focus/item:text-white group-data-[state=checked]/item:text-primary">
                                                        {currency.label}
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 group-hover/item:text-white group-focus/item:text-white group-hover/item:opacity-80 group-data-[state=checked]/item:text-accent">
                                                        {currency.code}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </div>
                            </SelectContent>
                        </Select>
                        <div className="mt-8 flex items-start gap-4 p-6 rounded-[2rem] bg-accent/[0.02] border border-accent/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0 animate-pulse" />
                            <p className="text-xs text-primary/50 font-medium leading-relaxed">
                                <span className="text-accent font-bold">Note:</span> This setting establishes the foundational valuation for your archival collection. All global conversions will be calculated relative to this standard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add User Card */}
                <div className="bg-[#111] text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                    <div className="flex items-center gap-6 mb-10 relative z-10">
                        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center text-accent">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-heading text-2xl font-bold tracking-tight uppercase italic">Member Induction</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Manual Archive Entry</p>
                        </div>
                    </div>

                    <form onSubmit={handleAddUser} className="space-y-6 relative z-10">
                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Full Identity</Label>
                            <Input
                                value={newUser.fullName}
                                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                                required
                                placeholder="Alexander Mcqueen"
                                className="h-14 bg-white/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white/10 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Contact Email</Label>
                            <Input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                required
                                placeholder="member@archive.com"
                                className="h-14 bg-white/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white/10 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Access Key (Password)</Label>
                            <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                required
                                placeholder="••••••••"
                                className="h-14 bg-white/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white/10 transition-all font-medium"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="w-full h-16 bg-white text-black font-black uppercase tracking-widest text-xs shadow-xl hover:bg-accent hover:text-white transition-all rounded-2xl mt-4"
                        >
                            Induct Member
                        </Button>
                    </form>
                </div>
            </div>
        </div >
    );
};

export default AdminSettings;
