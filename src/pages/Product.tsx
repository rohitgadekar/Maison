import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Minus, Plus, ShoppingBag } from 'lucide-react';

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
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
      setLoading(false);
    };

    fetchProduct();
  }, [id, navigate]);

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

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `${product.id}-${selectedSize}`,
        name: product.name,
        price: Number(product.price),
        description: product.description || '',
        category: product.category,
        image: product.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop',
        size: selectedSize
      });
    }

    toast.success('Added to cart!');
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
            {/* Product Image */}
            <div className="aspect-[3/4] bg-card rounded-2xl overflow-hidden">
              <img
                src={product.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
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
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {product.description}
                  </p>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Product;
