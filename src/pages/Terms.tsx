import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { SEO } from '@/components/SEO';

const Terms = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
            <SEO title="Terms" description="Maison Terms of Engagement." />
            <Header />
            <CartDrawer />

            <main className="flex-1 pt-32 sm:pt-48 pb-32">
                <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-6 block">The Agreement</span>
                        <h1 className="font-heading text-6xl sm:text-7xl font-bold mb-16 tracking-tighter leading-[0.9]">
                            Terms of <br />
                            <span className="italic font-light text-accent">Engagement.</span>
                        </h1>

                        <div className="bg-white p-12 sm:p-20 rounded-[4rem] shadow-sm border border-accent/5 prose prose-primary max-w-none">
                            <div className="space-y-16">
                                <section>
                                    <h2 className="font-heading text-3xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">Introduction</h2>
                                    <p className="text-lg text-primary/70 leading-relaxed font-medium italic">
                                        By entering the Maison atelier—this digital space—you agree to abide by our terms of engagement. These principles ensure a safe, high-quality experience for all admirers of fine goods.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">1. Acquisition</h2>
                                    <p className="text-muted-foreground leading-relaxed font-medium italic">
                                        All acquisitions are subject to archival availability. We reserve the right to limit quantities or refuse service should we suspect engaging in non-personal, commercial reselling that compromises our brand integrity.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">2. Intellectual Estate</h2>
                                    <p className="text-muted-foreground leading-relaxed font-medium italic">
                                        The imagery, typography, and designs within this space are the intellectual estate of Maison. Unauthorized replication or usage is strictly prohibited.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">3. Returns & Exchanges</h2>
                                    <p className="text-muted-foreground leading-relaxed font-medium italic">
                                        Artifacts in pristine, unused condition may be returned within 14 days of delivery. Custom archival commissions or limited edition drops are final sale unless otherwise specified.
                                    </p>
                                </section>

                                <div className="bg-[#111] text-white p-12 rounded-[2.5rem] mt-20">
                                    <p className="text-xs uppercase tracking-[0.3em] font-black text-accent mb-4">Effective Date</p>
                                    <p className="text-xl italic font-light">December 20, 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Terms;
