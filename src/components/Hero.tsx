import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] lg:min-h-screen flex items-center bg-[#FFFAF5] overflow-hidden pt-32 pb-20 lg:pt-32 lg:pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center animate-fade-in">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="text-[10px] uppercase tracking-[0.5em] text-accent font-black mb-6 lg:mb-10 block">
              Volume I: The Archetype Collection
            </span>
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-[6rem] font-bold leading-[0.9] lg:leading-[0.85] mb-8 lg:mb-10 tracking-tighter">
              The Modern <br className="hidden sm:block" />
              <span className="italic font-light text-accent text-[0.95em]">Curatorship.</span>
            </h1>
            <p className="text-lg lg:text-xl text-primary/60 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10 lg:mb-14 font-medium italic">
              Discover a meticulously curated archive of essentials designed for those who
              value heritage craftsmanship and timeless architectural integrity.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 lg:gap-6">
              <Button asChild size="lg" className="h-16 lg:h-20 px-8 lg:px-12 bg-primary text-white hover:bg-black rounded-full text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] shadow-2xl transition-all">
                <Link to="/shop">
                  Explore Archive
                  <ArrowRight className="ml-4 w-4 h-4 lg:w-5 lg:h-5 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 lg:h-20 px-8 lg:px-12 rounded-full border-black/10 hover:text-white text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] transition-all">
                <Link to="/about">Our Philosophy</Link>
              </Button>
            </div>

            <div className="mt-12 lg:mt-20 flex items-center justify-center lg:justify-start gap-8 lg:gap-16">
              <div>
                <p className="font-heading text-2xl lg:text-3xl font-black tracking-tighter">18k+</p>
                <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-primary/30 font-black mt-2">Archives</p>
              </div>
              <div className="w-px h-10 lg:h-12 bg-accent/10" />
              <div>
                <p className="font-heading text-2xl lg:text-3xl font-black tracking-tighter">4.96</p>
                <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-primary/30 font-black mt-2">Prestige</p>
              </div>
              <div className="w-px h-10 lg:h-12 bg-accent/10" />
              <div>
                <p className="font-heading text-2xl lg:text-3xl font-black tracking-tighter">Atelier</p>
                <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.3em] text-primary/30 font-black mt-2">Origin</p>
              </div>
            </div>
          </div>

          <div className="relative lg:block hidden">
            <div className="aspect-[4/5] relative z-10 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] group">
              <img
                src="https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Maison Editorial"
                className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Decorative backgrounds */}
            <div className="absolute -top-12 -right-12 w-full h-full bg-accent/5 -z-10 rounded-[4rem]" />
            <div className="absolute -bottom-12 -left-12 w-4/5 h-4/5 border-2 border-accent/10 -z-10 rounded-[4rem]" />

            <div className="absolute top-20 -right-8 w-32 h-32 bg-white/80 backdrop-blur-xl rounded-full flex items-center justify-center p-4 z-20 shadow-xl border border-white/50 hidden xl:flex rotate-12">
              <p className="text-center font-heading font-black leading-none text-primary">
                <span className="text-4xl">25</span> <br />
                <span className="text-[10px] uppercase tracking-widest text-[#D97706]">New</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
