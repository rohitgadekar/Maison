import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Truck, Globe, Box, ShieldCheck, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useCurrency } from '@/context/CurrencyContext';
import { PremiumLoader } from '@/components/PremiumLoader';

interface ShippingProvider {
    id: string;
    name: string;
    base_fee: number;
    delivery_estimate: string;
    is_active: boolean;
}

const Shipping = () => {
    const { storeCurrency, formatPrice } = useCurrency();
    const [providers, setProviders] = useState<ShippingProvider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProviders = async () => {
            const { data, error } = await supabase
                .from('shipping_providers' as any)
                .select('*')
                .eq('is_active', true)
                .order('base_fee', { ascending: true });

            if (!error && data) {
                setProviders(data as any[]);
            }
            setLoading(false);
        };
        fetchProviders();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
            <SEO title="Logistics Registry" description="View available archival delivery protocols and logistics partners." />
            <Header />
            <CartDrawer />

            <main className="flex-1 pt-32 sm:pt-48 pb-32">
                <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center mb-24">
                        <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-6 block italic">Logistics Ledger</span>
                        <h1 className="font-heading text-6xl sm:text-8xl font-bold mb-10 tracking-tighter leading-[0.9]">
                            Delivery <br />
                            <span className="italic font-light text-accent">Protocols.</span>
                        </h1>
                        <p className="text-xl text-primary/70 leading-relaxed font-medium mb-12 italic max-w-2xl mx-auto">
                            Our archival pieces are handled with utmost care. Below are the verified logistics partners currently authorized for artifact transport.
                        </p>
                    </div>

                    {loading ? (
                        <PremiumLoader message="Synchronizing Logistics Matrix..." />
                    ) : (
                        <div className="max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                                {providers.map((provider) => (
                                    <div
                                        key={provider.id}
                                        className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-accent/5 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 group"
                                    >
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-16 h-16 rounded-[1.75rem] bg-accent/5 flex items-center justify-center text-accent group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-sm border border-accent/10">
                                                <Truck className="w-8 h-8" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2">Protocol Fee</p>
                                                <p className="text-2xl font-black tracking-tighter text-accent">{formatPrice(provider.base_fee, storeCurrency)}</p>
                                            </div>
                                        </div>

                                        <h3 className="font-heading text-2xl font-black mb-3 tracking-tighter uppercase whitespace-nowrap overflow-hidden text-ellipsis">
                                            {provider.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mb-8">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 italic">{provider.delivery_estimate}</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                        </div>

                                        <p className="text-sm text-primary/50 italic leading-relaxed mb-10">
                                            Fully insured transit with verified archival handling protocols and global tracking integration.
                                        </p>

                                        <div className="pt-8 border-t border-accent/5 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-accent">
                                            <Globe className="w-3.5 h-3.5" />
                                            Global Logistics Eligible
                                        </div>
                                    </div>
                                ))}

                                {providers.length === 0 && (
                                    <div className="col-span-full py-32 bg-white rounded-[3.5rem] border border-dashed border-accent/10 text-center">
                                        <p className="font-heading text-2xl text-primary/30 italic">No logistics partners are currently authorized for transport.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto mt-32">
                        <div className="bg-[#111] text-white p-10 rounded-[2.5rem] shadow-xl group">
                            <Box className="w-10 h-10 text-accent mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="font-heading text-xl font-bold mb-4 uppercase tracking-tight">Our Packaging</h4>
                            <p className="text-white/50 italic leading-relaxed">
                                Every order arrives in our signature FSC-certified archival box, wrapped in acid-free silk tissue and secured with a wax seal.
                            </p>
                        </div>
                        <div className="bg-[#111] text-white p-10 rounded-[2.5rem] shadow-xl group">
                            <ShieldCheck className="w-10 h-10 text-accent mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="font-heading text-xl font-bold mb-4 uppercase tracking-tight">Fully Insured</h4>
                            <p className="text-white/50 italic leading-relaxed">
                                Maison takes full responsibility for your artifact until it reaches your hands. Every shipment is insured for its full retail value.
                            </p>
                        </div>
                        <div className="bg-accent text-white p-10 rounded-[2.5rem] shadow-xl group">
                            <Truck className="w-10 h-10 text-white mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="font-heading text-xl font-bold mb-4 uppercase tracking-tight">Track Your Journey</h4>
                            <p className="text-white/90 italic leading-relaxed">
                                Upon dispatch, you will receive a personalized tracking link to follow your artifact's voyage from our atelier to your home.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Shipping;
