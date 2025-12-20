import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { useSearchParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { cn } from "@/lib/utils";

// Categories will be derived dynamically

const PremiumLoader = () => (
  <div className="flex flex-col items-center justify-center py-32 space-y-6">
    <div className="relative w-48 h-[1px] bg-accent/10 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-1/2 bg-accent animate-loading-bar" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/40 italic animate-pulse">
      Curation in progress...
    </span>
  </div>
);

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const collectionParam = searchParams.get('collection');
  const registryParam = searchParams.get('registry');
  const searchParam = searchParams.get('search');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [products, setProducts] = useState<Product[]>([]);
  const [registryInfo, setRegistryInfo] = useState<{ name: string, description: string } | null>(null);
  const [registryProductIds, setRegistryProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('All');
    }
  }, [categoryParam]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      // Fetch all products first
      const { data: allProducts, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (prodError) {
        console.error("Error fetching products:", prodError);
      } else {
        const mapped = (allProducts as any[]).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category,
          image: item.image_url || item.image,
          badge: item.badge,
          image_url: item.image_url,
          images: item.images,
          inventory: item.inventory,
          is_active: item.is_active,
          sizes: item.sizes,
          tag: item.tag,
          created_at: item.created_at,
        }));
        setProducts(mapped as Product[]);
      }

      // If registry is active, fetch its specific data
      if (registryParam) {
        const { data: regData } = await supabase
          .from('collections')
          .select('id, name, description')
          .eq('slug', registryParam)
          .eq('is_active', true)
          .single();

        if (regData) {
          setRegistryInfo({ name: regData.name, description: regData.description || '' });

          const { data: regProducts } = await supabase
            .from('collection_products')
            .select('product_id')
            .eq('collection_id', regData.id);

          setRegistryProductIds(regProducts?.map(p => p.product_id) || []);
        }
      }

      setLoading(false);
    };

    fetchProducts();
  }, [registryParam]);

  const getPageContext = () => {
    if (collectionParam === 'New Arrivals') {
      return {
        title: 'New Arrivals',
        subtitle: 'The Latest Registry',
        description: 'Discover the most recent acquisitions to the Maison Archive, showcasing contemporary architectural evolution.'
      };
    }
    if (collectionParam === 'Bestsellers') {
      return {
        title: 'Bestsellers',
        subtitle: 'Most Coveted Artifacts',
        description: 'Examine the pieces that have defined the Maison aesthetic, as curated by our global collective of members.'
      };
    }
    if (registryInfo) {
      return {
        title: registryInfo.name,
        subtitle: 'Thematic Registry',
        description: registryInfo.description
      };
    }
    if (searchParam) {
      return {
        title: 'Search Results',
        subtitle: 'Catalogue Discovery',
        description: `Displaying artifacts matching "${searchParam}" in our global archival registry.`
      };
    }
    return {
      title: 'The Collection',
      subtitle: 'The Collections',
      description: 'A definitive curation of artifacts designed for longevity, craftsmanship, and the art of subtle luxury.'
    };
  };

  const context = getPageContext();

  const availableCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      default:
        return 0;
    }
  });

  const filteredProducts = sortedProducts.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

    if (collectionParam === 'New Arrivals') {
      return matchesCategory && p.tag?.toLowerCase() === 'new';
    }
    if (collectionParam === 'Bestsellers') {
      return matchesCategory && p.tag?.toLowerCase() === 'bestseller';
    }
    if (registryParam) {
      return matchesCategory && registryProductIds.includes(p.id);
    }
    if (searchParam) {
      return matchesCategory && p.name.toLowerCase().includes(searchParam.toLowerCase());
    }

    return matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      <SEO title="The Collection" description="Explore our curated collection of archival fashion." />
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-32 sm:pt-40 pb-24">
        {loading ? (
          <div className="container mx-auto px-4 lg:px-8">
            <PremiumLoader />
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-accent/10 pb-12">
              <div className="max-w-2xl">
                <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-black mb-4 block">
                  {context.subtitle}
                </span>
                <h1 className="font-heading text-5xl sm:text-7xl font-bold mb-6 tracking-tighter">
                  {collectionParam || registryParam || searchParam ? (
                    <>
                      {(collectionParam || registryInfo?.name || searchParam || '').split(' ')[0]} <span className="italic font-light text-accent">{(collectionParam || registryInfo?.name || searchParam || '').split(' ').slice(1).join(' ')}</span>
                    </>
                  ) : (
                    <>
                      Explore <span className="italic font-light text-accent">Maison</span>
                    </>
                  )}
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-lg italic">
                  {context.description}
                </p>
              </div>

              {/* Filters Section */}
              <div className="flex flex-col gap-10">
                {/* Category Filter */}
                {!collectionParam && !registryParam && !searchParam && (
                  <div className="flex flex-wrap gap-4">
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          if (category === 'All') {
                            searchParams.delete('category');
                          } else {
                            searchParams.set('category', category);
                          }
                          setSearchParams(searchParams);
                        }}
                        className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${selectedCategory === category
                          ? "bg-primary text-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] scale-105"
                          : "bg-white text-primary/40 border border-accent/5 hover:border-accent/20 hover:text-accent"
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sorting Filter */}
                <div className={cn(
                  "flex items-center gap-6 pt-10",
                  !collectionParam && !registryParam && !searchParam && "border-t border-accent/5"
                )}>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/20 italic">Sort By /</span>
                  <div className="flex flex-wrap gap-8">
                    {[
                      { label: 'Featured', value: 'featured' },
                      { label: 'Newest', value: 'newest' },
                      { label: 'Price: Low-High', value: 'price-asc' },
                      { label: 'Price: High-Low', value: 'price-desc' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group ${sortBy === option.value ? 'text-accent' : 'text-primary/40 hover:text-primary'
                          }`}
                      >
                        {option.label}
                        <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-accent transition-all duration-500 ${sortBy === option.value ? 'w-full' : 'w-0 group-hover:w-full opacity-30'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-32 bg-white/50 rounded-[3rem] border border-dashed border-accent/20">
                <p className="text-muted-foreground font-heading text-xl italic">
                  No artifacts found in this collection.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
