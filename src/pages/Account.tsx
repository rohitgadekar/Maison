import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    User,
    MapPin,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    UserCircle,
    Mail,
    Phone as PhoneIcon,
    ShoppingBag,
    ShieldCheck,
    Globe,
    RefreshCw
} from "lucide-react";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/context/CurrencyContext";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

interface Profile {
    full_name: string | null;
    email: string | null;
    phone: string | null;
}

interface SavedAddress {
    id: string;
    label: string;
    full_name: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default: boolean;
}

const Account = () => {
    const { user } = useAuth();
    const { userCurrency, setUserCurrency, liveConversionEnabled, setLiveConversion } = useCurrency();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile>({ full_name: "", email: "", phone: "" });
    const [addresses, setAddresses] = useState<SavedAddress[]>([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

    // Address Form State
    const [addressForm, setAddressForm] = useState({
        label: "Home",
        full_name: "",
        address: "",
        city: "",
        postal_code: "",
        country: "USA",
        phone: "",
        is_default: false
    });

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchAddresses();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, email, phone")
                .eq("user_id", user?.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error: any) {
            console.error("Error fetching profile:", error.message);
        }
    };

    const fetchAddresses = async () => {
        try {
            const { data, error } = await supabase
                .from("saved_addresses")
                .select("*")
                .eq("user_id", user?.id)
                .order("is_default", { ascending: false });

            if (error) throw error;
            setAddresses(data || []);
        } catch (error: any) {
            console.error("Error fetching addresses:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone
                })
                .eq("user_id", user?.id);

            if (error) throw error;
            setIsEditingProfile(false);
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSaveAddress = async () => {
        try {
            if (editingAddressId) {
                const { error } = await supabase
                    .from("saved_addresses")
                    .update(addressForm)
                    .eq("id", editingAddressId);
                if (error) throw error;
                toast.success("Address updated");
            } else {
                const { error } = await supabase
                    .from("saved_addresses")
                    .insert([{ ...addressForm, user_id: user?.id }]);
                if (error) throw error;
                toast.success("Address added");
            }

            setIsAddingAddress(false);
            setEditingAddressId(null);
            resetAddressForm();
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            const { error } = await supabase
                .from("saved_addresses")
                .delete()
                .eq("id", id);
            if (error) throw error;
            toast.success("Address deleted");
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            // Unset previous default
            await supabase
                .from("saved_addresses")
                .update({ is_default: false })
                .eq("user_id", user?.id);

            // Set new default
            const { error } = await supabase
                .from("saved_addresses")
                .update({ is_default: true })
                .eq("id", id);

            if (error) throw error;
            fetchAddresses();
            toast.success("Default address updated");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const resetAddressForm = () => {
        setAddressForm({
            label: "Home",
            full_name: profile.full_name || "",
            address: "",
            city: "",
            postal_code: "",
            country: "USA",
            phone: profile.phone || "",
            is_default: false
        });
    };

    const startEditingAddress = (address: SavedAddress) => {
        setAddressForm({
            label: address.label,
            full_name: address.full_name,
            address: address.address,
            city: address.city,
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone || "",
            is_default: address.is_default
        });
        setEditingAddressId(address.id);
        setIsAddingAddress(true);
    };

    const PremiumLoader = () => (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative w-48 h-[1px] bg-accent/10 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/2 bg-accent animate-loading-bar" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/40 italic animate-pulse">
                Retrieving Identity...
            </span>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <PremiumLoader />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
            <SEO title="My Account" description="Manage your Maison profile and addresses." />
            <Header />
            <CartDrawer />

            <main className="flex-1 pt-32 sm:pt-48 pb-32">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-accent/10 pb-12">
                        <div>
                            <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-4 block">Dashboard</span>
                            <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tighter">
                                My <span className="italic font-light text-accent">Account</span>
                            </h1>
                        </div>
                        <Link to="/orders" className="h-14 px-10 bg-white border border-accent/10 text-primary font-black uppercase tracking-widest text-[10px] flex items-center rounded-full hover:border-accent hover:text-accent transition-all shadow-sm">
                            <ShoppingBag className="w-4 h-4 mr-3" /> View Orders
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Sidebar / Profile Info */}
                        <div className="space-y-12">
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-accent/5">
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-accent">
                                        <UserCircle className="w-12 h-12" />
                                    </div>
                                    <div>
                                        <h2 className="font-heading text-2xl font-bold tracking-tight">{profile.full_name || "Maison Member"}</h2>
                                        <p className="text-muted-foreground italic">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {isEditingProfile ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-accent">Full Name</Label>
                                                <Input
                                                    value={profile.full_name || ""}
                                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                    className="h-12 bg-accent/5 border-none rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-accent">Phone</Label>
                                                <Input
                                                    value={profile.phone || ""}
                                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                    className="h-12 bg-accent/5 border-none rounded-xl"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-4">
                                                <Button onClick={handleUpdateProfile} className="flex-1 rounded-full bg-primary text-white font-bold h-10">Save</Button>
                                                <Button onClick={() => setIsEditingProfile(false)} variant="ghost" className="rounded-full h-10">Cancel</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 text-primary/70">
                                                <Mail className="w-5 h-5 text-accent" />
                                                <span className="font-medium italic">{user?.email}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-primary/70">
                                                <PhoneIcon className="w-5 h-5 text-accent" />
                                                <span className="font-medium italic">{profile.phone || "No phone added"}</span>
                                            </div>
                                            <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="w-full rounded-xl border-accent/10 hover:bg-white hover:border-accent hover:text-accent font-black uppercase text-[10px] tracking-widest h-12">
                                                Edit Profile
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative group perspective-1000">
                                <div className="bg-[#0A0A0A] text-white p-10 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-700 hover:rotate-y-12 hover:scale-[1.02] border border-white/5 preserve-3d">
                                    {/* Holographic Accents */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-[80px] opacity-50 pulse-glow" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-[60px]" />

                                    {/* Archival Texture */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                    </div>

                                    <div className="relative z-10 space-y-12">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-heading text-xl font-bold italic tracking-tight mb-1">Maison Privé</h3>
                                                <p className="text-accent text-[8px] font-black uppercase tracking-[0.5em] italic">Archive Identity Card</p>
                                            </div>
                                            <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center">
                                                <ShieldCheck className="w-6 h-6 text-accent" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 italic font-mono">Registry Name</p>
                                                <p className="font-heading text-2xl font-bold tracking-tight uppercase truncate">{profile.full_name || "Maison Member"}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 pt-4">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 italic font-mono">Access Granted</p>
                                                    <p className="font-sans font-black text-[10px] tracking-widest text-white/80">
                                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase() : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 italic font-mono">Registry ID</p>
                                                    <p className="font-sans font-black text-[10px] tracking-widest text-white/80">
                                                        #{user?.id?.slice(0, 8).toUpperCase() || 'ANONYMOUS'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-accent">Authenticated Member</span>
                                            </div>
                                            <div className="text-[10px] font-black italic tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity">
                                                MAISON <span className="text-accent">ATELIER</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Monetary Preferences */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-accent/5">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 bg-accent/5 rounded-[2rem] flex items-center justify-center text-accent">
                                        <Globe className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-xl font-bold tracking-tight">Monetary Preferences</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Currency & Conversion</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Preferred Currency</Label>
                                        <Select value={userCurrency} onValueChange={(val: any) => setUserCurrency(val)}>
                                            <SelectTrigger className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-xl max-h-[300px]">
                                                {SUPPORTED_CURRENCIES.map((c) => (
                                                    <SelectItem key={c.code} value={c.code} className="font-medium cursor-pointer">
                                                        <span className="font-black w-8 inline-block">{c.symbol}</span> {c.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-accent/5">
                                        <div className="flex items-center gap-3">
                                            <RefreshCw className="w-5 h-5 text-accent" />
                                            <div>
                                                <p className="text-sm font-bold">Live Conversion</p>
                                                <p className="text-[10px] text-primary/50 italic font-medium">Auto-convert prices on hover</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setLiveConversion(!liveConversionEnabled)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${liveConversionEnabled ? 'bg-primary' : 'bg-input'
                                                }`}
                                        >
                                            <span
                                                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${liveConversionEnabled ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content / Addresses */}
                        <div className="lg:col-span-2 space-y-12">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading text-3xl font-bold tracking-tight">Saved <span className="text-accent italic">Addresses</span></h3>
                                <Button
                                    onClick={() => { resetAddressForm(); setIsAddingAddress(true); setEditingAddressId(null); }}
                                    className="rounded-full bg-accent text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-lg hover:bg-black transition-all"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add New
                                </Button>
                            </div>

                            {isAddingAddress && (
                                <div className="bg-white p-10 sm:p-12 rounded-[4rem] shadow-2xl border border-accent/5 animate-fade-in">
                                    <div className="flex justify-between items-center mb-10">
                                        <h4 className="font-heading text-2xl font-bold tracking-tight">{editingAddressId ? "Edit Archive Location" : "New Archive Location"}</h4>
                                        <Button variant="ghost" size="icon" onClick={() => setIsAddingAddress(false)} className="rounded-full">
                                            <X className="w-6 h-6" />
                                        </Button>
                                    </div>

                                    <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSaveAddress(); }}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Label</Label>
                                                <Input
                                                    placeholder="Home, Office, Studio"
                                                    value={addressForm.label}
                                                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                                                    className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Recipients Full Name</Label>
                                                <Input
                                                    placeholder="John Doe"
                                                    value={addressForm.full_name}
                                                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                                                    className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Street Address</Label>
                                            <Input
                                                placeholder="123 Maison Blvd, Ste 402"
                                                value={addressForm.address}
                                                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                                className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">City</Label>
                                                <Input
                                                    placeholder="Paris"
                                                    value={addressForm.city}
                                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Postal Code</Label>
                                                <Input
                                                    placeholder="75001"
                                                    value={addressForm.postal_code}
                                                    onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                                    className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Country</Label>
                                                <Input
                                                    placeholder="France"
                                                    value={addressForm.country}
                                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                                    className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="is_default"
                                                className="w-5 h-5 rounded-md border-accent text-accent focus:ring-accent"
                                                checked={addressForm.is_default}
                                                onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                            />
                                            <label htmlFor="is_default" className="text-sm font-medium italic text-primary/70">Set as default artifact location</label>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button type="submit" className="flex-1 h-16 bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl hover:bg-accent transition-all rounded-2xl">
                                                {editingAddressId ? "Update Location" : "Save Location"}
                                            </Button>
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingAddress(false)} className="h-16 px-10 rounded-2xl font-bold italic">
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div key={addr.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-accent/5 relative group hover:shadow-2xl transition-all duration-700">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-accent/5 rounded-2xl flex items-center justify-center text-accent">
                                                        <MapPin className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-accent">{addr.label}</p>
                                                        {addr.is_default && <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded-full uppercase font-black tracking-widest">Default</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => startEditingAddress(addr)} className="w-10 h-10 rounded-full hover:bg-accent/10 text-accent">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="w-10 h-10 rounded-full hover:bg-rose-50 text-rose-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="font-heading text-xl font-bold tracking-tight">{addr.full_name}</p>
                                                <p className="text-primary/70 font-medium italic text-lg leading-relaxed">
                                                    {addr.address}<br />
                                                    {addr.city}, {addr.postal_code}<br />
                                                    {addr.country}
                                                </p>
                                                {addr.phone && <p className="text-muted-foreground text-sm font-medium italic">{addr.phone}</p>}
                                            </div>

                                            {!addr.is_default && (
                                                <Button
                                                    onClick={() => handleSetDefault(addr.id)}
                                                    variant="ghost"
                                                    className="w-full mt-8 rounded-xl border border-dashed border-accent/20 hover:bg-white hover:border-accent hover:text-accent font-black uppercase text-[10px] tracking-widest h-12"
                                                >
                                                    Set as Default
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    !isAddingAddress && (
                                        <div className="col-span-1 md:col-span-2 text-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-accent/20">
                                            <MapPin className="w-12 h-12 text-accent/20 mx-auto mb-6" />
                                            <p className="font-heading text-xl italic text-muted-foreground">No archival locations saved yet.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Account;
