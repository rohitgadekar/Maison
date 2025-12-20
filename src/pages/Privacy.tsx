import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { SEO } from '@/components/SEO';

const Privacy = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
            <SEO title="Privacy" description="Maison Privacy Protocol." />
            <Header />
            <CartDrawer />

            <main className="flex-1 pt-32 sm:pt-48 pb-32">
                <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-6 block">Legal Architecture</span>
                        <h1 className="font-heading text-6xl sm:text-7xl font-bold mb-16 tracking-tighter leading-[0.9]">
                            Privacy <br />
                            <span className="italic font-light text-accent">Protocol.</span>
                        </h1>

                        <div className="bg-white p-12 sm:p-20 rounded-[4rem] shadow-sm border border-accent/5 prose prose-primary max-w-none">
                            <div className="space-y-16">
                                <section>
                                    <h2 className="font-heading text-3xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">Our Commitment</h2>
                                    <p className="text-lg text-primary/70 leading-relaxed font-medium italic">
                                        At Maison, we respect the sanctity of your private data as much as we respect the craftsmanship of our goods. This protocol outlines how your personal artifacts—your data—are handled within our inner circle.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">1. Data Collection</h2>
                                    <p className="text-muted-foreground leading-relaxed font-medium mb-4">
                                        We collect only what is essential to provide our bespoke service:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-4 text-muted-foreground font-medium italic">
                                        <li>Identity artifacts (Name, email, contact details).</li>
                                        <li>Logistical coordinates (Shipping and billing addresses).</li>
                                        <li>Transaction history (Archival pursuit records).</li>
                                        <li>Digital impressions (Technical data needed to maintain site performance).</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">2. The Usage</h2>
                                    <p className="text-muted-foreground leading-relaxed font-medium italic">
                                        Your data remains within the Maison ecosystem. We use it to fulfill your orders, provide archival assistance, and—with your explicit consent—invite you to become part of our inner circle via the Maison Privé newsletter.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase border-b border-accent/10 pb-4">3. Security Mastery</h2>
                                    <p className="text-muted-foreground leading-relaxed font-medium italic">
                                        We employ industry-leading encryption to ensure your data is as secure as an archival vault. We do not sell, trade, or compromise your personal information for third-party gain.
                                    </p>
                                </section>

                                <div className="bg-[#111] text-white p-12 rounded-[2.5rem] mt-20">
                                    <p className="text-xs uppercase tracking-[0.3em] font-black text-accent mb-4">Last Modified</p>
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

export default Privacy;
