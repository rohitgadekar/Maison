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
import { PremiumCheckbox } from "@/components/PremiumCheckbox";
import { PremiumToggle } from "@/components/PremiumToggle";
import { PremiumAlert } from "@/components/PremiumAlert";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PremiumLoader } from "@/components/PremiumLoader";

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
    const [deleteAlert, setDeleteAlert] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

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

    const handleDeleteAddress = (id: string) => {
        setDeleteAlert({ open: true, id });
    };

    const confirmDeleteAddress = async () => {
        if (!deleteAlert.id) return;
        try {
            const { error } = await supabase
                .from("saved_addresses")
                .delete()
                .eq("id", deleteAlert.id);
            if (error) throw error;
            toast.success("Address deleted");
            fetchAddresses();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setDeleteAlert({ open: false, id: null });
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

                    <div className="space-y-16">
                        {/* Top Tier: Identity & Settings Grid (Bento Style) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Card 1: Profile Management */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-accent/5 h-full flex flex-col justify-between">
                                <div className="space-y-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-accent bg-accent/5">
                                            <UserCircle className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h2 className="font-heading text-2xl font-bold tracking-tight line-clamp-1">{profile.full_name || "Maison Member"}</h2>
                                            <p className="text-muted-foreground italic text-sm">{user?.email}</p>
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
                                                    <span className="font-medium italic text-sm">{user?.email}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-primary/70">
                                                    <PhoneIcon className="w-5 h-5 text-accent" />
                                                    <span className="font-medium italic text-sm">{profile.phone || "No phone added"}</span>
                                                </div>
                                                <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="w-full rounded-xl border-accent/10 hover:bg-white hover:border-accent hover:text-accent font-black uppercase text-[10px] tracking-widest h-12">
                                                    Edit Profile
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Archive Identity (Holographic) */}
                            <div className="relative group perspective-1000 h-full">
                                <div className="bg-[#0A0A0A] text-white p-10 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-700 hover:rotate-y-12 hover:scale-[1.02] border border-white/5 preserve-3d h-full flex flex-col justify-between">
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
                                    </div>

                                    <div className="pt-8 mt-auto border-t border-white/5 flex items-center justify-between relative z-10">
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

                            {/* Card 3: Monetary Preferences */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-accent/5 h-full flex flex-col justify-between">
                                <div>
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
                                                <SelectTrigger className="h-20 bg-white border border-accent/10 rounded-[2rem] px-6 focus:ring-accent/20 focus:ring-4 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-accent/30 hover:-translate-y-0.5 group overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                    <div className="flex items-center gap-4 relative z-10 w-full">
                                                        <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                            <Globe className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-accent/60 mb-0.5 group-hover:text-accent transition-colors truncate w-full">Personal Standard</span>
                                                            <SelectValue />
                                                        </div>
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-[2rem] border-accent/10 bg-white/95 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)] p-2 min-w-[320px] animate-in fade-in zoom-in-95 duration-300">
                                                    <div className="px-6 py-3 border-b border-accent/10 mb-2">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-accent/50 italic">Global Markets</p>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-1">
                                                        {SUPPORTED_CURRENCIES.map((c) => (
                                                            <SelectItem
                                                                key={c.code}
                                                                value={c.code}
                                                                className="group/item relative py-3 px-4 rounded-2xl cursor-pointer outline-none transition-all duration-300 border border-transparent focus:bg-accent focus:text-white hover:bg-accent hover:text-white data-[state=checked]:bg-accent/5 data-[state=checked]:border-accent/20"
                                                            >
                                                                <div className="flex items-center gap-4 relative z-10">
                                                                    <span className="font-black text-xl w-8 text-center opacity-40 group-hover/item:opacity-100 group-focus/item:opacity-100 group-data-[state=checked]/item:text-accent group-data-[state=checked]/item:opacity-100 transition-opacity text-primary group-hover/item:text-white group-focus/item:text-white">
                                                                        {c.symbol}
                                                                    </span>
                                                                    <div className="flex flex-col items-start">
                                                                        <span className="font-bold text-sm leading-none mb-1 text-primary group-hover/item:text-white group-focus/item:text-white group-data-[state=checked]/item:text-primary">
                                                                            {c.label}
                                                                        </span>
                                                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40 group-hover/item:text-white group-focus/item:text-white group-hover/item:opacity-80 group-data-[state=checked]/item:text-accent">
                                                                            {c.code}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-accent/5 rounded-2xl border border-accent/5 mt-8">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="w-5 h-5 text-accent" />
                                        <div>
                                            <p className="text-sm font-bold">Live Conversion</p>
                                            <p className="text-[10px] text-primary/50 italic font-medium">Auto-convert prices on hover</p>
                                        </div>
                                    </div>
                                    <PremiumToggle
                                        checked={liveConversionEnabled}
                                        onCheckedChange={() => setLiveConversion(!liveConversionEnabled)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Tier: Addresses Section */}
                        <div className="space-y-12">
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
                                <div className="bg-white p-10 sm:p-12 rounded-[4rem] shadow-2xl border border-accent/5 animate-fade-in max-w-4xl mx-auto">
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
                                            <PremiumCheckbox
                                                id="is_default"
                                                checked={addressForm.is_default}
                                                onChange={(checked) => setAddressForm({ ...addressForm, is_default: checked })}
                                                label="Set as default artifact location"
                                            />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                                    <Button variant="ghost" size="icon" onClick={() => startEditingAddress(addr)} className="w-10 h-10 rounded-full hover:bg-accent/10 text-accent hover:text-accent">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)} className="w-10 h-10 rounded-full hover:bg-rose-50 text-rose-500 hover:text-rose-500">
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
                                        <div className="col-span-full py-20 bg-white/50 rounded-[3rem] border border-dashed border-accent/20 text-center">
                                            <MapPin className="w-12 h-12 text-accent/20 mx-auto mb-6" />
                                            <p className="font-heading text-xl italic text-muted-foreground">No archival locations saved yet.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <PremiumAlert
                        open={deleteAlert.open}
                        onOpenChange={(open) => setDeleteAlert({ ...deleteAlert, open })}
                        title="Delete Location"
                        description="Are you sure you want to remove this address from your archive? This artifact cannot be recovered once purged."
                        onConfirm={confirmDeleteAddress}
                        confirmText="Purge Address"
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Account;
