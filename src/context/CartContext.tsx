import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  size?: string;
  quantity: number;
  inventory: number;
}

interface ProductInput {
  id: string; // This will be the unique cart item ID (e.g. productId-size)
  productId: string; // The original database ID
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  size?: string;
  quantity?: number;
  inventory: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductInput, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Fetch cart from Supabase
  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('cart_items' as any)
        .select('*, product:products(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }

      if (data) {
        // Fetch size-specific stocks for products in cart
        const productIds = data.map((item: any) => item.product_id);
        const { data: stocksData } = await supabase
          .from('product_stocks' as any)
          .select('product_id, size, quantity')
          .in('product_id', productIds);

        const stockMap: Record<string, number> = {};
        if (stocksData) {
          stocksData.forEach((s: any) => {
            stockMap[`${s.product_id}-${s.size}`] = s.quantity;
          });
        }

        const mappedItems: CartItem[] = data.map((item: any) => {
          let inventory = item.product.inventory;

          // If item has a size, check specific stock logic
          if (item.size) {
            const specificStock = stockMap[`${item.product_id}-${item.size}`];
            // If specific stock record exists, use it. 
            // If not found but size is present, it might mean 0 or data inconsistency. 
            // Assume 0 if we expect a stock record for a size.
            if (specificStock !== undefined) {
              inventory = specificStock;
            }
          }

          return {
            id: `${item.product_id}-${item.size || 'default'}`, // Construct consistent ID
            productId: item.product_id,
            name: item.product.name,
            price: item.product.price,
            description: item.product.description,
            category: item.product.category,
            image: item.product.image_url || (item.product.images ? item.product.images[0] : ''),
            size: item.size,
            quantity: item.quantity,
            inventory: inventory
          };
        });
        setItems(mappedItems);
      }
    } catch (err) {
      console.error('Cart sync error:', err);
    }
  };

  // Subscribe to Realtime changes
  useEffect(() => {
    if (!user) {
      setItems([]); // Clear cart on logout
      return;
    }

    fetchCart();

    // Subscribe to Cart Changes
    const cartChannel = supabase
      .channel('cart_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
        },
        () => {
          fetchCart();
        }
      )
      .subscribe();

    // Subscribe to Product Stock Changes
    // Subscribe to Product Stock Changes (Total Inventory)
    const productChannel = supabase
      .channel('product_inventory_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchCart();
        }
      )
      .subscribe();

    // Subscribe to Size-Specific Stock Changes
    const sizeStockChannel = supabase
      .channel('size_stock_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'product_stocks',
        },
        () => {
          fetchCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cartChannel);
      supabase.removeChannel(productChannel);
      supabase.removeChannel(sizeStockChannel);
    };
  }, [user]);

  const addToCart = async (product: ProductInput, openDrawer = true) => {
    // Optimistic Update
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= existingItem.inventory) {
          return prevItems;
        }
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: product.quantity || 1 }];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    }

    // Sync to Supabase
    if (user) {
      const existingItem = items.find((item) => item.id === product.id);
      const newQuantity = existingItem ? existingItem.quantity + 1 : (product.quantity || 1);

      // Check if we need to insert or update
      // Since we don't know the DB row ID easily without fetching, using upsert with user_id+product_id+size is best if constraint exists.
      // If not, we try to match manually.

      const { data: existingRows } = await supabase
        .from('cart_items' as any)
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.productId)
        .eq('size', product.size || '')
        .maybeSingle();

      if (existingRows) {
        const row = existingRows as any;
        await supabase
          .from('cart_items' as any)
          .update({ quantity: row.quantity + 1 })
          .eq('id', row.id);
      } else {
        await supabase
          .from('cart_items' as any)
          .insert({
            user_id: user.id,
            product_id: product.productId,
            quantity: product.quantity || 1,
            size: product.size || ''
          });
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    // Optimistic
    const itemToRemove = items.find(i => i.id === productId);
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));

    if (user && itemToRemove) {
      // We need to match precise item by product_id and size
      await supabase
        .from('cart_items' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', itemToRemove.productId)
        .eq('size', itemToRemove.size || '');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Optimistic
    setItems((prevItems) => {
      const item = prevItems.find(i => i.id === productId);
      if (item && quantity > item.inventory) {
        return prevItems;
      }
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });

    if (user) {
      const item = items.find(i => i.id === productId);
      if (item) {
        await supabase
          .from('cart_items' as any)
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', item.productId)
          .eq('size', item.size || '');
      }
    }
  };

  const clearCart = async () => {
    setItems([]);
    if (user) {
      await supabase
        .from('cart_items' as any)
        .delete()
        .eq('user_id', user.id);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
