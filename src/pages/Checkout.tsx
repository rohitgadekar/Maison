import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, CreditCard, Truck, Plus, Trash2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    phone: '',
    saveAddress: true
  });

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to checkout');
      navigate('/auth', { state: { from: '/checkout' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('saved_addresses')
        .select('*')
        .order('is_default', { ascending: false });

      if (data && data.length > 0) {
        setSavedAddresses(data);
        const defaultAddress = data.find(a => a.is_default) || data[0];
        setSelectedAddressId(defaultAddress.id);
      }
    };

    fetchSavedAddresses();
  }, [user]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    
    if (addressId !== 'new') {
      const address = savedAddresses.find(a => a.id === addressId);
      if (address) {
        const nameParts = address.full_name.split(' ');
        setFormData({
          ...formData,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          address: address.address,
          city: address.city,
          zip: address.postal_code,
          country: address.country,
          phone: address.phone || ''
        });
      }
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: user?.email || '',
        address: '',
        city: '',
        zip: '',
        country: 'United States',
        phone: '',
        saveAddress: true
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const { error } = await supabase
      .from('saved_addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      toast.error('Failed to delete address');
      return;
    }

    setSavedAddresses(savedAddresses.filter(a => a.id !== addressId));
    if (selectedAddressId === addressId) {
      setSelectedAddressId('new');
    }
    toast.success('Address deleted');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to checkout');
      navigate('/auth', { state: { from: '/checkout' } });
      return;
    }

    setIsProcessing(true);

    try {
      // Save address if requested and using new address
      if (selectedAddressId === 'new' && formData.saveAddress) {
        await supabase
          .from('saved_addresses')
          .insert({
            user_id: user.id,
            label: savedAddresses.length === 0 ? 'Home' : 'Address ' + (savedAddresses.length + 1),
            full_name: `${formData.firstName} ${formData.lastName}`,
            address: formData.address,
            city: formData.city,
            postal_code: formData.zip,
            country: formData.country,
            phone: formData.phone || null,
            is_default: savedAddresses.length === 0
          });
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalPrice * 1.08, // Including tax
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.zip,
          shipping_country: formData.country,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id.split('-')[0], // Extract product ID from cart item ID
        quantity: item.quantity,
        price: item.price * item.quantity,
        size: item.size || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderComplete(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <CartDrawer />
        
        <main className="pt-24 sm:pt-28 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl mb-4">Thank You!</h1>
              <p className="text-muted-foreground mb-8">
                Your order has been confirmed and will be shipped soon.
                You can track your order in "My Orders".
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/orders')} variant="outline">
                  View My Orders
                </Button>
                <Button onClick={() => navigate('/shop')}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <CartDrawer />
        
        <main className="pt-24 sm:pt-28 pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto text-center py-16">
              <h1 className="font-heading text-3xl sm:text-4xl mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">
                Add some items to your cart to proceed with checkout.
              </p>
              <Button onClick={() => navigate('/shop')} size="lg">
                Browse Products
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl sm:text-4xl text-center mb-12">Checkout</h1>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Order Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent" />
                        <h2 className="font-heading text-xl">Shipping Address</h2>
                      </div>
                    </div>
                    
                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={handleAddressSelect}
                      className="space-y-3"
                    >
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`relative flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-muted-foreground/50'
                          }`}
                        >
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <p className="font-medium">{address.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {address.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.address}, {address.city}, {address.postal_code}
                            </p>
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      <div
                        className={`flex items-center gap-3 p-4 border rounded-lg transition-colors cursor-pointer ${
                          selectedAddressId === 'new'
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-muted-foreground/50'
                        }`}
                        onClick={() => handleAddressSelect('new')}
                      >
                        <RadioGroupItem value="new" id="new-address" />
                        <label htmlFor="new-address" className="flex items-center gap-2 cursor-pointer">
                          <Plus className="w-4 h-4" />
                          Use a new address
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* New Address Form */}
                {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {savedAddresses.length === 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5 text-accent" />
                        <h2 className="font-heading text-xl">Shipping Information</h2>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email || user?.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          required
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={formData.saveAddress}
                        onChange={(e) => setFormData({ ...formData, saveAddress: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="saveAddress" className="text-sm cursor-pointer">
                        Save this address for future orders
                      </Label>
                    </div>
                  </div>
                )}

                {/* Payment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5 text-accent" />
                    <h2 className="font-heading text-xl">Payment Details</h2>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" required placeholder="4242 4242 4242 4242" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" required placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" required placeholder="123" />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay $${(totalPrice * 1.08).toFixed(2)}`}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  This is a demo checkout. No real payment will be processed.
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:pl-8 lg:border-l border-border">
              <h2 className="font-heading text-xl mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-lg bg-card"
                    />
                    <div className="flex-1">
                      <h4 className="font-heading text-sm">{item.name}</h4>
                      {item.size && (
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-heading pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${(totalPrice * 1.08).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;