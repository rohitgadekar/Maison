import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('collections')
        .select('id, name, slug')
        .eq('is_active', true)
        .limit(5);

      if (data) setCollections(data);
    };

    fetchCollections();
  }, []);

  return (
    <footer className={`bg-[#111] text-white py-32 ${className || ''}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
          <div className="lg:col-span-2 space-y-10">
            <Link to="/" className="font-heading text-4xl font-black tracking-[0.3em] inline-block text-white hover:text-accent transition-colors">
              MAISON
            </Link>
            <p className="text-white/40 max-w-sm text-lg leading-relaxed font-medium italic">
              "Curating timeless artifacts for those who appreciate the intersection of heritage craftsmanship and modern architectural integrity."
            </p>
            <div className="flex gap-6">
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                <span className="text-xs font-black italic">In</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                <span className="text-xs font-black italic">Ig</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer">
                <span className="text-xs font-black italic">Tw</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <h4 className="font-heading text-xs uppercase tracking-[0.5em] font-black text-accent">The Archive</h4>
            <ul className="space-y-6">
              <li>
                <Link to="/shop" className="text-white/30 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center group">
                  <span className="w-0 group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 transition-all" />
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?collection=New Arrivals" className="text-white/30 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center group">
                  <span className="w-0 group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 transition-all" />
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?collection=Bestsellers" className="text-white/30 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center group">
                  <span className="w-0 group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 transition-all" />
                  Bestsellers
                </Link>
              </li>
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link to={`/shop?registry=${collection.slug}`} className="text-white/30 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center group">
                    <span className="w-0 group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 transition-all" />
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <h4 className="font-heading text-xs uppercase tracking-[0.5em] font-black text-accent">Member Access</h4>
            <ul className="space-y-6">
              <li>
                <Link to="/about" className="text-white/30 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center group">
                  <span className="w-0 group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 transition-all" />
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/30 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center group">
                  <span className="w-0 group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 transition-all" />
                  Concierge
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-white/30 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] flex items-center group">
                  <span className="w-0 group-hover:w-4 h-px bg-accent mr-0 group-hover:mr-2 transition-all" />
                  Logistics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.5em]">
              © 2024 Maison Archive. Crafted for Longevity.
            </p>
            <p className="text-accent/40 text-[10px] font-black uppercase tracking-[0.4em] italic">
              Designed in the Atelier
            </p>
          </div>

          <div className="flex gap-12">
            <Link to="/privacy" className="text-white/20 hover:text-accent transition-colors text-[11px] font-black uppercase tracking-[0.4em]">
              Privacy Protocol
            </Link>
            <Link to="/terms" className="text-white/20 hover:text-accent transition-colors text-[11px] font-black uppercase tracking-[0.4em]">
              Engagement Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
