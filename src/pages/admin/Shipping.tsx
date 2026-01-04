import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, Plus, Trash2, ShieldCheck, Globe, Edit2 } from 'lucide-react';
import { PremiumLoader } from '@/components/PremiumLoader';
import { useCurrency } from '@/context/CurrencyContext';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface ShippingProvider {
    id: string;
    name: string;
    base_fee: number;
    delivery_estimate: string;
    is_active: boolean;
}

const AdminShipping = () => {
    const { storeCurrency, formatPrice } = useCurrency();
    const [providers, setProviders] = useState<ShippingProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        base_fee: '',
        delivery_estimate: ''
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [providerToDeleteId, setProviderToDeleteId] = useState<string | null>(null);

    const fetchProviders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('shipping_providers' as any)
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching providers:', error);
            toast.error('Failed to load logistics partners');
        } else {
            setProviders((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleOpenAdd = () => {
        setEditingProvider(null);
        setFormData({ name: '', base_fee: '', delivery_estimate: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (provider: ShippingProvider) => {
        setEditingProvider(provider);
        setFormData({
            name: provider.name,
            base_fee: provider.base_fee.toString(),
            delivery_estimate: provider.delivery_estimate
        });
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('shipping_providers' as any)
            .update({ is_active: !currentStatus })
            .eq('id', id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success('Logistics status updated');
            fetchProviders();
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProviderToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!providerToDeleteId) return;

        const { error } = await supabase
            .from('shipping_providers' as any)
            .delete()
            .eq('id', providerToDeleteId);

        if (error) {
            toast.error('Failed to remove provider');
        } else {
            toast.success('Provider removed from registry');
            fetchProviders();
        }
        setIsDeleteDialogOpen(false);
        setProviderToDeleteId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            base_fee: parseFloat(formData.base_fee),
            delivery_estimate: formData.delivery_estimate,
            is_active: editingProvider ? editingProvider.is_active : true
        };

        let error;
        if (editingProvider) {
            const { error: updateError } = await supabase
                .from('shipping_providers' as any)
                .update(payload)
                .eq('id', editingProvider.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('shipping_providers' as any)
                .insert(payload);
            error = insertError;
        }

        if (error) {
            toast.error(editingProvider ? 'Failed to update provider' : 'Failed to register provider');
        } else {
            toast.success(editingProvider ? 'Logistics partner updated' : 'New logistics partner registered');
            setIsModalOpen(false);
            fetchProviders();
        }
    };

    if (loading) {
        return <PremiumLoader message="Configuring Logistics Matrix..." />;
    }

    return (
        <div className="lg:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                    <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Logistics Management</span>
                    <h1 className="font-heading text-5xl font-bold tracking-tighter">Shipment <span className="italic font-light text-accent">Providers.</span></h1>
                </div>
                <Button
                    onClick={handleOpenAdd}
                    className="h-16 px-10 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black gap-3"
                >
                    <Plus className="w-4 h-4" />
                    Register Provider
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {providers.map((provider) => (
                    <div
                        key={provider.id}
                        className={`bg-white border rounded-[2.5rem] p-8 shadow-sm transition-all duration-700 group hover:shadow-2xl flex flex-col ${provider.is_active ? 'border-accent/10' : 'border-dashed border-primary/10 opacity-70'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-6">
                            {/* Prominent Logo Area */}
                            <div className="relative">
                                <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${provider.is_active ? 'bg-accent/5 text-accent shadow-sm' : 'bg-primary/5 text-primary/20'
                                    }`}>
                                    <Truck className="w-8 h-8" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white shadow-md flex items-center justify-center border border-accent/5">
                                    <Globe className="w-3 h-3 text-accent/40" />
                                </div>
                            </div>

                            {/* Functional Actions - Spaced Out */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleOpenEdit(provider)}
                                    className="w-10 h-10 rounded-xl border-accent/5 bg-white shadow-sm hover:bg-accent hover:text-white transition-all duration-500"
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={(e) => handleDeleteClick(provider.id, e)}
                                    className="w-10 h-10 rounded-xl border-accent/5 bg-white shadow-sm hover:bg-rose-500 hover:text-white transition-all duration-500"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-heading text-2xl font-black mb-1 tracking-tighter text-primary">
                                {provider.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-8">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent/40 italic">{provider.delivery_estimate}</span>
                                <div className="w-1 h-1 rounded-full bg-accent/20" />
                                <button
                                    onClick={() => handleToggleStatus(provider.id, provider.is_active)}
                                    className={`text-[8px] font-black uppercase tracking-widest transition-colors ${provider.is_active ? 'text-rose-400 hover:text-rose-600' : 'text-emerald-400 hover:text-emerald-600'}`}
                                >
                                    {provider.is_active ? 'Suspend' : 'Resume'}
                                </button>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-accent/5 flex items-center justify-between">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-2">Standard Protocol Fee</p>
                                <p className="text-4xl font-black tracking-tighter text-primary">{formatPrice(provider.base_fee, storeCurrency)}</p>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-2">Status</p>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${provider.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>
                                    <div className={`w-1 h-1 rounded-full ${provider.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                    {provider.is_active ? 'Operational' : 'On Standby'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#111]/40 backdrop-blur-md">
                    <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl animate-fade-in">
                        <h2 className="font-heading text-3xl font-black tracking-tighter mb-8 flex items-center gap-4">
                            <Globe className="w-8 h-8 text-accent" />
                            {editingProvider ? 'Edit Partner' : 'Partner Registry'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-primary/40">Provider Name</Label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. DHL Archival"
                                    className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-primary/40">Base Fee ({storeCurrency})</Label>
                                    <Input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.base_fee}
                                        onChange={e => setFormData({ ...formData, base_fee: e.target.value })}
                                        placeholder="25.00"
                                        className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-primary/40">Estimate</Label>
                                    <Input
                                        value={formData.delivery_estimate}
                                        onChange={e => setFormData({ ...formData, delivery_estimate: e.target.value })}
                                        placeholder="e.g. 3-5 Days"
                                        className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                                <Button type="submit" className="h-16 rounded-[1.5rem] bg-primary text-white shadow-xl hover:bg-black font-black uppercase tracking-widest text-[10px]">
                                    {editingProvider ? 'Update Partner' : 'Register Partner'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                    className="h-16 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-primary/30"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Premium Dissolution Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.2)] bg-white">
                    <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-rose-500 animate-pulse">
                            <Trash2 className="w-10 h-10" />
                        </div>

                        <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Logistics Dissolution</span>
                        <h2 className="text-3xl font-bold tracking-tighter mb-4 leading-tight">
                            Confirm <span className="italic font-light text-rose-500">Purge?</span>
                        </h2>
                        <p className="text-muted-foreground italic text-sm leading-relaxed mb-10 px-4">
                            You are about to dissolve this logistics provider from the master registry. This action is irreversible and will remove all associated service data.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="h-14 rounded-2xl border-accent/10 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                            >
                                Abort
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                className="h-14 rounded-2xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                            >
                                Dissolve Provider
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminShipping;
