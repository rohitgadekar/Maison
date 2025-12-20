import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";
import { SEO } from '@/components/SEO';
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const PremiumLoader = () => (
    <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="relative w-48 h-[1px] bg-accent/10 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-accent animate-loading-bar" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/40 italic animate-pulse">
            Accessing Wishlist Archive...
        </span>
    </div>
);

const Wishlist = () => {
    const { wishlistItems, loading: wishlistLoading } = useWishlist();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            if (wishlistItems.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .in("id", wishlistItems);

            if (error) {
                console.error("Error fetching wishlist products:", error);
            } else {
                const mapped = (data as any[]).map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    category: item.category,
                    image: item.image_url || item.image,
                    badge: item.badge,
                    tag: item.tag,
                    image_url: item.image_url,
                    images: item.images,
                    inventory: item.inventory,
                    is_active: item.is_active,
                    sizes: item.sizes,
                }));

                setProducts(mapped as Product[]);
            }

            setLoading(false);
        };

        fetchWishlistProducts();
    }, [wishlistItems]);

    return (
        <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
            <SEO title="Wishlist Archive" description="Your curated collection of saved artifacts." />
            <Header />
            <CartDrawer />

            <main className="flex-1 pt-32 sm:pt-48 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 border-b border-accent/10 pb-12">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <Heart className="w-5 h-5 text-accent fill-accent" />
                                <span className="text-accent uppercase tracking-[0.4em] text-[10px] font-black">Personal Archive</span>
                            </div>
                            <h1 className="font-heading text-5xl sm:text-7xl font-bold mb-6 tracking-tighter">
                                Your <span className="italic font-light text-accent">Wishlist.</span>
                            </h1>
                            <p className="text-muted-foreground text-lg sm:text-xl font-medium max-w-lg italic">
                                A definitive collection of pieces secured for your future acquisition.
                            </p>
                        </div>
                    </div>

                    {loading || wishlistLoading ? (
                        <PremiumLoader />
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                            {products.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : !user ? (
                        // Not logged in - show premium login prompt
                        <div className="text-center py-40 bg-accent/5 rounded-[3rem] border border-accent/10 shadow-sm flex flex-col items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-gradient-to-br from-accent/10 to-accent/5 rounded-[2rem] flex items-center justify-center mb-10 mx-auto">
                                    <Heart className="w-12 h-12 text-accent" />
                                </div>
                                <h3 className="font-heading text-4xl font-bold mb-6 tracking-tight">Access Your Archive</h3>
                                <p className="text-muted-foreground text-lg font-medium italic mb-12 max-w-md mx-auto leading-relaxed">
                                    Sign in to view your curated collection of saved artifacts and continue your journey through the Maison.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Button asChild className="h-16 px-12 rounded-full bg-[#111] text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-accent transition-all">
                                        <Link to="/auth">
                                            Enter Archive <ArrowRight className="ml-3 w-4 h-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-16 px-12 rounded-full border-accent/20 font-black uppercase tracking-widest text-[10px] hover:bg-accent/5">
                                        <Link to="/shop">
                                            Browse Collections
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Logged in but empty wishlist
                        <div className="text-center py-40 bg-white/50 rounded-[4rem] border border-dashed border-accent/10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-10">
                                <Heart className="w-10 h-10 text-accent/20" />
                            </div>
                            <h3 className="font-heading text-3xl font-bold mb-6 tracking-tight">Archive Empty</h3>
                            <p className="text-muted-foreground text-lg font-medium italic mb-12 max-w-md mx-auto">
                                No artifacts have been secured in your personal archive yet.
                            </p>
                            <Button asChild className="h-16 px-12 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black">
                                <Link to="/shop">
                                    Explore Collections <ArrowRight className="ml-3 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Wishlist;
