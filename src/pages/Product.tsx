import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

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
}

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
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
        id: `${product.id}-${selectedSize}`,
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <CartDrawer />
        <main className="pt-24 sm:pt-28 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = getProductImages();

  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />

      <main className="pt-24 sm:pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-card rounded-2xl overflow-hidden group">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-accent'
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                <p className="text-sm text-accent uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl mb-4">
                  {product.name}
                </h1>
                <p className="text-2xl font-heading mb-6">
                  ${Number(product.price).toFixed(2)}
                </p>

                {product.description && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium mb-3">Size</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[48px] h-12 px-4 rounded-lg border transition-all ${
                            selectedSize === size
                              ? 'border-accent bg-accent text-accent-foreground'
                              : 'border-border hover:border-accent'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-8">
                  <h3 className="text-sm font-medium mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:border-accent transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                      className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:border-accent transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stock Status */}
                <p className={`text-sm mb-8 ${product.inventory > 5 ? 'text-green-500' : product.inventory > 0 ? 'text-yellow-500' : 'text-destructive'}`}>
                  {product.inventory > 5
                    ? 'In Stock'
                    : product.inventory > 0
                    ? `Only ${product.inventory} left`
                    : 'Out of Stock'}
                </p>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full h-14"
                disabled={product.inventory === 0}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-heading text-2xl sm:text-3xl mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct.id}
                    to={`/product/${similarProduct.id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-card rounded-xl overflow-hidden mb-3">
                      <img
                        src={similarProduct.images?.[0] || similarProduct.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'}
                        alt={similarProduct.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-heading text-sm sm:text-base mb-1 group-hover:text-accent transition-colors">
                      {similarProduct.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ${Number(similarProduct.price).toFixed(2)}
                    </p>
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