import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PremiumToggle } from '@/components/PremiumToggle';
import { UserPlus, Settings2, ShieldAlert, Check, Ticket, Trash2, Edit3, Plus, Globe } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PremiumLoader } from '@/components/PremiumLoader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Search, Calendar as CalendarIcon, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

    const [coupons, setCoupons] = useState<any[]>([]);
    const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);
    const [couponForm, setCouponForm] = useState({
        code: '',
        description: '',
        discount_type: 'flat', // flat, percentage, free_delivery
        discount_value: 0,
        min_order_amount: 0,
        is_active: true,
        usage_limit: null as number | null,
        usage_count: 0,
        customer_ids: [] as string[],
        valid_until: null as string | null
    });

    const [customers, setCustomers] = useState<any[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [isMemberSearchOpen, setIsMemberSearchOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const filteredCustomers = customers.filter(c =>
        (c.full_name?.toLowerCase().includes(memberSearch.toLowerCase())) ||
        (c.email?.toLowerCase().includes(memberSearch.toLowerCase())) ||
        (c.user_id.toLowerCase().includes(memberSearch.toLowerCase()))
    );

    const selectedCustomers = customers.filter(c => couponForm.customer_ids.includes(c.user_id));

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
        fetchCoupons();
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const { data } = await supabase.from('profiles').select('user_id, full_name, email');
        if (data) setCustomers(data);
    };

    const fetchCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('coupons' as any)
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setCoupons(data);
            }
        } catch (err) {
            console.error('Error fetching coupons:', err);
        }
    };

    const handleSaveCoupon = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const couponData = {
                ...couponForm,
                code: couponForm.code.toUpperCase(),
                updated_at: new Date().toISOString()
            };

            const { error } = editingCoupon
                ? await supabase.from('coupons' as any).update(couponData).eq('id', editingCoupon.id)
                : await supabase.from('coupons' as any).insert(couponData);

            if (error) throw error;

            toast.success(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully`);
            setIsCouponDialogOpen(false);
            fetchCoupons();
        } catch (err: any) {
            toast.error('Failed to save coupon: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to delete this archival incentive?')) return;
        try {
            const { error } = await supabase.from('coupons' as any).delete().eq('id', id);
            if (error) throw error;
            toast.success('Coupon removed from registry');
            fetchCoupons();
        } catch (err: any) {
            toast.error('Failed to delete: ' + err.message);
        }
    };

    const openCouponDialog = (coupon: any = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setCouponForm({
                code: coupon.code,
                description: coupon.description || '',
                discount_type: coupon.discount_type,
                discount_value: Number(coupon.discount_value),
                min_order_amount: Number(coupon.min_order_amount) || 0,
                is_active: coupon.is_active,
                usage_limit: coupon.usage_limit,
                usage_count: coupon.usage_count || 0,
                customer_ids: coupon.customer_ids || (coupon.customer_id ? [coupon.customer_id] : []),
                valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString() : null
            });
        } else {
            setEditingCoupon(null);
            setCouponForm({
                code: '',
                description: '',
                discount_type: 'flat',
                discount_value: 0,
                min_order_amount: 0,
                is_active: true,
                usage_limit: null,
                usage_count: 0,
                customer_ids: [],
                valid_until: null
            });
        }
        setIsCouponDialogOpen(true);
    };

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

            {/* Promo Codes Section */}
            <div className="mt-20">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="font-heading text-3xl font-bold tracking-tight uppercase">Incentive Registry</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Promo Codes & Privileges</p>
                    </div>
                    <Button onClick={() => openCouponDialog()} className="bg-[#111] text-white rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Initialize Key
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coupons.length === 0 ? (
                        <div className="col-span-full py-20 bg-accent/5 rounded-[3.5rem] border border-dashed border-accent/20 flex flex-col items-center justify-center text-center">
                            <Ticket className="w-12 h-12 text-accent/20 mb-6" />
                            <p className="font-heading text-xl font-bold text-primary/40 italic">No archival incentives registered.</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => (
                            <div key={coupon.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-accent/5 hover:shadow-xl transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />

                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <Badge className={`${coupon.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border-none rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest`}>
                                        {coupon.is_active ? 'Active Artifact' : 'Inactive'}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openCouponDialog(coupon)} className="w-8 h-8 flex items-center justify-center rounded-2xl bg-accent/5 text-accent hover:bg-accent hover:text-white transition-all">
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="w-8 h-8 flex items-center justify-center rounded-2xl bg-rose-500/5 text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h4 className="font-heading text-2xl font-black tracking-tighter mb-1 uppercase italic">{coupon.code}</h4>
                                    <p className="text-xs text-primary/40 font-medium italic mb-6 leading-relaxed line-clamp-2">{coupon.description || 'No detailed encryption provided.'}</p>

                                    <div className="pt-6 border-t border-accent/5 flex flex-wrap items-end justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-accent mb-1">Benefit</p>
                                            <p className="font-bold text-lg">
                                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` :
                                                    coupon.discount_type === 'free_delivery' ? 'FREESHIP' :
                                                        `$${coupon.discount_value} OFF`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/30 mb-1 italic">Utilization</p>
                                            <p className="font-bold text-sm text-primary/60">
                                                {coupon.usage_count || 0} / {coupon.usage_limit || '∞'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {coupon.valid_until && (
                                            <span className="text-[7px] font-black uppercase tracking-[0.2em] bg-accent/5 text-accent/60 px-3 py-1.5 rounded-full italic">
                                                Valid Until: {new Date(coupon.valid_until).toLocaleDateString()}
                                            </span>
                                        )}
                                        {(coupon.customer_ids?.length > 0 || coupon.customer_id) && (
                                            <span className="text-[7px] font-black uppercase tracking-[0.2em] bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full italic">
                                                Exclusive Member Key ({coupon.customer_ids?.length || 1})
                                            </span>
                                        )}
                                        {coupon.min_order_amount > 0 && (
                                            <span className="text-[7px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary/40 px-3 py-1.5 rounded-full italic">
                                                Threshold: ${coupon.min_order_amount}+
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Coupon Dialog */}
            <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                <DialogContent className="max-w-xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-black border-0 outline-none focus:ring-0 max-h-[70vh] flex flex-col">
                    <div className="bg-[#111] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                        <div className="flex items-center gap-4 relative z-10">
                            <Ticket className="w-8 h-8 text-accent" />
                            <div>
                                <h3 className="font-heading text-2xl font-bold tracking-tight uppercase italic">{editingCoupon ? 'Modify Incentive' : 'Initialize Key'}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Archival Privilege Protocol</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSaveCoupon} className="flex-1 overflow-hidden flex flex-col bg-white">
                        <div className="p-10 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-6 pb-40">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Access Code</Label>
                                        <Input
                                            value={couponForm.code}
                                            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                            required
                                            placeholder="MAISON2025"
                                            className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-black"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Discount Logic</Label>
                                        <Select
                                            value={couponForm.discount_type}
                                            onValueChange={(val) => setCouponForm({ ...couponForm, discount_type: val })}
                                        >
                                            <SelectTrigger className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-xl">
                                                <SelectItem value="flat">Flat Curated OFF</SelectItem>
                                                <SelectItem value="percentage">Percentage Valuation</SelectItem>
                                                <SelectItem value="free_delivery">Logistic Exemption</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Archival Description</Label>
                                    <Input
                                        value={couponForm.description}
                                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                                        placeholder="Complimentary archival access for preferred members."
                                        className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium italic"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Valuation Amount</Label>
                                        <Input
                                            type="number"
                                            value={couponForm.discount_value}
                                            onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                                            disabled={couponForm.discount_type === 'free_delivery'}
                                            className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Min order threshold</Label>
                                        <Input
                                            type="number"
                                            value={couponForm.min_order_amount}
                                            onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: Number(e.target.value) })}
                                            className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Usage Limit</Label>
                                        <Input
                                            type="number"
                                            value={couponForm.usage_limit || ''}
                                            onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value ? Number(e.target.value) : null })}
                                            placeholder="Unlimited"
                                            className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Temporal Expiry</Label>
                                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-14 bg-accent/5 border-none rounded-2xl px-6 justify-start text-left font-bold hover:bg-accent/10 transition-all",
                                                        !couponForm.valid_until && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
                                                    {couponForm.valid_until ? format(new Date(couponForm.valid_until), "PPP") : <span className="text-[11px] font-black uppercase tracking-widest opacity-30">Select Expiry Ritual</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 rounded-[2rem] border-none shadow-2xl bg-white animate-in zoom-in-95 duration-500" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={couponForm.valid_until ? new Date(couponForm.valid_until) : undefined}
                                                    onSelect={(date) => {
                                                        setCouponForm({ ...couponForm, valid_until: date ? date.toISOString() : null });
                                                        setIsCalendarOpen(false);
                                                    }}
                                                    initialFocus
                                                    className="font-sans"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Member Designation ({couponForm.customer_ids.length} Selected)</Label>
                                    <div className="relative">
                                        <div
                                            className="min-h-16 bg-accent/5 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-accent/10 transition-all border border-transparent shadow-sm group"
                                            onClick={() => setIsMemberSearchOpen(!isMemberSearchOpen)}
                                        >
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform flex-shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-wrap gap-2 max-w-[400px]">
                                                    {selectedCustomers.length > 0 ? (
                                                        selectedCustomers.map(c => (
                                                            <span key={c.user_id} className="inline-flex items-center gap-1.5 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-accent/10 animate-in zoom-in-95">
                                                                {c.full_name || c.email?.split('@')[0]}
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCouponForm({ ...couponForm, customer_ids: couponForm.customer_ids.filter(id => id !== c.user_id) });
                                                                    }}
                                                                    className="hover:text-rose-500 transition-colors"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-[11px] font-black uppercase tracking-widest opacity-30">Universal Registry Access</p>
                                                    )}
                                                </div>
                                            </div>
                                            {couponForm.customer_ids.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCouponForm({ ...couponForm, customer_ids: [] });
                                                    }}
                                                    className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {isMemberSearchOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)] p-6 z-50 border border-accent/5 animate-in slide-in-from-top-4 duration-500 max-h-[400px] flex flex-col">
                                                <div className="relative mb-6">
                                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                                    <Input
                                                        placeholder="Search by Identity, Email or UID..."
                                                        value={memberSearch}
                                                        onChange={(e) => setMemberSearch(e.target.value)}
                                                        className="h-14 bg-accent/5 border-none rounded-xl pl-14 pr-6 focus:ring-accent focus:bg-white transition-all text-sm font-bold"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="overflow-y-auto pr-2 custom-scrollbar space-y-2 flex-1">
                                                    <div
                                                        className={cn(
                                                            "p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 border border-transparent",
                                                            couponForm.customer_ids.length === 0 ? "bg-accent/5 border-accent/10" : "hover:bg-accent/5"
                                                        )}
                                                        onClick={() => {
                                                            setCouponForm({ ...couponForm, customer_ids: [] });
                                                        }}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary/40 text-[9px] font-black italic">ALL</div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Universal Registry Access</p>
                                                    </div>

                                                    {filteredCustomers.length === 0 ? (
                                                        <div className="py-10 text-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">No members found in registry matching your inquiry.</p>
                                                        </div>
                                                    ) : (
                                                        filteredCustomers.map(customer => {
                                                            const isSelected = couponForm.customer_ids.includes(customer.user_id);
                                                            return (
                                                                <div
                                                                    key={customer.user_id}
                                                                    className={cn(
                                                                        "p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 border border-transparent group",
                                                                        isSelected ? "bg-accent/5 border-accent/10" : "hover:bg-accent/5"
                                                                    )}
                                                                    onClick={() => {
                                                                        const newIds = isSelected
                                                                            ? couponForm.customer_ids.filter(id => id !== customer.user_id)
                                                                            : [...couponForm.customer_ids, customer.user_id];
                                                                        setCouponForm({ ...couponForm, customer_ids: newIds });
                                                                    }}
                                                                >
                                                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                                                        <User className="w-5 h-5" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-bold text-sm leading-none mb-1.5 truncate group-hover:text-accent transition-colors">{customer.full_name || 'Anonymous Collector'}</p>
                                                                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/30 truncate italic group-hover:text-accent/60 transition-colors">{customer.email}</p>
                                                                    </div>
                                                                    <div className={cn(
                                                                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                                        isSelected ? "bg-accent border-accent text-white" : "border-primary/10 bg-white"
                                                                    )}>
                                                                        {isSelected && <Check className="w-3 h-3" />}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                                <div className="mt-6 pt-6 border-t border-accent/5 flex justify-end">
                                                    <Button
                                                        type="button"
                                                        onClick={() => setIsMemberSearchOpen(false)}
                                                        className="h-10 px-8 bg-accent text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all"
                                                    >
                                                        Confirm Selection
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-accent/5 p-10 border-t border-accent/10">
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full h-16 bg-[#111] text-white font-black uppercase tracking-widest text-xs shadow-xl hover:bg-accent transition-all rounded-2xl"
                                >
                                    {isSaving ? 'Processing Protocol...' : editingCoupon ? 'Update Artifact' : 'Activate Incentive'}
                                </Button>
                            </DialogFooter>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default AdminSettings;
