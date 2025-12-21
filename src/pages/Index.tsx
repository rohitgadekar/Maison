import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCcw, Headphones, Star, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/data/products';
import { SEO } from '@/components/SEO';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch featured products (top 4 active ones)
      const { data: productsData, error: productsError } = await (supabase
        .from('products') as any)
        .select('*')
        .eq('is_active', true)
        .ilike('tag', 'new')
        .order('created_at', { ascending: false })
        .limit(4);

      if (productsError) {
        console.error('Error fetching featured products:', productsError);
      } else {
        const mapped = (productsData as any[]).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category,
          image: item.image_url || item.image,
          badge: item.badge,
          sizes: item.sizes,
          tag: item.tag,
        }));
        setFeaturedProducts(mapped as Product[]);
      }

      // Fetch featured collections with their products
      const { data: colsData, error: colsError } = await supabase
        .from('collections')
        .select('id, name, slug, description')
        .eq('is_active', true)
        .limit(2);

      if (colsData) {
        const collectionsWithProducts = await Promise.all(colsData.map(async (col) => {
          // Join with products table through collection_products
          const { data: joinData } = await (supabase
            .from('collection_products') as any)
            .select('products(image_url)')
            .eq('collection_id', col.id);

          const productPool = (joinData as any[])?.map(item => item.products?.image_url).filter(Boolean) || [];

          // Randomly pick 4 images from the collection pool
          const selected = productPool.sort(() => 0.5 - Math.random()).slice(0, 4);

          return {
            ...col,
            previewImages: selected
          };
        }));
        setFeaturedCollections(collectionsWithProducts);
      }

      // Fetch unique categories and pick a representative product image for each
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('products')
        .select('category, image_url')
        .eq('is_active', true);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        const uniqueCategories = Array.from(new Set(categoriesData.map(c => c.category)))
          .map(name => {
            const productWithImage = categoriesData.find(c => c.category === name && c.image_url);
            return {
              name,
              image: productWithImage?.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=450&fit=crop'
            };
          });
        setCategories(uniqueCategories);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      <SEO title="Home" description="Welcome to Maison. Curated archival fashion and lifestyle goods." />
      <Header />
      <CartDrawer />
      <main className="flex-1">
        <Hero />

        <section className="bg-white/50">
          <FeaturedProducts products={featuredProducts} />
        </section>

        {/* Trust Badges */}
        <section className="py-24  bg-white/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-sm group-hover:shadow-xl">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xs font-black uppercase tracking-[0.3em] mb-3 text-primary">Global Logistics</h3>
                <p className="text-sm text-primary/40 leading-relaxed font-medium italic">Complimentary on sessions above $150</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-sm group-hover:shadow-xl">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xs font-black uppercase tracking-[0.3em] mb-3 text-primary">Vault Security</h3>
                <p className="text-sm text-primary/40 leading-relaxed font-medium italic">End-to-end archival encryption</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-sm group-hover:shadow-xl">
                  <RefreshCcw className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xs font-black uppercase tracking-[0.3em] mb-3 text-primary">Exchange Protocol</h3>
                <p className="text-sm text-primary/40 leading-relaxed font-medium italic">30-day curated return window</p>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-accent/5 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-sm group-hover:shadow-xl">
                  <Headphones className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xs font-black uppercase tracking-[0.3em] mb-3 text-primary">Lifestyle Advisory</h3>
                <p className="text-sm text-primary/40 leading-relaxed font-medium italic">Bespoke support for the collection</p>
              </div>
            </div>
          </div>
        </section>

        {/* Curatorial Introduction */}
        <section className="pt-48 pb-24 bg-white relative overflow-hidden">
          {/* Elite Background Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none w-full select-none">
            <h2 className="font-heading text-[22rem] font-black leading-none uppercase text-center tracking-tighter">Atelier</h2>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <span className="text-accent text-[10px] font-black uppercase tracking-[1em] mb-10 block italic animate-pulse">The Permanent Registry</span>
            <h2 className="font-heading text-6xl sm:text-[7.5rem] font-black tracking-tighter leading-[0.75] mb-12">
              Explore our <br />
              <span className="text-accent italic font-light">Collections</span> <br />
              Curated Exclusively.
            </h2>

            <div className="flex flex-col items-center gap-8 opacity-20">
              <div className="w-px h-24 bg-gradient-to-b from-primary to-transparent" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] vertical-text">Scroll to Discover</span>
            </div>
          </div>
        </section>

        {/* Archival Registry Featured Banners */}
        {featuredCollections.map((collection, colIndex) => (
          <section key={collection.id} className={`py-40 ${colIndex % 2 === 0 ? 'bg-white' : 'bg-[#FFFAF5]'} overflow-hidden`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                <div className={`space-y-12 ${colIndex % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div>
                    <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-black mb-8 inline-block bg-accent/5 px-6 py-2.5 rounded-full italic opacity-60">
                      Haute Couture 0{colIndex + 1}
                    </span>
                    <h2 className="font-heading text-6xl sm:text-8xl font-black mb-10 leading-[0.85] tracking-tighter">
                      {collection.name.split(' ').map((word: string, i: number) => (
                        <span key={i} className={i % 2 !== 0 ? 'text-accent italic font-light' : ''}>
                          {word}{' '}
                        </span>
                      ))}
                    </h2>
                    <p className="text-primary/60 text-2xl leading-relaxed max-w-xl italic font-medium">
                      {collection.description || `A curated exploration of the ${collection.name} archive, where heritage values meet contemporary architectural silhouettes.`}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-12 pt-4">
                    <Link
                      to={`/shop?registry=${collection.slug}`}
                      className="inline-flex items-center justify-center bg-primary text-white h-20 px-14 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black transition-all shadow-2xl group active:scale-95"
                    >
                      Explore Registry
                      <ArrowRight className="ml-4 w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-primary/30 italic">
                      <span className="w-12 h-px bg-primary/10" />
                      Atelier Certified
                    </div>
                  </div>
                </div>

                <div className={`relative group min-h-[700px] flex items-center justify-center ${colIndex % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                  {/* Hyper-Dimensional Dispersed Stack */}
                  <div className="relative w-full max-w-lg aspect-[3/4]">
                    {collection.previewImages.length > 0 ? (
                      collection.previewImages.map((img: string, i: number) => {
                        // Calculate the dynamic position in the queue (0 is front)
                        const total = collection.previewImages.length;
                        const cyclePos = (i - (tick % total) + total) % total;

                        // Vertical Deck Alignment (No Tilting)
                        const baseTranslates = [
                          'translate-y-0 scale-100 z-40 opacity-100',
                          'translate-y-[-2rem] scale-[0.9] z-30 opacity-80',
                          'translate-y-[-4rem] scale-[0.8] z-20 opacity-60',
                          'translate-y-[-6rem] scale-[0.7] z-10 opacity-40'
                        ];

                        return (
                          <div
                            key={img}
                            className={`absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] bg-white transition-all duration-[2s] cubic-bezier(0.4, 0, 0.2, 1) ${baseTranslates[cyclePos]} border border-accent/10`}
                          >
                            <img
                              src={img}
                              alt={`${collection.name} artifact ${i + 1}`}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply"
                            />
                            {/* Depth Dimmer */}
                            <div className={`absolute inset-0 bg-black/20 transition-opacity duration-[2s] ${cyclePos === 0 ? 'opacity-0' : 'opacity-100'}`} />

                            {/* Permanent Artifact Identifier */}
                            <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-xl border border-white/20 px-5 py-2.5 rounded-full">
                              <p className="text-white text-[9px] font-black tracking-[0.5em] uppercase">Artifact 0{i + 1}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="aspect-[3/4] rounded-[3.5rem] overflow-hidden relative z-10 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] border-4 border-white">
                        <img
                          src="https://images.unsplash.com/photo-1712068944618-21bbd010c8ff?w=900&auto=format&fit=crop"
                          alt="Maison Collection"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Grand Archive Decorative Elements */}
                    <div className="absolute -top-20 -left-20 text-[14rem] font-heading font-black text-accent/[0.03] pointer-events-none select-none italic tracking-normal z-0 transition-colors duration-1000">
                      REG
                    </div>
                    <div className="absolute -bottom-20 -right-20 text-[14rem] font-heading font-black text-accent/[0.03] pointer-events-none select-none italic tracking-normal z-0 transition-colors duration-1000">
                      {collection.slug.slice(0, 3).toUpperCase()}
                    </div>

                    {/* Floating geometric depth cues */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-accent/[0.05] rounded-full -z-10 transition-all duration-[4s]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-accent/[0.02] rounded-full -z-10 transition-all duration-[5s]" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Categories Banner */}
        <section className="py-32 bg-[#FFFAF5] relative overflow-hidden">
          {/* Subtle background text */}
          <div className="absolute top-0 right-0 p-32 opacity-[0.02] pointer-events-none">
            <h2 className="font-heading text-[15rem] font-black leading-none uppercase rotate-90 origin-top-right">Collections</h2>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
              <div className="max-w-2xl">
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-6 block italic">Atelier Navigation</span>
                <h2 className="font-heading text-5xl sm:text-7xl font-bold tracking-tighter leading-[0.9] mb-8">
                  Browse the <br />
                  <span className="italic font-light text-accent text-6xl sm:text-8xl">Curated Archive.</span>
                </h2>
                <p className="text-primary/40 text-xl italic font-medium leading-relaxed max-w-xl">
                  Explore our meticulously segmented volumes, each designed to capture the intersection of heritage craftsmanship and modern silhouette.
                </p>
              </div>
              <Link to="/shop" className="group h-16 px-10 border border-accent/10 rounded-full flex items-center gap-4 hover:bg-black hover:text-white transition-all font-black uppercase tracking-widest text-[9px] shadow-sm">
                View Entire Registry <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
              {categories.map((category, index) => (
                <Link
                  key={category.name}
                  to={`/shop?category=${category.name}`}
                  className="group relative flex flex-col pt-12"
                >
                  <div className="absolute top-0 right-8 text-[8rem] font-black text-accent leading-none transition-all duration-1000 group-hover:text-accent/5 pointer-events-none italic">
                    00{index + 1}
                  </div>

                  <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-card group-hover:shadow-hover transition-all duration-1000">
                    <img
                      src={category.image}
                      alt={`${category.name} collection`}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply"
                    />

                    {/* Glass Overlay */}
                    <div className="absolute inset-x-6 bottom-6 p-8 bg-white/10 backdrop-blur-2xl  rounded-[2rem] transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 shadow-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="relative z-10">
                        <span className="text-white text-[8px] font-black uppercase tracking-[0.4em] mb-2 block italic">Category {index + 1}</span>
                        <h3 className="font-heading text-3xl text-white font-bold mb-6 tracking-tighter group-hover:text-accent transition-colors">{category.name}</h3>

                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center text-white text-[9px] font-black tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform translate-x-[-10px] group-hover:translate-x-0">
                            Enter Archive <ArrowRight className="w-3.5 h-3.5 ml-2" />
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-500">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Luxury Experience & Handpicked Fashion */}
        <section className="py-12 bg-[#FFFAF5] overflow-hidden relative">
          {/* Uniform architectural canvas established */}

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-40 items-center">
              <div className="relative group">
                <div className="aspect-[3/4] rounded-[4rem] overflow-hidden relative z-10 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.25)] border border-white transition-all duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1622104551503-0d869c6224bf?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Luxury Experience"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                </div>

                {/* Floating Architectural Cards */}
                <div className="absolute -bottom-16 -right-16 w-80 bg-white/60 backdrop-blur-3xl p-10 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-white/50 z-20 hidden xl:block translate-y-8 group-hover:translate-y-0 transition-transform duration-1000">
                  <p className="text-accent text-[9px] font-black uppercase tracking-[0.4em] mb-4">Maison Privilege</p>
                  <h4 className="font-heading text-2xl font-black mb-4 leading-tight">Bespoke Advisory <br /> Sessions.</h4>
                  <div className="w-12 h-1 bg-accent/20 rounded-full" />
                </div>

                {/* <div className="absolute top-20 -left-12 w-64 bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl z-20 hidden lg:block -rotate-6 group-hover:rotate-0 transition-all duration-1000">
                  <p className="text-[2rem] font-heading font-black leading-none mb-2 italic text-accent">98%</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] opacity-60">Retention of Handpicked <br /> Collectors.</p>
                </div> */}
              </div>

              <div className="space-y-16">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-4 bg-accent/5 px-6 py-3 rounded-full border border-accent/10">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black">Elite Acquisition</span>
                  </div>

                  <h2 className="font-heading text-6xl sm:text-[6.5rem] font-bold mb-10 leading-[0.8] tracking-tighter">
                    Luxury Experience <br />
                    <span className="text-accent italic font-light">& Handpicked Fashion.</span>
                  </h2>

                  <p className="text-primary/60 text-2xl leading-relaxed max-w-xl italic font-medium">
                    We transcend conventional retail of the archive. Our curators travel globally to handpick artifacts that represent the absolute pinnacle of material and silhouette.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 py-12 border-t border-accent/10">
                  <div className="space-y-4 group/exp">
                    <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10 group-hover/exp:bg-accent group-hover/exp:text-white transition-all duration-500">
                      <Star className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary mb-2">Heritage Sourcing</h4>
                      <p className="text-xs font-medium italic text-primary/40 leading-relaxed">Direct relationships with legacy European mills.</p>
                    </div>
                  </div>

                  <div className="space-y-4 group/exp">
                    <div className="w-14 h-14 rounded-2xl bg-accent/5 flex items-center justify-center border border-accent/10 group-hover/exp:bg-accent group-hover/exp:text-white transition-all duration-500">
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary mb-2">24/7 Concierge</h4>
                      <p className="text-xs font-medium italic text-primary/40 leading-relaxed">Dedicated lifestyle advisors for every acquisition.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-10 items-center">
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center bg-primary text-white h-24 px-16 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-black transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group active:scale-95"
                  >
                    Enter Experience
                    <ArrowRight className="ml-5 w-6 h-6 transition-transform group-hover:translate-x-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-48 bg-white relative overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <h2 className="font-heading text-[25rem] font-black uppercase -rotate-12 translate-x-[-10%] translate-y-[20%]">Portraits</h2>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center mb-32">
              <span className="text-accent font-black uppercase tracking-[0.8em] text-[11px] mb-8 bg-accent/5 px-8 py-3 rounded-full italic animate-pulse">Vocal Reflections</span>
              <h2 className="font-heading text-6xl sm:text-8xl font-black tracking-tighter leading-[0.85] mb-12">
                The Archive <br />
                <span className="italic font-light text-accent">Portraits.</span>
              </h2>
              <div className="w-24 h-px bg-accent/20" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              {[
                {
                  name: "Sarah Montgomery",
                  location: "London Ateliers",
                  review: "The attention to detail in the packaging alone was enough to tell me Maison is different. The silk blouse I ordered is simply the best fit I've ever found in my collection.",
                  rating: 5
                },
                {
                  name: "Julian Alexander",
                  location: "Parisian Archives",
                  review: "Maison has redefined what basic essentials mean for me. The fabrics feel alive and the cuts are architectural yet incredibly comfortable for the modern silhouette.",
                  rating: 5
                },
                {
                  name: "Elena Rossini",
                  location: "Milanese Boutique",
                  review: "Fast global logistics combined with a boutique feel. I received my acquisition in Italy within days, and the material integrity is on par with legacy heritage brands.",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-accent/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className="relative h-full bg-white p-10 sm:p-14 rounded-[3.5rem] border border-accent/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_80px_100px_-30px_rgba(0,0,0,0.15)] transition-all duration-1000 transform hover:-translate-y-6 flex flex-col justify-between overflow-hidden">
                    {/* Glass highlight */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />

                    <div>
                      <div className="flex gap-2 mb-8 transform group-hover:scale-110 transition-transform duration-700 origin-left">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                      <blockquote className="text-primary/70 mb-10 text-xl leading-relaxed font-medium italic tracking-tight relative">
                        <span className="absolute -top-8 -left-8 text-7xl text-accent/10 font-heading not-italic">"</span>
                        {testimonial.review}
                      </blockquote>
                    </div>

                    <div className="pt-8 border-t border-accent/10 flex items-center justify-between">
                      <div>
                        <p className="font-heading font-black text-xl uppercase tracking-tighter group-hover:text-accent transition-colors">{testimonial.name}</p>
                        <p className="text-accent text-[9px] font-black uppercase tracking-[0.4em] mt-2 italic opacity-60">{testimonial.location}</p>
                      </div>
                      <div className="w-12 h-12 bg-accent/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <Star className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Feed / Gallery */}
        <section className="py-48 bg-white relative overflow-hidden">
          {/* Subtle background watermark */}
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none select-none">
            <h2 className="font-heading text-[25rem] font-black uppercase rotate-90 translate-x-[30%] translate-y-[20%]">Gallery</h2>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
              <div className="max-w-3xl">
                <span className="text-accent text-[11px] font-black uppercase tracking-[0.8em] mb-8 block italic animate-pulse">Visual Reflections /</span>
                <h2 className="font-heading text-6xl sm:text-[7.5rem] font-black tracking-tighter leading-[0.8] mb-10">
                  Observe the <br />
                  <span className="italic font-light text-accent">Archival Lens.</span>
                </h2>
                <p className="text-primary/40 text-2xl italic font-medium leading-relaxed max-w-xl">
                  A real-time broadcast of the physical atelier—where material integrity meets the daily ritual of discovery.
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-6 pb-2">
                <p className="text-primary/30 font-black uppercase tracking-[0.4em] text-[10px] italic">Join the Conversation</p>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-6 text-primary hover:text-accent transition-all duration-700 pb-2 border-b-2 border-accent/10"
                >
                  <span className="font-heading text-3xl font-bold tracking-tighter">@maison_archive</span>
                  <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:rotate-45 transition-all duration-500">
                    <Plus className="w-5 h-5" />
                  </div>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                "https://images.unsplash.com/photo-1691692677524-7ee6b93adffd?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "https://images.unsplash.com/photo-1680614121680-b9a187c48832?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ2fHx8ZW58MHx8fHx8",
                "https://images.unsplash.com/photo-1706824258534-c3740a1ae96b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1fHx8ZW58MHx8fHx8",
                "https://images.unsplash.com/photo-1640525241168-1eb6cc17c319?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              ].map((image, index) => (
                <div key={index} className="aspect-[3/4] rounded-[3rem] overflow-hidden group cursor-pointer relative shadow-lg hover:shadow-2xl transition-all duration-700">
                  <img
                    src={image}
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-accent/30 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center p-8 backdrop-blur-[2px]">
                    <div className="w-full py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col items-center justify-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                      <p className="text-white text-[10px] font-black uppercase tracking-[0.4em] mb-2">View Acquisition</p>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compact Membership Inlay */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0A0A0A] text-white rounded-[3.5rem] overflow-hidden relative group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
              {/* Specialized Archival Watermark */}
              <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] pointer-events-none overflow-hidden select-none">
                <div className="absolute top-1/2 left-0 -translate-y-1/2 font-heading text-[20rem] font-black uppercase tracking-tighter -rotate-6 whitespace-nowrap">
                  Maison Archive
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
                <div className="lg:col-span-7 p-12 sm:p-20 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-10">
                    <span className="w-10 h-px bg-accent/30" />
                    <span className="text-accent uppercase tracking-[0.8em] text-[10px] font-black italic">Bespoke Invitations</span>
                  </div>

                  <h2 className="font-heading text-5xl sm:text-6xl font-black mb-8 leading-[0.9] tracking-tighter">
                    Join the <br />
                    <span className="text-white/20 italic font-light hover:text-white transition-colors duration-1000">Private Registry.</span>
                  </h2>

                  <p className="text-white/40 mb-12 text-lg max-w-sm leading-relaxed font-black uppercase tracking-widest text-[9px] ">
                    Reserved for ceux qui savent. Witness archival awakenings and private atelier releases.
                  </p>

                  <form className="flex flex-col sm:flex-row gap-4 w-full max-w-xl group/form relative">
                    <div className="flex-1 relative">
                      <input
                        type="email"
                        placeholder="AUTHENTICATE EMAIL..."
                        className="w-full h-16 bg-white/[0.05] border border-white/10 rounded-2xl px-8 text-[10px] font-black uppercase tracking-[0.3em] text-white placeholder:text-white/20 focus:outline-none focus:border-accent focus:bg-white/10 transition-all duration-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="h-16 px-10 bg-accent text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all duration-500 shadow-xl active:scale-95 whitespace-nowrap"
                    >
                      Enter Registry
                    </button>
                  </form>

                  <div className="mt-10 flex items-center gap-4 text-[8px] font-black uppercase tracking-[0.4em] text-white/20 italic">
                    <Shield className="w-3.5 h-3.5" />
                    Encrypted Member Protocol
                  </div>
                </div>

                <div className="lg:col-span-5 relative min-h-[350px] lg:min-h-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1636556031330-90d2df1c114c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDczfHx8ZW58MHx8fHx8"
                    alt="Atelier View"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent hidden lg:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:hidden" />

                  {/* Floating Inlay Card */}
                  <div className="absolute right-8 bottom-8 p-6 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-br-[2rem] rounded-tl-[2rem] rounded-tr-[8px] rounded-bl-[8px] max-w-[200px] transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-1000 hidden sm:block">
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest leading-relaxed italic">
                      Members receive private coordinate artifacts and atelier insights.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer className="bg-[#111] text-white pt-24 pb-12" />
    </div>
  );
};

export default Index;