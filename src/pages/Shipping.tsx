import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Truck, Globe, Box, ShieldCheck } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Shipping = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
            <SEO title="Logistics" description="Shipping and delivery information." />
            <Header />
            <CartDrawer />

            <main className="flex-1 pt-32 sm:pt-48">
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-6 block">Logistics</span>
                        <h1 className="font-heading text-6xl sm:text-8xl font-bold mb-10 tracking-tighter leading-[0.9]">
                            Shipping & <br />
                            <span className="italic font-light text-accent">Delivery.</span>
                        </h1>
                        <p className="text-xl text-primary/70 leading-relaxed font-medium mb-12 italic max-w-2xl mx-auto">
                            Our archival pieces are handled with utmost care. From our atelier to your doorstep, every journey is insured and tracked.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                        {/* Delivery Tiers */}
                        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-accent/5 transition-all duration-700 hover:shadow-2xl">
                            <h3 className="font-heading text-3xl font-bold mb-10 tracking-tight flex items-center gap-4 uppercase">
                                <Truck className="w-8 h-8 text-accent" /> Domestic
                            </h3>
                            <div className="space-y-10">
                                <div className="border-b border-accent/10 pb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-lg">Standard Signature</p>
                                        <p className="text-accent font-black">Complimentary</p>
                                    </div>
                                    <p className="text-muted-foreground italic">3-5 Business Days. Fully insured with signature required.</p>
                                </div>
                                <div className="border-b border-accent/10 pb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-lg">Priority Archival</p>
                                        <p className="text-accent font-black">$25.00</p>
                                    </div>
                                    <p className="text-muted-foreground italic">1-2 Business Days. Overnight handling for urgent arrivals.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-accent/5 transition-all duration-700 hover:shadow-2xl">
                            <h3 className="font-heading text-3xl font-bold mb-10 tracking-tight flex items-center gap-4 uppercase">
                                <Globe className="w-8 h-8 text-accent" /> International
                            </h3>
                            <div className="space-y-10">
                                <div className="border-b border-accent/10 pb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-lg">Global Boutique</p>
                                        <p className="text-accent font-black">$45.00</p>
                                    </div>
                                    <p className="text-muted-foreground italic">7-14 Business Days. Customs handling and premium tracking included.</p>
                                </div>
                                <div className="border-b border-accent/10 pb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-lg">Express Worldwide</p>
                                        <p className="text-accent font-black">$80.00</p>
                                    </div>
                                    <p className="text-muted-foreground italic">3-5 Business Days. Priority customs clearance and white-glove service.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto mt-20">
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
