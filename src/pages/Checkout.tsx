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
import { CheckCircle, CreditCard, Truck, Plus, Trash2, MapPin, Check, Ticket, X as LucideX, ShieldCheck } from 'lucide-react';
import { PremiumLoader } from '@/components/PremiumLoader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SEO } from '@/components/SEO';
import { Price } from '@/components/Price';
import { calculateOrderTotals, roundPrice } from '@/lib/calculations';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { sendOrderNotification } from '@/lib/notifications';
// Cashfree is loaded via CDN in index.html to avoid bundling issues
declare global {
  interface Window {
    Cashfree: any;
  }
}

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
  const [isEditing, setIsEditing] = useState(false);
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
  const [shippingProviders, setShippingProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [isCouponsDialogOpen, setIsCouponsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchShippingProviders = async () => {
      const { data, error } = await supabase
        .from('shipping_providers' as any)
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        setShippingProviders(data);
        if (data.length > 0) {
          setSelectedProvider(data[0]);
        }
      } else {
        // Fallback or handle error
        const defaults = [
          { id: '1', name: 'Maison Express', base_fee: 25.00, delivery_estimate: '2-3 Business Days', is_active: true },
          { id: '2', name: 'Standard Logistics', base_fee: 12.00, delivery_estimate: '5-7 Business Days', is_active: true },
        ];
        setShippingProviders(defaults);
        setSelectedProvider(defaults[0]);
      }
    };
    fetchShippingProviders();
  }, []);

  const shippingFee = selectedProvider ? Number(selectedProvider.base_fee) : 0;
  const { tax: taxAmount, total: grandTotal } = calculateOrderTotals(totalPrice, shippingFee, discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    handleApplyViaCode(couponCode);
  };

  const handleSelectCoupon = async (code: string) => {
    setCouponCode(code);
    // Use a small timeout to ensure state update before applying
    setTimeout(() => {
      handleApplyViaCode(code);
    }, 10);
  };

  const handleApplyViaCode = async (code: string) => {
    setIsApplyingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupons' as any)
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('This incentive key is not recognized in the registry');
        return;
      }

      const coupon = data as any;

      // 1. Check expiration
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        toast.error('This archival incentive has expired');
        return;
      }

      // 2. Check usage limit
      if (coupon.usage_limit && (coupon.usage_count || 0) >= coupon.usage_limit) {
        toast.error('This incentive has reached its utilization limit');
        return;
      }

      // 3. Check customer designation
      const allowedCustomers = coupon.customer_ids || (coupon.customer_id ? [coupon.customer_id] : []);
      if (allowedCustomers.length > 0 && (!user || !allowedCustomers.includes(user.id))) {
        toast.error('This incentive is reserved for specific archival members');
        return;
      }

      // 4. Check minimum threshold
      if (totalPrice < Number(coupon.min_order_amount)) {
        toast.error(`Minimum archival investment of $${coupon.min_order_amount} required`);
        return;
      }

      setAppliedCoupon(coupon);
      let calculatedDiscount = 0;
      if (coupon.discount_type === 'percentage') {
        calculatedDiscount = totalPrice * (Number(coupon.discount_value) / 100);
      } else if (coupon.discount_type === 'flat') {
        calculatedDiscount = Number(coupon.discount_value);
      } else if (coupon.discount_type === 'free_delivery') {
        calculatedDiscount = shippingFee;
      }
      calculatedDiscount = roundPrice(calculatedDiscount);

      setDiscountAmount(calculatedDiscount);
      toast.success('Archival incentive successfully validated');
      setCouponCode('');
      setIsCouponsDialogOpen(false);
    } catch (err) {
      console.error('Coupon error:', err);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      const { data } = await supabase
        .from('coupons' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data) {
        // Filter coupons to only show:
        // 1. Universal coupons (no customer_id/customer_ids)
        // 2. Coupons assigned to THIS user
        const filtered = data.filter((coupon: any) => {
          const allowedCustomers = coupon.customer_ids || (coupon.customer_id ? [coupon.customer_id] : []);
          return allowedCustomers.length === 0 || (user && allowedCustomers.includes(user.id));
        });
        setAvailableCoupons(filtered);
      }
    };
    if (user) fetchCoupons();
  }, [user]);

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  // Update discount amount if shipping provider changes while a free delivery coupon is applied
  useEffect(() => {
    if (appliedCoupon?.discount_type === 'free_delivery') {
      setDiscountAmount(shippingFee);
    }
  }, [shippingFee, appliedCoupon]);

  const { allowCheckouts, enablePOD, enableOnlinePayments, loading: settingsLoading } = useSiteSettings();
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'pod'>('online');

  // Update payment method based on available options
  useEffect(() => {
    // If current method is online but online payments are disabled, switch to POD if available
    if (paymentMethod === 'online' && !enableOnlinePayments) {
      if (enablePOD) {
        setPaymentMethod('pod');
      }
    }
    // If current method is POD but POD is disabled, switch to online if available
    else if (paymentMethod === 'pod' && !enablePOD) {
      if (enableOnlinePayments) {
        setPaymentMethod('online');
      }
    }
    // Initial load: prioritize online if both available, otherwise use what's available
    else if (settingsLoading === false) {
      if (!enableOnlinePayments && enablePOD && paymentMethod === 'online') {
        setPaymentMethod('pod');
      }
    }
  }, [enablePOD, enableOnlinePayments, paymentMethod, settingsLoading]);

  useEffect(() => {
    if (!settingsLoading && !allowCheckouts) {
      toast.error('Acquisition Protocol Offline. The terminal is currently not accepting new orders.');
      navigate('/shop');
    }
  }, [allowCheckouts, settingsLoading, navigate]);

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

        // Populate formData with default address
        const nameParts = defaultAddress.full_name.split(' ');
        setFormData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          address: defaultAddress.address,
          city: defaultAddress.city,
          zip: defaultAddress.postal_code,
          country: defaultAddress.country,
          phone: defaultAddress.phone || '',
          email: user.email || ''
        }));
      }
    };

    fetchSavedAddresses();
  }, [user]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setIsEditing(false); // Reset editing mode when selecting a different address

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

    if (!allowCheckouts) {
      toast.error('Acquisition Protocol Offline. The terminal is currently not accepting new orders.');
      navigate('/shop');
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    setIsProcessing(true);

    try {
      // Save/Update address if requested
      if (formData.saveAddress) {
        if (selectedAddressId === 'new') {
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
        } else if (isEditing) {
          // Update the existing saved address
          await supabase
            .from('saved_addresses')
            .update({
              full_name: `${formData.firstName} ${formData.lastName}`,
              address: formData.address,
              city: formData.city,
              postal_code: formData.zip,
              country: formData.country,
              phone: formData.phone || null,
            })
            .eq('id', selectedAddressId);
        }
      }

      // Create order with order-specific details
      // Create order with order-specific details
      const shippingMethodName = selectedProvider?.name || 'Standard Logistics';
      const finalShippingMethod = paymentMethod === 'pod' ? `${shippingMethodName} (Concierge POD)` : shippingMethodName;

      const { data: order, error: orderError } = await supabase
        .from('orders' as any)
        .insert({
          user_id: user.id,
          total_amount: grandTotal,
          shipping_address: formData.address,
          shipping_city: formData.city,
          shipping_postal_code: formData.zip,
          shipping_country: formData.country,
          shipping_phone: formData.phone || null,
          shipping_name: `${formData.firstName} ${formData.lastName}`,
          shipping_method_name: finalShippingMethod,
          shipping_fee: shippingFee,
          coupon_id: appliedCoupon?.id || null,
          discount_amount: discountAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsData = items.map(item => ({
        order_id: (order as any).id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price * item.quantity,
        size: item.size || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) throw itemsError;

      // If POD, deduct stock instantly
      if (paymentMethod === 'pod') {
        const inventoryItems = items.map(item => ({
          product_id: item.productId,
          size: item.size || null,
          quantity: item.quantity
        }));

        await (supabase as any).rpc('deduct_inventory', { p_items: inventoryItems });
        console.log('POD Stock deducted instantly');
      }

      if (appliedCoupon && paymentMethod === 'pod') {
        await (supabase as any).rpc('increment_coupon_usage', { p_coupon_id: appliedCoupon.id });
      }

      if (paymentMethod === 'pod') {
        // POD Flow: No payment gateway required
        // Create a payment record with 'pending' status
        const txId = `POD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const { error: paymentError } = await supabase
          .from('payments' as any)
          .insert({
            order_id: (order as any).id,
            user_id: user.id,
            amount: grandTotal,
            currency: 'INR', // Use standard currency or assume INR for consistency if fallback needed
            status: 'pending', // Awaiting payment on delivery
            payment_method: 'Pay on Delivery',
            transaction_id: txId,
            rzp_payment_id: txId, // Fallback for Not Null constraint
            created_at: new Date().toISOString()
          });

        if (paymentError) {
          console.error('Failed to create payment record:', paymentError);
          // We don't block the order success, but we log it.
        }

        toast.success('Concierge delivery confirmed. Acquisition registered.');

        // Trigger acquisition confirmation email
        sendOrderNotification(order, items, 'confirmation');

        navigate(`/orders?order_id=${(order as any).id}`);
        return;
      }

      // Online Payment Flow: Razorpay
      let rzpData, rzpError;
      try {
        const response = await supabase.functions.invoke('create-razorpay-order', {
          body: {
            amount: grandTotal,
            currency: 'INR',
            receipt: (order as any).id,
            user_id: user.id,
          }
        });
        rzpData = response.data;
        rzpError = response.error;
      } catch (invkErr) {
        console.error('Function invocation error:', invkErr);
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', (order as any).id);
        throw new Error('Could not connect to payment gateway. Please try again.');
      }

      if (rzpError || rzpData?.error) {
        console.error('Razorpay initialization failed:', rzpError || rzpData?.error);
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', (order as any).id);
        throw new Error(rzpData?.error || 'Payment gateway rejected the order initialization.');
      }

      // Initiate Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: 'Maison',
        description: 'Order Acquisition',
        order_id: rzpData.id,
        handler: function (response: any) {
          console.log('Razorpay payment successful:', response);
          toast.success('Payment authorized. Ritual complete.');

          // Trigger acquisition confirmation email after successful payment
          sendOrderNotification(order, items, 'confirmation');

          navigate(`/orders?order_id=${(order as any).id}`);
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: user.email || formData.email,
          contact: formData.phone || '9999999999'
        },
        theme: {
          color: '#FFFAF5'
        },
        modal: {
          ondismiss: function () {
            // Check if payment was really failed or just closed
            console.log('Checkout modal closed');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

      // Inventory deduction and coupon increment will move to a webhook or 
      // be handled after successful payment. For now, since we are doing a 
      // simple integration, we'll keep the client-side success path if possible.
      // But CF redirect/modal usually takes over.

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };



  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
        <Header />
        <CartDrawer />
        <main className="flex-1 pt-32 sm:pt-48 pb-32">
          <PremiumLoader message="Synchronizing Protocol Status..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
        <Header />
        <CartDrawer />

        <main className="flex-1 pt-32 sm:pt-48 pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                <CheckCircle className="w-12 h-12 text-accent" />
              </div>
              <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-8 tracking-tighter">Success<span className="italic font-light text-accent">.</span></h1>
              <p className="text-xl text-primary/50 mb-12 italic font-medium">
                Your acquisition has been recorded in the Maison archive. We will notify you when logistics are initiated.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/orders')}
                  variant="outline"
                  className="h-16 px-10 rounded-full border-accent/10 font-black uppercase tracking-widest text-[10px]"
                >
                  View Registry
                </Button>
                <Button
                  onClick={() => navigate('/shop')}
                  className="h-16 px-10 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black"
                >
                  Return to Archive
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
      <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
        <Header />
        <CartDrawer />

        <main className="flex-1 pt-32 sm:pt-48 pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg mx-auto text-center py-16">
              <h1 className="font-heading text-5xl sm:text-6xl font-bold mb-8 tracking-tighter">Collection Empty<span className="italic font-light text-accent">.</span></h1>
              <p className="text-xl text-primary/50 mb-12 italic font-medium">
                Your current session contains no artifacts to acquire.
              </p>
              <Button
                onClick={() => navigate('/shop')}
                className="h-16 px-12 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black"
              >
                Browse Collections
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      <SEO title="Secure Acquisition" description="Complete your secure archival acquisition." />
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-32 sm:pt-48 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <span className="text-accent uppercase tracking-[0.5em] text-[10px] font-black mb-6 block">Final Step</span>
            <h1 className="font-heading text-6xl sm:text-7xl font-bold mb-6 tracking-tighter">
              Secure <span className="italic font-light text-accent">Acquisition.</span>
            </h1>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Order Form */}
            <div className="space-y-12">
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <MapPin className="w-6 h-6 text-accent" />
                      <h2 className="font-heading text-2xl font-bold tracking-tight uppercase">Shipping Destination</h2>
                    </div>

                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={handleAddressSelect}
                      className="grid grid-cols-1 gap-4"
                    >
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={`relative flex items-start gap-4 p-8 rounded-[2rem] border transition-all duration-500 group ${selectedAddressId === address.id
                            ? 'border-accent bg-white shadow-xl'
                            : 'border-accent/10 bg-white/50 hover:bg-white hover:border-accent/30'
                            }`}
                        >
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={address.id} className="cursor-pointer">
                              <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">{address.label}</p>
                              <p className="font-bold text-lg mb-1">{address.full_name}</p>
                              <p className="text-muted-foreground italic font-medium">
                                {address.address}, {address.city}, {address.postal_code}
                              </p>
                              {address.phone && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mt-1">Ref: {address.phone}</p>
                              )}
                            </Label>

                            {selectedAddressId === address.id && !isEditing && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                className="mt-4 text-[10px] font-black uppercase tracking-widest text-accent hover:text-primary transition-colors flex items-center gap-2"
                              >
                                Edit Archival Details
                              </button>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}
                            className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <div
                        className={`flex items-center gap-4 p-8 rounded-[2rem] border border-dashed transition-all duration-500 ${selectedAddressId === 'new'
                          ? 'border-accent bg-white shadow-xl'
                          : 'border-accent/20 bg-transparent hover:bg-white/50'
                          }`}
                      >
                        <RadioGroupItem value="new" id="new-address" />
                        <Label htmlFor="new-address" className="flex items-center gap-3 cursor-pointer font-bold uppercase tracking-widest text-[10px] text-accent flex-1 h-full">
                          <Plus className="w-4 h-4" />
                          New Archival Location
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Address Modification Form */}
                {(selectedAddressId === 'new' || savedAddresses.length === 0 || isEditing) && (
                  <div className="bg-white p-10 sm:p-12 rounded-[3.5rem] shadow-sm border border-accent/5 space-y-8 animate-fade-in text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/5 rounded-full mb-6">
                      <Truck className="w-8 h-8 text-accent" />
                    </div>
                    <h2 className="font-heading text-3xl font-bold tracking-tight mb-8">
                      {isEditing ? 'Modify Logistics' : 'Delivery Coordinates'}
                    </h2>

                    <div className="grid grid-cols-2 gap-6 text-left">
                      <div className="space-y-3">
                        <Label htmlFor="firstName" className="ml-2 text-[10px] font-black uppercase tracking-widest text-accent">First Name</Label>
                        <Input
                          id="firstName"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="John"
                          className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="lastName" className="ml-2 text-[10px] font-black uppercase tracking-widest text-accent">Last Name</Label>
                        <Input
                          id="lastName"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Doe"
                          className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="ml-2 text-[10px] font-black uppercase tracking-widest text-accent">Email Record</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="phone" className="ml-2 text-[10px] font-black uppercase tracking-widest text-accent">Logistics Phone</Label>
                        <Input
                          id="phone"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 text-left">
                      <Label htmlFor="address" className="ml-2 text-[10px] font-black uppercase tracking-widest text-accent">Street Address</Label>
                      <Input
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Maison Blvd"
                        className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-left">
                      <div className="space-y-3">
                        <Label htmlFor="city" className="ml-2 text-[10px] font-black uppercase tracking-widest text-accent">City</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Paris"
                          className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="zip" className="ml-2 text-[10px] font-black uppercase tracking-widest text-accent">Postal Code</Label>
                        <Input
                          id="zip"
                          required
                          value={formData.zip}
                          onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                          placeholder="75001"
                          className="h-14 bg-accent/5 border-none rounded-2xl px-6 focus:ring-accent focus:bg-white transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-8 justify-center">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, saveAddress: !formData.saveAddress })}
                        className="flex items-center gap-4 group cursor-pointer outline-none"
                      >
                        <div className={`w-10 h-10 rounded-2xl border border-accent/20 flex items-center justify-center transition-all duration-700 ${formData.saveAddress ? 'bg-accent shadow-[0_10px_30px_-10px_rgba(200,80,50,0.5)] border-accent' : 'bg-transparent overflow-hidden'}`}>
                          {formData.saveAddress ? (
                            <Check className="w-5 h-5 text-white animate-in zoom-in duration-500" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-accent/20 rounded-full group-hover:scale-[8] transition-all duration-700" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-1 italic">Logistics Registry</p>
                          <Label className="text-xs font-bold uppercase tracking-widest text-primary/60 cursor-pointer group-hover:text-primary transition-colors">
                            {isEditing ? 'Sync Archival Record' : 'Commit to Personal Archive'}
                          </Label>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div className="bg-[#111] text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group transition-all duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
                  <div className="flex items-center gap-4 mb-10 relative z-10">
                    <ShieldCheck className="w-8 h-8 text-accent" />
                    <h2 className="font-heading text-2xl font-bold tracking-tight uppercase italic">Secure Payment</h2>
                  </div>

                  <div className="space-y-8 relative z-10">
                    {(enablePOD || enableOnlinePayments) && (
                      <div className={`grid grid-cols-1 ${enablePOD && enableOnlinePayments ? 'md:grid-cols-2' : ''} gap-4`}>
                        {enableOnlinePayments && (
                          <div
                            onClick={() => setPaymentMethod('online')}
                            className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 ${paymentMethod === 'online' ? 'bg-white/10 border-accent shadow-lg shadow-accent/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <CreditCard className={`w-6 h-6 ${paymentMethod === 'online' ? 'text-accent' : 'text-white/60'}`} />
                              <p className="font-bold text-sm">Online Transfer</p>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed">Secure digital gateway via UPI, Card, or Netbanking.</p>
                          </div>
                        )}

                        {enablePOD && (
                          <div
                            onClick={() => setPaymentMethod('pod')}
                            className={`cursor-pointer rounded-3xl p-6 border transition-all duration-300 ${paymentMethod === 'pod' ? 'bg-white/10 border-accent shadow-lg shadow-accent/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <Truck className={`w-6 h-6 ${paymentMethod === 'pod' ? 'text-accent' : 'text-white/60'}`} />
                              <p className="font-bold text-sm">Concierge P.O.D</p>
                            </div>
                            <p className="text-[10px] text-white/50 leading-relaxed">Settle the acquisition upon personal delivery.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {!enablePOD && !enableOnlinePayments && (
                      <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-200">
                        <p className="text-sm font-bold flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5" /> Protocol Paused
                        </p>
                        <p className="text-[10px] uppercase tracking-widest mt-2 opacity-70">
                          No payment methods are currently active. Please contact concierge support.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'online' && enableOnlinePayments ? (
                      <div className="space-y-6 animate-fade-in">
                        <p className="text-secondary italic font-medium leading-relaxed text-sm">
                          You will be redirected to the secure payment gateway to complete your acquisition. All transactions are encrypted.
                        </p>
                        {!enablePOD && (
                          <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-accent" />
                            </div>
                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Payment Method</p>
                              <p className="font-bold text-sm">Credit/Debit Card, UPI, & Net Banking</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : paymentMethod === 'pod' && enablePOD ? (
                      <div className="space-y-6 animate-fade-in opacity-0 animate-fade-in fill-mode-forwards" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        <p className="text-secondary italic font-medium leading-relaxed text-sm">
                          Our concierge team will collect the payment when they deliver your archival pieces. We accept Cash, UPI, or Card on delivery.
                        </p>
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-accent" />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Delivery Protocol</p>
                            <p className="font-bold text-sm">Pay upon physical receipt</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className={`w-full h-20 font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all rounded-[2.5rem] mt-4 ${(!allowCheckouts || items.some(i => i.inventory === 0) || (!enablePOD && !enableOnlinePayments)) ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary text-white hover:bg-black hover:scale-[1.02] active:scale-[0.98]'}`}
                    disabled={isProcessing || !allowCheckouts || items.some(i => i.inventory === 0) || (!enablePOD && !enableOnlinePayments)}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-[1px] bg-white relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 w-1/2 bg-accent animate-loading-bar" />
                        </div>
                        <span>Verifying Archive...</span>
                      </div>
                    ) : !allowCheckouts ? (
                      <span>Acquisitions Restricted</span>
                    ) : items.some(i => i.inventory === 0) ? (
                      <span>Remove Depleted Artifacts</span>
                    ) : (!enablePOD && !enableOnlinePayments) ? (
                      <span>Payment Protocols Offline</span>
                    ) : (
                      <div className="flex items-center gap-2 justify-center">
                        {paymentMethod === 'online' ? 'Secure Acquisition' : 'Confirm Concierge Order'} (<Price amount={grandTotal} />)
                      </div>
                    )}
                  </Button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        handleAddressSelect(selectedAddressId); // Reset to original values
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-primary/30 hover:text-primary transition-colors"
                    >
                      Cancel Modifications
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="space-y-12">
              <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-accent/5 sticky top-32">
                <h2 className="font-heading text-3xl font-bold mb-12 tracking-tight uppercase text-center italic">The <span className="text-accent not-italic">Archive</span> List</h2>

                <div
                  data-lenis-prevent
                  className="space-y-8 mb-12 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar"
                >
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-8 group">
                      <div className="w-24 h-32 rounded-2xl overflow-hidden bg-accent/5 flex-shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ${item.inventory === 0 ? 'grayscale opacity-50' : ''}`}
                        />
                        {item.inventory === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white bg-rose-500 px-2 py-1 rounded-full">Depleted</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 py-2 flex flex-col justify-between">
                        <div>
                          <h4 className={`font-heading text-xl font-bold mb-1 tracking-tighter ${item.inventory === 0 ? 'text-primary/40 line-through decoration-rose-500' : ''}`}>{item.name}</h4>
                          <div className="flex gap-4">
                            {item.size && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-accent italic">Dim: {item.size}</span>
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/30 font-medium">Qty: {item.quantity}</span>
                          </div>
                          {item.inventory === 0 && (
                            <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1">Item No Longer Available</p>
                          )}
                        </div>
                        <Price amount={item.price * item.quantity} className={`text-xl font-black ${item.inventory === 0 ? 'text-primary/30' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 pt-10 border-t border-accent/10">
                  <div className="flex justify-between items-center">
                    <span className="text-primary/30 uppercase tracking-[0.3em] text-[10px] font-black">Gross Valuation</span>
                    <Price amount={totalPrice} className="font-bold text-lg" />
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-primary/30 uppercase tracking-[0.3em] text-[10px] font-black">Logistics</span>
                    <Price amount={shippingFee} className="font-bold text-lg" />
                  </div>

                  {shippingProviders.length > 1 && (
                    <div className="py-4 space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-accent">Select Logistics Partner</Label>
                      <div className="grid grid-cols-1 gap-2">
                        {shippingProviders.map(p => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProvider(p)}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${selectedProvider?.id === p.id
                              ? 'border-accent bg-accent/5 shadow-sm'
                              : 'border-accent/10 hover:border-accent/30'
                              }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-primary">{p.name}</p>
                                <p className="text-[9px] font-medium italic text-primary/40">{p.delivery_estimate}</p>
                              </div>
                              <Price amount={Number(p.base_fee)} className="text-sm font-black" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-primary/30 uppercase tracking-[0.3em] text-[10px] font-black">Gross Value</span>
                    <Price amount={totalPrice} className="font-bold text-lg" />
                  </div>

                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-primary/30 uppercase tracking-[0.3em] text-[10px] font-black">Logistics ({selectedProvider?.name || 'Standard'})</span>
                    <Price amount={shippingFee} className="font-bold text-lg" />
                  </div>

                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-primary/30 uppercase tracking-[0.3em] text-[10px] font-black">Administrative (8%)</span>
                    <Price amount={taxAmount} className="font-bold text-lg" />
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm font-medium text-accent">
                      <span className="uppercase tracking-[0.3em] text-[10px] font-black">Incentive Applied {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}</span>
                      <div className="font-bold text-lg flex items-center">-<Price amount={discountAmount} /></div>
                    </div>
                  )}

                  {/* Promo Code Input */}
                  {!appliedCoupon ? (
                    <div className="pt-6 space-y-4">
                      <div className="relative group/coupon">
                        <Input
                          placeholder="Archival Key"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="h-14 bg-accent/5 border-dashed border-accent/20 rounded-2xl px-6 pr-32 focus:ring-accent focus:bg-white transition-all font-black uppercase tracking-widest placeholder:text-[10px] placeholder:font-black"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode}
                          className="absolute right-2 top-2 h-10 px-6 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-[0_5px_15px_-5px_rgba(200,80,50,0.4)]"
                        >
                          {isApplyingCoupon ? 'Verifying...' : 'Apply'}
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsCouponsDialogOpen(true)}
                        className="w-full h-10 border border-accent/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all gap-2"
                      >
                        <Ticket className="w-3 h-3" />
                        View Available Incentives
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-6">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-accent text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-3">
                          <Ticket className="w-5 h-5 opacity-50" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{appliedCoupon.code}</p>
                            <p className="text-[8px] font-medium italic opacity-70">Privilege Authenticated</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <LucideX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-8 border-t border-accent/20">
                    <span className="font-heading text-2xl font-black uppercase tracking-tighter">Net Total</span>
                    <Price amount={grandTotal} className="text-4xl font-black text-accent tracking-tighter leading-none" />
                  </div>
                </div>

                <div className="mt-12 bg-accent/5 p-8 rounded-[2rem] border border-accent/10 relative overflow-hidden group/trace">
                  <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover/trace:translate-y-0 transition-transform duration-700" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent text-center relative z-10 italic">
                    Authenticated Archival Transfer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Available Coupons Dialog */}
      <Dialog open={isCouponsDialogOpen} onOpenChange={setIsCouponsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full rounded-[2rem] sm:rounded-[2.5rem] border-white/5 bg-[#0A0A0A]/95 backdrop-blur-3xl p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border max-h-[90vh] flex flex-col">
          <div className="p-6 sm:p-12 md:p-16 relative flex flex-col h-full overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-30" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />

            <DialogHeader className="mb-8 sm:mb-12 shrink-0 relative z-10">
              <div className="flex flex-col items-center sm:items-start space-y-3 sm:space-y-4">
                <div className="px-3 sm:py-1.5 py-1 px-4 rounded-full border border-accent/20 bg-accent/5">
                  <span className="text-accent text-[7px] sm:text-[8px] font-black uppercase tracking-[0.6em] block italic">Vault Clearance • Protocol 4.2</span>
                </div>
                <div>
                  <DialogTitle className="font-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none text-white mb-2 sm:mb-4">
                    Member <span className="italic font-light text-accent/80">Incentives.</span>
                  </DialogTitle>
                  <p className="text-[9px] sm:text-[11px] text-white/30 font-medium italic leading-relaxed max-w-sm text-center sm:text-left mx-auto sm:mx-0">
                    The archival system has calculated your membership tier. Authorized valuation adjustments for this specific protocol.
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div
              data-lenis-prevent
              className="space-y-4 sm:space-y-6 overflow-y-auto pr-2 sm:pr-6 custom-scrollbar scroll-smooth flex-1 min-h-0"
            >
              {availableCoupons.length === 0 ? (
                <div className="text-center py-16 sm:py-24 bg-white/[0.02] rounded-[2rem] sm:rounded-[3rem] border border-dashed border-white/10">
                  <Ticket className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-accent/20 mb-4 sm:mb-6 animate-pulse" />
                  <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.5em] text-white/20 italic">No authorized keys detected in vault</p>
                </div>
              ) : (
                ([...availableCoupons]
                  .sort((a, b) => {
                    const aEligible = totalPrice >= Number(a.min_order_amount);
                    const bEligible = totalPrice >= Number(b.min_order_amount);
                    if (aEligible && !bEligible) return -1;
                    if (!aEligible && bEligible) return 1;
                    return 0;
                  }))
                  .map((coupon) => {
                    const isEligible = totalPrice >= Number(coupon.min_order_amount);
                    const isFullyUtilized = coupon.usage_limit && (coupon.usage_count || 0) >= coupon.usage_limit;
                    const canUse = isEligible && !isFullyUtilized;

                    return (
                      <div
                        key={coupon.id}
                        onClick={() => canUse && handleSelectCoupon(coupon.code)}
                        className={`group relative flex h-32 sm:h-40 transition-all duration-700 rounded-2xl sm:rounded-[2rem] overflow-hidden border ${canUse
                          ? 'bg-white/[0.03] border-white/10 hover:border-accent/40 hover:bg-white/[0.05] cursor-pointer'
                          : 'bg-white/[0.01] border-white/[0.02] opacity-40 grayscale cursor-not-allowed'
                          }`}
                      >
                        {/* Status Glowing Indicator */}
                        {canUse && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-50 shadow-[0_0_20px_rgba(200,80,50,0.5)]" />
                        )}

                        {/* Left Stub - The Benefit */}
                        <div className={`w-24 sm:w-36 flex flex-col items-center justify-center p-4 sm:p-6 relative ${canUse ? 'bg-white/[0.02]' : 'bg-transparent'}`}>
                          <div className="absolute -top-4 -right-4 w-6 sm:w-8 h-6 sm:h-8 bg-[#0A0A0A] rounded-full z-10 border border-white/5" />
                          <div className="absolute -bottom-4 -right-4 w-6 sm:w-8 h-6 sm:h-8 bg-[#0A0A0A] rounded-full z-10 border border-white/5" />

                          <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mb-2 sm:mb-3 italic">Valuation</span>
                          <div className="text-center">
                            {coupon.discount_type === 'percentage' ? (
                              <p className="text-2xl sm:text-4xl font-black text-white group-hover:text-accent transition-colors duration-500 tracking-tighter leading-none">{coupon.discount_value}%</p>
                            ) : coupon.discount_type === 'free_delivery' ? (
                              <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:text-accent transition-colors duration-500 mx-auto" />
                            ) : (
                              <p className="text-lg sm:text-2xl font-black text-white group-hover:text-accent transition-colors duration-500 tracking-tighter leading-none">${Math.round(Number(coupon.discount_value))}</p>
                            )}
                            <p className="text-[5px] sm:text-[6px] font-bold uppercase tracking-[0.2em] text-accent mt-2 sm:mt-3">Reduction</p>
                          </div>

                          {/* Fine Dashed Line */}
                          <div className="absolute right-0 top-6 sm:top-8 bottom-6 sm:bottom-8 border-r border-dashed border-white/10" />
                        </div>

                        {/* Right Body - Detailed Disclosure */}
                        <div className="flex-1 p-4 sm:p-8 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2 sm:gap-4">
                            <div className="space-y-1 min-w-0">
                              <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.5em] text-accent italic">Registry Identity</span>
                              <h3 className="text-lg sm:text-2xl font-black tracking-[0.1em] text-white uppercase leading-none truncate">{coupon.code}</h3>
                            </div>
                            <div className={`shrink-0 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[6px] sm:text-[7px] font-black uppercase tracking-widest border transition-all duration-500 ${isFullyUtilized ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                              isEligible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-accent/10 group-hover:border-accent/20 group-hover:text-accent' :
                                'bg-white/5 border-white/10 text-white/30'
                              }`}>
                              {isFullyUtilized ? 'Exhausted' : isEligible ? 'Active' : 'Locked'}
                            </div>
                          </div>

                          <p className="text-[9px] sm:text-[11px] font-medium italic text-white/40 line-clamp-1 sm:line-clamp-2 pr-6 sm:pr-12 leading-relaxed">
                            {coupon.description || 'Verified archival membership privilege.'}
                          </p>

                          <div className="flex items-center justify-between pt-3 sm:pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3 sm:gap-6">
                              <div className="flex flex-col">
                                <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-[0.4em] text-white/20 mb-0.5 sm:mb-1">Utilization</span>
                                <span className="text-[8px] sm:text-[10px] font-black text-white/60 tracking-tighter">
                                  {coupon.usage_count || 0} / {coupon.usage_limit || '∞'} UNITS
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-[0.4em] text-white/20 mb-0.5 sm:mb-1">Requirement</span>
                              <span className={`text-[9px] sm:text-[11px] font-black ${isEligible ? 'text-white/80' : 'text-rose-500/80'}`}>
                                <Price amount={Number(coupon.min_order_amount)} />
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Luxury Select Indicator */}
                        {canUse && (
                          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_0_30px_rgba(200,80,50,0.6)] border border-white/20">
                              <Check className="w-6 h-6 stroke-[3px]" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            <div className="mt-8 sm:mt-12 shrink-0 group/close">
              <Button
                variant="outline"
                onClick={() => setIsCouponsDialogOpen(false)}
                className="w-full h-14 sm:h-18 rounded-xl sm:rounded-2xl border-white/10 bg-white/[0.02] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.6em] text-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-700 shadow-2xl relative overflow-hidden"
              >
                <span className="relative z-10 italic">Seal Vault</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;