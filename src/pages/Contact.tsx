import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Contact = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
            <SEO title="Concierge" description="Contact Maison Concierge for assistance." />
            <Header />
            <CartDrawer />

            <main className="flex-1 pt-32 sm:pt-48">
                <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-6 block text-center">Inquiries</span>
                        <h1 className="font-heading text-6xl sm:text-8xl font-bold mb-10 tracking-tighter leading-[0.9]">
                            Connect with <br />
                            <span className="italic font-light text-accent">Concierge.</span>
                        </h1>
                        <p className="text-xl text-primary/70 leading-relaxed font-medium mb-12 italic max-w-2xl mx-auto">
                            Whether you have a question about our collections or need assistance with an archival piece, our team is here to provide exceptional service.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        {/* Contact Information */}
                        <div className="space-y-12">
                            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-accent/5 transition-all duration-700 hover:shadow-2xl">
                                <h3 className="font-heading text-2xl font-bold mb-8 tracking-tight uppercase">Direct Channels</h3>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6 group">
                                        <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center group-hover:bg-accent transition-all duration-500">
                                            <Mail className="w-6 h-6 text-accent group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-accent mb-1">Email</p>
                                            <p className="text-lg font-bold">concierge@maison.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 group">
                                        <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center group-hover:bg-accent transition-all duration-500">
                                            <Phone className="w-6 h-6 text-accent group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-accent mb-1">Phone</p>
                                            <p className="text-lg font-bold">+1 (888) MAISON-01</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 group">
                                        <div className="w-14 h-14 bg-accent/5 rounded-2xl flex items-center justify-center group-hover:bg-accent transition-all duration-500">
                                            <MapPin className="w-6 h-6 text-accent group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-accent mb-1">Atelier</p>
                                            <p className="text-lg font-bold italic">72nd Archive St, Design District</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#111] text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-[3s] group-hover:scale-125" />
                                <h3 className="font-heading text-2xl font-bold mb-6 italic tracking-tight relative z-10">Private Viewings</h3>
                                <p className="text-white/50 mb-8 text-lg font-medium italic relative z-10">
                                    Interested in an exclusive viewing of our upcoming collection? Our atelier is open for private appointments.
                                </p>
                                <Button variant="outline" className="border-white/20 text-black hover:bg-white hover:text-black rounded-xl h-12 px-8 relative z-10">
                                    Book Appointment <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-12 sm:p-16 rounded-[4rem] shadow-sm border border-accent/5">
                            <h3 className="font-heading text-3xl font-bold mb-10 tracking-tight text-center">Send a Message</h3>
                            <form className="space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Full Name</label>
                                        <Input placeholder="John Doe" className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Email Address</label>
                                        <Input placeholder="john@example.com" type="email" className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Topic</label>
                                    <Input placeholder="Archival Inquiry" className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-accent ml-2">Message</label>
                                    <Textarea placeholder="How can we assist you?" className="min-h-[200px] bg-accent/5 border-none rounded-[2rem] px-6 py-4 focus:ring-accent focus:bg-white transition-all font-medium resize-none" />
                                </div>
                                <Button className="w-full h-16 bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl hover:bg-accent transition-all rounded-2xl">
                                    Submit Inquiry
                                </Button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
