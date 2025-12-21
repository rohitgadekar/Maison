import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Plus, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWishlist } from '@/context/WishlistContext';
import { Price } from './Price';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showSizePicker, setShowSizePicker] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.inventory === 0) {
      toast.error("This archival piece has been depleted.");
      return;
    }

    if (product.sizes && product.sizes.length > 0) {
      setShowSizePicker(true);
    } else {
      addToCart({
        ...product,
        productId: product.id,
        inventory: product.inventory
      });
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      productId: product.id,
      size: size,
      inventory: product.inventory
    });
    setShowSizePicker(false);
    toast.success(`${product.name} (${size}) added to cart`);
  };

  return (
    <div className="group animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-[2rem] bg-white aspect-[3/4] mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 mix-blend-multiply"
            loading="lazy"
          />

          {product.tag && (
            <div className="absolute top-6 left-6 z-20 animate-fade-in">
              <span className="px-5 py-2 bg-white/80 backdrop-blur-xl text-primary text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/50 inline-block transition-transform duration-700 group-hover:scale-110 group-hover:-translate-y-1">
                {product.tag}
              </span>
            </div>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-white shadow-lg active:scale-95"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-300",
                isWishlisted ? "text-accent fill-accent scale-110" : "text-primary group-hover:text-accent"
              )}
            />
          </button>

          {product.inventory === 0 ? (
            <div className="absolute bottom-10 right-6 px-4 py-2 bg-rose-500/90 backdrop-blur-md text-white rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl z-20">
              <span className="text-[10px] font-black uppercase tracking-widest">Depleted</span>
            </div>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-6 right-6 w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-accent hover:text-white shadow-2xl z-20"
            >
              <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
            </button>
          )}

          {/* Size Picker Overlay */}
          {showSizePicker && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-2xl z-30 flex flex-col items-center justify-center p-8 animate-fade-in rounded-[2rem] ">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowSizePicker(false); }}
                className="absolute top-6 right-6 text-white hover:text-white transition-colors"
              >
                <X className="w-6 h-6" color='white' />
              </button>
              <p className="text-white text-[10px] uppercase tracking-[0.3em] font-black mb-8">Select Your Size</p>
              <div className="flex flex-wrap justify-center gap-4">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={(e) => handleSelectSize(e, size)}
                    className="w-14 h-14 flex items-center justify-center border border-white/20 text-white hover:bg-white hover:text-black transition-all font-black text-sm rounded-full"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 px-2 text-center">
          <p className="text-[10px] text-accent uppercase tracking-[0.3em] font-black italic">
            {product.category}
          </p>
          <h3 className="font-heading text-xl font-bold group-hover:text-accent transition-colors tracking-tight">{product.name}</h3>
          <p className="text-muted-foreground font-medium text-lg">
            <Price amount={product.price} />
          </p>
        </div>
      </Link>
    </div>
  );
}
