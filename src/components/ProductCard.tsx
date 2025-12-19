import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div
      className="group animate-fade-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-lg bg-card aspect-[3/4] mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
            {product.badge}
          </span>
        )}

        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-4 right-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent shadow-card"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {product.category}
        </p>
        <h3 className="font-heading text-lg">{product.name}</h3>
        <p className="text-muted-foreground">${product.price}</p>
      </div>
    </div>
  );
}
