import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Price } from './Price';

export function CartDrawer() {
  const { items, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-[#FFFAF5] border-l border-accent/10 p-0">
        <SheetHeader className="p-8 border-b border-accent/5 bg-white">
          <SheetTitle className="font-heading text-3xl font-bold tracking-tight">Your <span className="italic font-light text-accent">Archive</span></SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-12">
            <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center text-accent/20">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <div>
              <p className="font-heading text-2xl mb-2 italic">The archive is empty</p>
              <p className="text-sm text-primary/40 font-medium">
                Your collection awaits its first piece.
              </p>
            </div>
            <Button
              onClick={() => setIsCartOpen(false)}
              className="mt-8 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] px-10 h-12"
            >
              Begin Browsing
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 group"
                >
                  <div className="w-24 h-32 rounded-[1.5rem] overflow-hidden bg-accent/5 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-heading text-lg font-bold mb-1 tracking-tight">{item.name}</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        {item.size && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 px-2 py-0.5 rounded-full">{item.size}</span>
                        )}
                        <Price amount={item.price} className="text-sm font-bold italic" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-accent/10 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white border-t border-accent/5 space-y-8">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Total Investment</span>
                <Price amount={totalPrice} className="text-3xl font-black tracking-tighter" />
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-black transition-all rounded-full"
              >
                Secure Acquisition
              </Button>
              <p className="text-[9px] text-center text-primary/30 font-black uppercase tracking-widest">
                Logistics & Protocol Tax calculated at session end.
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
