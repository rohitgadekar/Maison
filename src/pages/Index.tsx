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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch featured products (top 4 active ones)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
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

        {/* Trust Badges */}
        <section className="py-24 border-y border-accent/10 bg-white/50">
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

        <section className="bg-white">
          <FeaturedProducts products={featuredProducts} />
        </section>

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
                  <div className="absolute top-0 right-8 text-[8rem] font-black text-accent/5 leading-none transition-all duration-1000 group-hover:text-accent/10 pointer-events-none italic">
                    0{index + 1}
                  </div>

                  <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-card group-hover:shadow-hover transition-all duration-1000">
                    <img
                      src={category.image}
                      alt={`${category.name} collection`}
                      className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
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

        {/* Featured Lifestyle Banner */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="relative group">
                <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden relative z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1669740217737-611345f9d246?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Season Essentials"
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 grayscale-[0.1] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>

                {/* Decorative overlapping elements */}
                <div className="absolute -bottom-12 -right-12 w-3/4 h-3/4 bg-accent/5 -z-0 rounded-[3.5rem] transform rotate-3" />
                <div className="absolute -top-12 -left-12 w-1/2 h-1/2 border border-accent/10 -z-0 rounded-[3.5rem] transform -rotate-6" />

                <div className="absolute top-1/2 -left-16 -translate-y-1/2 w-40 h-40 bg-white/80 backdrop-blur-2xl shadow-2xl rounded-full flex items-center justify-center p-6 z-20 hidden md:flex border border-white/50 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-1000">
                  <div className="text-center">
                    <p className="font-heading font-black text-5xl leading-none text-primary mb-1 tracking-tighter">25</p>
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-accent">Artifacts</p>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-8 inline-block bg-accent/5 px-4 py-2 rounded-full">Boutique Editorial</span>
                  <h2 className="font-heading text-5xl sm:text-7xl font-bold mb-10 leading-[0.9] tracking-tighter">
                    Archival Integrity <br />
                    <span className="text-accent italic font-light">& Comfort.</span>
                  </h2>
                  <p className="text-primary/60 text-2xl leading-relaxed max-w-xl italic font-medium">
                    "Craftsmanship is the heartbeat of longevity. Our latest archival series explores the intersection of raw material and modern silhouette."
                  </p>
                </div>

                <div className="space-y-8 py-10 border-y border-accent/10">
                  <div className="flex items-center gap-6 group/item">
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center group-hover/item:bg-accent group-hover/item:text-white transition-all">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-1">Material Excellence</h4>
                      <p className="text-sm font-medium italic text-primary/40">Sourced from heritage European mills.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group/item">
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center group-hover/item:bg-accent group-hover/item:text-white transition-all">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-1">Architectural Build</h4>
                      <p className="text-sm font-medium italic text-primary/40">Engineered for a lifetime of wear.</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center bg-primary text-white h-20 px-12 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-2xl group"
                >
                  Acquire the Archive
                  <ArrowRight className="ml-4 w-5 h-5 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-[#FFFAF5]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-24">
              <span className="text-accent font-black uppercase tracking-[0.5em] text-[10px] mb-6">Vocal Curations</span>
              <h2 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter italic">The Archive <span className="not-italic text-accent">Portraits.</span></h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
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
                <div key={index} className="bg-white p-16 rounded-[4rem] shadow-sm border border-accent/5 relative group hover:shadow-[0_80px_100px_-30px_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all duration-1000">
                  <div className="flex gap-1.5 mb-10 opacity-20 group-hover:opacity-100 transition-opacity">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-primary/70 mb-12 text-xl leading-relaxed font-medium italic tracking-tight">
                    "{testimonial.review}"
                  </blockquote>
                  <div className="pt-8 border-t border-accent/10 flex items-center justify-between">
                    <div>
                      <p className="font-heading font-black text-xl uppercase tracking-tighter">{testimonial.name}</p>
                      <p className="text-accent text-[9px] font-black uppercase tracking-[0.4em] mt-3 italic">{testimonial.location}</p>
                    </div>
                    <div className="w-12 h-12 bg-accent/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Star className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Feed / Gallery */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center mb-20 space-y-4">
              <span className="text-accent font-black uppercase tracking-[0.5em] text-[10px]">Visual Reflections</span>
              <h2 className="font-heading text-5xl font-black mb-4 tracking-tighter">The Archival <span className="italic font-light text-accent">Lens.</span></h2>
              <p className="text-primary/30 flex items-center gap-3 font-black uppercase tracking-widest text-[10px] pb-2 border-b-2 border-accent/10">
                Observe <span className="text-accent underline">@maison_archive</span>
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                "https://images.unsplash.com/photo-1608144716563-b525e86fabb4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D",
                "https://images.unsplash.com/photo-1706824258534-c3740a1ae96b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1fHx8ZW58MHx8fHx8",
                "https://images.unsplash.com/photo-1645110365977-632cf2b545a1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDl8fHxlbnwwfHx8fHw%3D",
                "https://images.unsplash.com/photo-1640525134371-8396e9761af0?q=80&w=1364&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              ].map((image, index) => (
                <div key={index} className="aspect-[3/4] rounded-[3rem] overflow-hidden group cursor-pointer relative shadow-lg hover:shadow-2xl transition-all duration-700">
                  <img
                    src={image}
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-125 grayscale-[0.2] group-hover:grayscale-0"
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

        {/* Newsletter */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0A0A0A] text-white rounded-[4rem] overflow-hidden relative group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
              {/* Decorative Archival Elements */}
              <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[30rem] font-black uppercase rotate-12 whitespace-nowrap">
                  Registry
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-10 sm:p-20 lg:p-32 flex flex-col justify-center relative z-10">
                  <div className="inline-flex items-center gap-3 mb-8">
                    <div className="w-12 h-px bg-accent/30" />
                    <span className="text-accent uppercase tracking-[0.6em] text-[9px] font-black block italic">Inner Circle Access</span>
                  </div>

                  <h2 className="font-heading text-6xl sm:text-7xl lg:text-8xl font-black mb-10 leading-[0.85] tracking-tighter">
                    Access the <br />
                    <span className="text-white/20 italic font-light">Sub-Archive.</span>
                  </h2>

                  <p className="text-white/40 mb-16 text-xl lg:text-2xl max-w-md leading-relaxed font-medium italic">
                    "Reserved for ceux qui savent. Be the first to witness archival awakenings and private atelier releases."
                  </p>

                  <form className="flex flex-col gap-6 w-full max-w-xl group/form">
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="ENTER YOUR CORRESPONDENCE..."
                        className="w-full h-20 sm:h-24 bg-white/[0.03] border border-white/10 rounded-[2rem] px-10 text-[11px] font-black uppercase tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-accent focus:bg-white/5 transition-all backdrop-blur-2xl shadow-inner outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center opacity-30 group-focus-within/form:opacity-100 group-focus-within/form:text-accent transition-all">
                          <Plus className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="h-20 sm:h-24 w-full sm:w-auto sm:px-16 bg-accent text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-[2rem] hover:bg-white hover:text-black transition-all shadow-2xl active:scale-95 transform translate-y-0 hover:-translate-y-1 duration-500"
                    >
                      Authenticate Membership
                    </button>
                  </form>

                  <div className="mt-12 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/10 italic">
                    <Shield className="w-3.5 h-3.5" />
                    Encrypted Registry Protocol
                  </div>
                </div>

                <div className="relative min-h-[500px] lg:min-h-full overflow-hidden group/image">
                  <img
                    src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=1200&fit=crop"
                    alt="Archive Collection"
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover/image:scale-110 group-hover/image:opacity-50 transition-all duration-[5s] ease-out"
                  />
                  {/* Geometric Overlays */}
                  <div className="absolute inset-x-12 bottom-12 p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] transform translate-y-4 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-1000">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-accent mb-4 block italic">Volume Status: Active</p>
                    <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                      "Each member gains a unique entry ID upon authentication, unlocking private views of the physical atelier archives."
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent lg:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:hidden" />
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