import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ArrowRight, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      <SEO title="About Maison" description="The art of quiet luxury and archival design." />
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-32 pb-20 lg:pt-20 lg:pb-0">
        {/* Editorial Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="max-w-xl">
              <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-6 block">Est. 2024</span>
              <h1 className="font-heading text-6xl sm:text-8xl font-bold mb-10 tracking-tighter leading-[0.9]">
                The Art of <br />
                <span className="italic font-light text-accent">Quiet Luxury.</span>
              </h1>
              <p className="text-xl text-primary/70 leading-relaxed font-medium mb-12 italic">
                Maison was born from a singular vision: to curate a collection of artifacts that celebrate the profound beauty of simplicity and the permanence of quality.
              </p>
              <div className="flex gap-12 items-center">
                <div>
                  <p className="text-3xl font-bold mb-1">12k+</p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-accent">Admirers</p>
                </div>
                <div className="w-px h-12 bg-accent/20" />
                <div>
                  <p className="text-3xl font-bold mb-1">4.9</p>
                  <p className="text-[10px] uppercase tracking-widest font-black text-accent">Rating</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="h-[75vh] mt-8 rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
                <img
                  src="https://images.unsplash.com/photo-1707231510294-cc31617c9316?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Maison Aesthetic"
                  className="w-full h-full object-cover  brightness-90 hover:scale-110 transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-accent rounded-full flex items-center justify-center p-8 text-white text-center leading-tight shadow-2xl animate-pulse">
                <p className="text-xs font-black uppercase tracking-widest">Crafted for Longevity</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Philosophy */}
        <section className="py-32 bg-white rounded-[4rem] mb-32 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-4xl sm:text-6xl font-black mb-16 tracking-tighter">The <span className="text-accent italic">Philosophy</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold uppercase tracking-tight">Curation Over Consumption</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    In a world of fast-moving trends, we choose the deliberate path. Every artifact in our collection is stress-tested for both aesthetic endurance and physical longevity. We don't just sell products; we offer investments for your daily rituals.
                  </p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold uppercase tracking-tight">Architectural Integrity</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    We believe that the form of an object should be as honest as its material. From the weave of our cashmeres to the grain of our leathers, Maison stands for invisible details that reveal themselves only through years of intimate use.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Atelier Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="bg-[#111] text-white rounded-[3rem] overflow-hidden relative group shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative min-h-[500px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1575299899528-a8a3dbcefc29?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDd8fHxlbnwwfHx8fHw%3D"
                  alt="Craftsmanship"
                  className="absolute inset-0 w-full h-full object-cover grayscale  transition-transform duration-1000 group-hover:scale-110  "
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-transparent to-transparent hidden lg:block" />
              </div>
              <div className="p-12 sm:p-24 flex flex-col justify-center relative z-10">
                <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-8 block">The Workspace</span>
                <h2 className="font-heading text-5xl sm:text-6xl font-black mb-10 leading-[1.1] italic">
                  Inside the <br />
                  <span className="text-white/30 not-italic">Atelier</span>
                </h2>
                <p className="text-white/50 mb-12 text-xl max-w-md leading-relaxed font-medium">
                  Located in the heart of the design district, our studio is where raw textures meet refined silhouettes. It is a space of constant experimentation and quiet focus.
                </p>
                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Verified <br />Sourcing</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <Globe className="w-5 h-5 text-accent shrink-0" />
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Global <br />Artisans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className=" container mx-auto px-4 sm:px-6 lg:px-8 py-32 bg-white rounded-[4rem] mb-32 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
              <div className="text-center group">
                <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 group-hover:bg-accent group-hover:rotate-12 transition-all duration-500 shadow-sm">
                  <Zap className="w-8 h-8 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase">Performance</h3>
                <p className="text-muted-foreground font-medium leading-relaxed italic">
                  Each piece is designed to outperform its predecessors in both durability and aesthetic relevance.
                </p>
              </div>

              <div className="text-center group pt-12 md:pt-0">
                <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 group-hover:bg-accent group-hover:-rotate-12 transition-all duration-500 shadow-sm">
                  <Globe className="w-8 h-8 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase">Conscious</h3>
                <p className="text-muted-foreground font-medium leading-relaxed italic">
                  We believe true luxury never comes at the cost of the environment or the hands that crafted it.
                </p>
              </div>

              <div className="text-center group pt-12 md:pt-0">
                <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center mx-auto mb-10 group-hover:bg-accent group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <ShieldCheck className="w-8 h-8 text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-6 tracking-tight uppercase">Integrity</h3>
                <p className="text-muted-foreground font-medium leading-relaxed italic">
                  No shortcuts. No compromises. From the first sketch to the final stitch, integrity is our only metric.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Premium CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-32">
          <div className="bg-accent text-white p-16 sm:p-24 rounded-[3rem] text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl transition-transform duration-[3s] group-hover:scale-125" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-heading text-5xl sm:text-7xl font-bold mb-10 italic tracking-tighter">Become part of <br />the Archive.</h2>
              <p className="text-white/80 mb-12 text-xl font-medium max-w-md mx-auto italic">
                Connect with our concierge for private viewings or archival inquiries.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a
                  href="mailto:hello@maison.com"
                  className="h-14 px-12 bg-white text-black font-black uppercase tracking-widest text-xs flex items-center shadow-2xl hover:bg-black hover:text-white transition-all rounded-xl"
                >
                  Contact Concierge
                </a>
                <Link
                  to="/shop"
                  className="h-14 px-12 border-2 border-white/20 text-white font-black uppercase tracking-widest text-xs flex items-center hover:bg-white/10 transition-all rounded-xl"
                >
                  Explore Shop <ArrowRight className="ml-3 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
