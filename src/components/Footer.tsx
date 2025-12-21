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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-20 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <Link to="/" className="font-heading text-5xl font-black tracking-[0.4em] inline-block text-white hover:text-accent transition-all duration-700">
                MAISON
              </Link>
              <div className="flex items-center gap-4 mt-4 text-[9px] font-black uppercase tracking-[0.5em] text-accent italic">
                <span className="w-8 h-px bg-accent" />
                Permanent Archival Registry
              </div>
            </div>

            <p className="text-white font-heading max-w-sm text-xl leading-relaxed font-medium ">
              Curating timeless artifacts for those who appreciate the intersection of heritage craftsmanship and modern architectural integrity.
            </p>

            <div className="flex gap-8">
              {[
                { label: 'In', desc: 'Instagram' },
                { label: 'Pi', desc: 'Pinterest' },
                { label: 'Tw', desc: 'Twitter' }
              ].map((social) => (
                <div key={social.label} className="group flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:rotate-12 transition-all duration-500 cursor-pointer">
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">{social.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Registries */}
          <div className="lg:col-span-3 space-y-12">
            <div className="space-y-4">
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.6em] italic block">Registries /</span>
              <h4 className="font-heading text-2xl font-bold tracking-tight text-white">Collection Archives</h4>
            </div>
            <ul className="space-y-6">
              {collections.map((collection) => (
                <li key={collection.id}>
                  <Link to={`/shop?registry=${collection.slug}`} className="text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center group whitespace-nowrap">
                    <span className="w-0 group-hover:w-6 h-px bg-accent mr-0 group-hover:mr-4 transition-all duration-500 shrink-0" />
                    {collection.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/shop" className="text-accent hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center group italic pt-4 whitespace-nowrap">
                  <span className="w-0 group-hover:w-6 h-px bg-white mr-0 group-hover:mr-4 transition-all duration-500 shrink-0" />
                  Explore Entire Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Curation Categories */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.6em] italic block">Curation /</span>
              <h4 className="font-heading text-2xl font-bold tracking-tight text-white">Discovery</h4>
            </div>
            <ul className="space-y-6">
              <li>
                <Link to="/shop?collection=New Arrivals" className="text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center group whitespace-nowrap">
                  <span className="w-0 group-hover:w-6 h-px bg-accent mr-0 group-hover:mr-4 transition-all duration-500 shrink-0" />
                  New Artifacts
                </Link>
              </li>
              <li>
                <Link to="/shop?collection=Bestsellers" className="text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center group whitespace-nowrap">
                  <span className="w-0 group-hover:w-6 h-px bg-accent mr-0 group-hover:mr-4 transition-all duration-500 shrink-0" />
                  Vault Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Member Services */}
          <div className="lg:col-span-2 space-y-12">
            <div className="space-y-4">
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.6em] italic block">Members /</span>
              <h4 className="font-heading text-2xl font-bold tracking-tight text-white">Protocol</h4>
            </div>
            <ul className="space-y-6">
              <li>
                <Link to="/about" className="text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center group whitespace-nowrap">
                  <span className="w-0 group-hover:w-6 h-px bg-accent mr-0 group-hover:mr-4 transition-all duration-500 shrink-0" />
                  Our Philosophy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center group whitespace-nowrap">
                  <span className="w-0 group-hover:w-6 h-px bg-accent mr-0 group-hover:mr-4 transition-all duration-500 shrink-0" />
                  Concierge
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-white/30 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] flex items-center group whitespace-nowrap">
                  <span className="w-0 group-hover:w-6 h-px bg-accent mr-0 group-hover:mr-4 transition-all duration-500 shrink-0" />
                  Logistics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center lg:items-start gap-4">
            <p className="text-white text-[11px] font-black uppercase tracking-[0.5em]">
              © 2024 Maison Archive. Crafted for Longevity.
            </p>
            <p className="text-accent text-[10px] font-black uppercase tracking-[0.4em] italic">
              Designed in the Atelier
            </p>
          </div>

          <div className="flex gap-12">
            <Link to="/privacy" className="text-white hover:text-accent transition-colors text-[11px] font-black uppercase tracking-[0.4em]">
              Privacy Protocol
            </Link>
            <Link to="/terms" className="text-white hover:text-accent transition-colors text-[11px] font-black uppercase tracking-[0.4em]">
              Engagement Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
