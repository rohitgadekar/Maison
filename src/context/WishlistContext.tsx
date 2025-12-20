import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface WishlistContextType {
    wishlistItems: string[]; // array of product IDs
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
            setLoading(false);
        }
    }, [user]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wishlist' as any)
                .select('product_id');

            if (error) throw error;
            setWishlistItems(data.map((item: any) => item.product_id));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (productId: string) => {
        if (!user) {
            toast.error('Please authenticate to save artifacts to your wishlist.');
            return;
        }

        const isExisting = wishlistItems.includes(productId);

        try {
            if (isExisting) {
                // Remove
                const { error } = await supabase
                    .from('wishlist' as any)
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);

                if (error) throw error;
                setWishlistItems(prev => prev.filter(id => id !== productId));
                toast.info('Artifact removed from your wishlist archive.');
            } else {
                // Add
                const { error } = await supabase
                    .from('wishlist' as any)
                    .insert([{ user_id: user.id, product_id: productId }]);

                if (error) throw error;
                setWishlistItems(prev => [...prev, productId]);
                toast.success('Artifact secured in your wishlist archive.');
            }
        } catch (error) {
            console.error('Wishlist modification error:', error);
            toast.error('An error occurred while modifying your archive.');
        }
    };

    const isInWishlist = (productId: string) => wishlistItems.includes(productId);

    return (
        <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
