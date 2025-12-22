import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Price } from './Price';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export function CartDrawer() {
  const { items, removeFromCart, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();
  const { allowCheckouts } = useSiteSettings();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleCheckout = () => {
    if (!allowCheckouts) {
      toast.error('Acquisition Protocol Offline. The terminal is currently not accepting new orders.');
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col bg-[#FFFAF5] p-0",
          isMobile
            ? "h-[100dvh] border-none"
            : "w-full sm:max-w-md h-full border-l border-accent/10"
        )}
      >
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
                      {item.inventory === 0 && (
                        <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-2 block">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-white px-1 py-1 rounded-full border border-accent/10 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={`text-xs font-black w-4 text-center ${item.inventory === 0 ? 'text-rose-500' : ''}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.inventory === 0 || item.quantity >= item.inventory}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-colors disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed disabled:hover:text-current"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
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
                disabled={!allowCheckouts}
                className={cn(
                  "w-full h-16 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all rounded-full",
                  allowCheckouts ? "bg-primary hover:bg-black" : "bg-primary/20 cursor-not-allowed"
                )}
              >
                {allowCheckouts ? 'Secure Acquisition' : 'Acquisitions Restricted'}
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
