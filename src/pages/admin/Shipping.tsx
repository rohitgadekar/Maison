import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Truck, Plus, Trash2, ShieldCheck, Globe, Edit2 } from 'lucide-react';
import { PremiumLoader } from '@/components/PremiumLoader';

interface ShippingProvider {
    id: string;
    name: string;
    base_fee: number;
    delivery_estimate: string;
    is_active: boolean;
}

const AdminShipping = () => {
    const [providers, setProviders] = useState<ShippingProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        base_fee: '',
        delivery_estimate: ''
    });

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

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('shipping_providers' as any)
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Failed to remove provider');
        } else {
            toast.success('Provider removed from registry');
            fetchProviders();
        }
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
                        className={`bg-white border rounded-[3rem] p-10 shadow-sm transition-all duration-700 group hover:shadow-2xl ${provider.is_active ? 'border-accent/10' : 'border-dashed border-primary/10 opacity-60'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${provider.is_active ? 'bg-accent/5 text-accent' : 'bg-primary/5 text-primary/30'
                                }`}>
                                <Truck className="w-7 h-7" />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenEdit(provider)}
                                    className="rounded-full hover:bg-accent/5 transition-opacity"
                                >
                                    <Edit2 className="w-4 h-4 text-primary/30 group-hover:text-accent" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleStatus(provider.id, provider.is_active)}
                                    className="rounded-full hover:bg-accent/5 text-[8px] font-black uppercase tracking-widest text-primary/30 hover:text-accent"
                                >
                                    {provider.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(provider.id)}
                                    className="rounded-full hover:bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <h3 className="font-heading text-2xl font-black mb-1 text-primary">{provider.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/40 italic mb-8">{provider.delivery_estimate}</p>

                        <div className="pt-8 border-t border-accent/5 flex items-center justify-between">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-1">Standard Fee</p>
                                <p className="text-3xl font-black tracking-tighter text-primary">${Number(provider.base_fee).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-1">Status</p>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${provider.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    <ShieldCheck className="w-3 h-3" />
                                    {provider.is_active ? 'Operational' : 'Suspended'}
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
                                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2 text-primary/40">Base Fee ($)</Label>
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
        </div>
    );
};

export default AdminShipping;
