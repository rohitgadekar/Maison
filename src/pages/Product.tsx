import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, Truck, ShieldCheck, RotateCcw, Heart } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';
import { Price } from '@/components/Price';

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  category: string;
  sizes: string[] | null;
  inventory: number;
  is_active: boolean;
  tag?: string | null;
}

const PremiumLoader = () => (
  <div className="flex flex-col items-center justify-center py-32 space-y-6">
    <div className="relative w-48 h-[1px] bg-accent/10 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-1/2 bg-accent animate-loading-bar" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/40 italic animate-pulse">
      Identifying Artifact...
    </span>
  </div>
);

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<ProductData[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        navigate('/shop');
        return;
      }

      setProduct(data);
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
      setSelectedImageIndex(0);
      setLoading(false);

      // Fetch similar products
      const { data: similar } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .eq('is_active', true)
        .neq('id', data.id)
        .limit(4);

      setSimilarProducts(similar || []);
    };

    fetchProduct();
  }, [id, navigate]);

  const getProductImages = (): string[] => {
    if (!product) return [];

    const images: string[] = [];

    // Add images from images array
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }

    // Add image_url if exists and not already in images
    if (product.image_url && !images.includes(product.image_url)) {
      images.unshift(product.image_url);
    }

    // Fallback to placeholder if no images
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop');
    }

    return images.slice(0, 5); // Max 5 images
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.inventory < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    const images = getProductImages();
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: selectedSize ? `${product.id}-${selectedSize}` : product.id,
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        description: product.description || '',
        category: product.category,
        image: images[0],
        size: selectedSize
      });
    }

    toast.success('Added to cart!');
  };

  const handlePrevImage = () => {
    const images = getProductImages();
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images = getProductImages();
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const images = getProductImages();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      <SEO
        title={product ? product.name : "Archival Artifact"}
        description={product?.description || "View product details."}
        image={product?.image_url || undefined}
      />
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-32 sm:pt-48 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-accent hover:text-primary transition-all mb-16"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Archive
          </button>

          {loading ? (
            <PremiumLoader />
          ) : !product ? (
            <div className="text-center py-20 font-heading text-2xl italic">Artifact lost in the archives.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              {/* Product Images */}
              <div className="space-y-6">
                {/* Main Image */}
                <div className="relative aspect-[3/4] bg-white rounded-[3rem] overflow-hidden group shadow-2xl">
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-[2s]"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white shadow-xl"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white shadow-xl"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {product.tag && (
                    <div className="absolute top-8 left-8 z-20 animate-fade-in pointer-events-none">
                      <span className="px-6 py-2.5 bg-white/80 backdrop-blur-xl text-primary text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-white/50">
                        {product.tag}
                      </span>
                    </div>
                  )}

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-8 overflow-x-auto py-8 scrollbar-hide justify-center overflow-y-visible">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-24 rounded-[1.25rem] overflow-hidden border-2 border transition-all duration-500 shadow-sm ${selectedImageIndex === index
                          ? 'border-accent shadow-2xl relative z-10'
                          : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex flex-col pt-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-[10px] bg-accent/10 text-accent px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                      {product.category}
                    </span>
                    {product.inventory < 10 && product.inventory > 0 && (
                      <span className="text-[10px] bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full font-black uppercase tracking-widest animate-pulse">
                        Low Archive Stock
                      </span>
                    )}
                  </div>

                  <h1 className="font-heading text-5xl sm:text-7xl font-bold mb-8 tracking-tighter leading-[0.9]">
                    {product.name}
                  </h1>

                  <Price amount={Number(product.price)} className="text-4xl font-black text-accent mb-12 tracking-tighter" />

                  {product.description && (
                    <div className="mb-12">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-4 border-b border-accent/10 pb-2">Archival Description</h3>
                      <p className="text-xl text-primary/70 leading-relaxed font-medium italic">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-6">Proportional Fit</h3>
                      <div className="flex flex-wrap gap-4">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[64px] h-14 px-6 rounded-2xl border-2 transition-all duration-300 font-black text-xs uppercase tracking-widest ${selectedSize === size
                              ? 'border-primary bg-primary text-white shadow-xl scale-105'
                              : 'border-accent/10 bg-white text-muted-foreground hover:border-accent hover:text-accent'
                              }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-12">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-6">Volume</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-accent/10 shadow-sm">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-black w-8 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 italic">
                        {product.inventory} artifacts available
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add to Cart */}
                <div className="flex flex-col gap-4 mt-8">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-20 bg-white border-2 border-primary text-primary font-black uppercase tracking-[0.2em] text-xs hover:bg-primary hover:text-white transition-all rounded-[2rem] shadow-lg group"
                    disabled={product.inventory === 0}
                  >
                    <ShoppingBag className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" />
                    {product.inventory === 0 ? 'Archive Depleted' : 'Add to Collection'}
                  </Button>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        handleAddToCart();
                        navigate('/checkout');
                      }}
                      className="flex-1 h-20 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all rounded-[2rem] shadow-2xl"
                      disabled={product.inventory === 0}
                    >
                      Acquire Now
                    </Button>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={cn(
                        "w-20 h-20 rounded-[2rem] border-2 border-accent/10 flex items-center justify-center transition-all duration-500 shadow-lg active:scale-95",
                        isInWishlist(product.id) ? "bg-accent/5 border-accent" : "bg-white hover:bg-accent/5"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-6 h-6 transition-all duration-500",
                          isInWishlist(product.id) ? "text-accent fill-accent scale-110" : "text-primary/40 hover:text-accent"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-20 pt-16 border-t border-accent/10 grid grid-cols-1 sm:grid-cols-3 gap-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto text-accent">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">Global Logistics</p>
                      <p className="text-xs text-primary/40 font-medium italic">Complimentary over $100</p>
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto text-accent">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">Vault Privacy</p>
                      <p className="text-xs text-primary/40 font-medium italic">100% Encrypted Transactions</p>
                    </div>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto text-accent">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">Exchange Protocol</p>
                      <p className="text-xs text-primary/40 font-medium italic">14-Day Boutique Returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Similar Products */}
          {similarProducts.length > 0 && !loading && (
            <section className="mt-40">
              <div className="flex flex-col items-center mb-16 space-y-4">
                <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black">Complementary Pieces</span>
                <h2 className="font-heading text-4xl sm:text-5xl font-bold tracking-tighter">You May Also <span className="italic font-light text-accent">Admire.</span></h2>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    to={`/product/${similarProduct.id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-white rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                      <img
                        src={similarProduct.images?.[0] || similarProduct.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'}
                        alt={similarProduct.name}
                        className="w-full h-full object-cover mix-blend-multiply transition-transform duration-[2s] group-hover:scale-110"
                      />
                    </div>
                    <div className="text-center space-y-2 px-4">
                      <h3 className="font-heading text-xl font-bold tracking-tight group-hover:text-accent transition-colors">
                        {similarProduct.name}
                      </h3>
                      <Price amount={Number(similarProduct.price)} className="text-[10px] font-black uppercase tracking-widest text-primary/40" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Product;