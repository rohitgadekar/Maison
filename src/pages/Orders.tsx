import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeft, Truck, ExternalLink, Calendar, MapPin, CreditCard, XCircle, MoreVertical, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SEO } from '@/components/SEO';
import { Price } from '@/components/Price';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_postal_code: string | null;
  shipping_phone: string | null;
  shipping_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipping_method_name: string | null;
  shipping_fee: number | null;
  coupon_id: string | null;
  discount_amount: number | null;
  coupons?: { code: string } | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  size: string | null;
  price: number;
  products: {
    name: string;
    image_url: string | null;
    images: string[] | null;
  };
}

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [printingOrder, setPrintingOrder] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/orders' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('orders')
        .select('*, coupons(code)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders((data as any) || []);

      // Fetch order items for each order
      if (data && data.length > 0) {
        const itemsPromises = data.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*, products(name, image_url, images)')
            .eq('order_id', order.id);
          return { orderId: order.id, items: items || [] };
        });

        const itemsResults = await Promise.all(itemsPromises);
        const itemsMap: Record<string, OrderItem[]> = {};
        itemsResults.forEach(({ orderId, items }) => {
          itemsMap[orderId] = items;
        });
        setOrderItems(itemsMap);
      }

      setLoading(false);
    };

    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserName(data.full_name);
        setUserPhone(data.phone);
      }
    };

    if (user) {
      fetchOrders();
      fetchProfile();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'shipped':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'delivered':
        return 'bg-primary text-white border border-primary';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order is being reviewed';
      case 'processing':
        return 'Your order is being prepared';
      case 'shipped':
        return 'Your order is on the way';
      case 'delivered':
        return 'Your order has been delivered';
      case 'cancelled':
        return 'This order has been cancelled';
      default:
        return '';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!user) {
      toast.error("Security session expired. Please re-authenticate.");
      return;
    }

    try {
      console.log('Attempting to cancel order:', orderId, 'for user:', user.id);

      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Cancellation error from Supabase:', error);
        toast.error(`Failed to cancel order: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('No order was updated. check if id and user_id are correct.');
        toast.error('Order cannot be cancelled or was not found');
        return;
      }

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success('Order cancelled successfully');
    } catch (err: any) {
      console.error('Unexpected error during cancellation:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const handlePrintInvoice = (orderId: string) => {
    setPrintingOrder(orderId);
    // Give state time to update and render the hidden component before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const PremiumLoader = () => (
    <div className="flex flex-col items-center justify-center py-32 space-y-6">
      <div className="relative w-48 h-[1px] bg-accent/10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-accent animate-loading-bar" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent/40 italic animate-pulse">
        Accessing Archive...
      </span>
    </div>
  );

  const invoiceOrder = orders.find(o => o.id === printingOrder);
  const invoiceItems = printingOrder ? orderItems[printingOrder] || [] : [];
  const subtotal = invoiceItems.reduce((sum, item) => sum + Number(item.price), 0);
  const tax = subtotal * 0.08;
  const discount = Number(invoiceOrder?.discount_amount || 0);
  const total = subtotal + tax + Number(invoiceOrder?.shipping_fee || 0) - discount;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF5]">
      <SEO title="My Acquisitions" description="View your personal archival registry." />
      <Header />
      <CartDrawer />

      <main className="flex-1 pt-32 sm:pt-40 pb-20 no-print relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-accent hover:text-primary transition-all hover:translate-x-[-4px] mb-12"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>

          <div className="max-w-4xl mx-auto">
            <div className="mb-16">
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Personal Collection</span>
              <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tighter leading-none">
                My <span className="italic font-light text-accent">Acquisitions.</span>
              </h1>
            </div>

            {loading ? (
              <PremiumLoader />
            ) : orders.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-[3.5rem] border border-accent/5 shadow-sm">
                <Package className="w-20 h-20 mx-auto text-accent/10 mb-8" />
                <h2 className="font-heading text-3xl font-bold tracking-tighter mb-4">Registry is empty</h2>
                <p className="text-primary/40 mb-10 max-w-sm mx-auto font-medium italic">
                  Your archival history contains no active volumes. Discover your first piece today.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center h-16 px-12 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-full shadow-2xl hover:bg-black hover:scale-105 transition-all"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-12 sm:space-y-12">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    id={`order-card-${order.id}`}
                    className="order-card-item bg-white border border-accent/5 rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group scroll-mt-32"
                  >
                    {/* Order Header - Acting as Trigger */}
                    <div
                      className="bg-accent/[0.02] px-8 sm:px-12 py-8 flex flex-wrap items-center justify-between gap-6 cursor-pointer hover:bg-accent/[0.04] transition-colors"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 bg-white rounded-2xl border border-accent/5 flex items-center justify-center shadow-inner transition-all duration-500 ${expandedOrders.has(order.id) ? 'rotate-12 bg-accent/5 border-accent/20' : ''}`}>
                          <Package className={`w-6 h-6 ${expandedOrders.has(order.id) ? 'text-accent' : 'text-primary/20'}`} />
                        </div>
                        <div>
                          <h3 className="font-sans font-black text-xl sm:text-2xl tracking-tighter text-primary/40">
                            Entry <span className="italic font-light text-accent">#{order.id.slice(0, 8).toUpperCase()}</span>
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/30 italic">
                              <Calendar className="w-3.5 h-3.5 text-accent/40" />
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-accent/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent italic">
                              {orderItems[order.id]?.length || 0} Artifact{orderItems[order.id]?.length === 1 ? '' : 's'} Recognized
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
                        <div className="hidden sm:flex flex-col items-end mr-4">
                          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-primary/20 mb-1">Total Valuation</span>
                          <Price amount={Number(order.total_amount)} className="text-xl font-black tracking-tighter text-primary" />
                        </div>

                        <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(order.status)} border`}>
                          {order.status}
                        </div>

                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-accent/5 focus:ring-0 focus-visible:ring-0 outline-none focus:outline-none group">
                                <MoreVertical className="h-5 w-5 text-accent/40 group-hover:text-accent transition-colors" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-accent/5 bg-white shadow-2xl p-2 min-w-[200px]">
                              {(order.status === 'pending' || order.status === 'processing') && (
                                <DropdownMenuItem
                                  onClick={() => setOrderToCancel(order.id)}
                                  className="text-rose-500 font-black uppercase tracking-[0.2em] text-[9px] focus:text-rose-600 focus:bg-rose-50 cursor-pointer rounded-xl h-12 px-4 mb-1"
                                >
                                  <XCircle className="w-4 h-4 mr-3" />
                                  Terminate Registry
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handlePrintInvoice(order.id)}
                                className="font-black uppercase tracking-[0.2em] text-[9px] text-primary/70 focus:text-white cursor-pointer rounded-xl h-12 px-4"
                              >
                                <Printer className="w-4 h-4 mr-3" />
                                Generate Receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <div onClick={() => toggleOrderExpansion(order.id)} className={`w-8 h-8 rounded-full border border-accent/5 flex items-center justify-center transition-transform duration-500 ${expandedOrders.has(order.id) ? 'rotate-180 bg-accent/5' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="m6 9 6 6 6-6" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    <div className={`transition-all duration-700 ease-in-out overflow-hidden ${expandedOrders.has(order.id) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="p-8 sm:p-12 space-y-16 border-t border-accent/5">
                        {/* Products Section - Full Width Manifest */}
                        <div className="space-y-8">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-10 flex items-center gap-4">
                            <span className="w-10 h-px bg-accent/20" /> Artifact Manifest
                          </h4>
                          <div className="space-y-8">
                            {orderItems[order.id]?.map((item) => (
                              <div key={item.id} className="flex gap-6 sm:gap-10 group/item">
                                <div className="relative w-24 h-32 sm:w-28 sm:h-36 flex-shrink-0">
                                  <div className="w-full h-full bg-accent/5 rounded-[1.5rem] border border-accent/5 overflow-hidden shadow-sm">
                                    <img
                                      src={
                                        (Array.isArray(item.products) ? item.products[0]?.image_url : item.products?.image_url) ||
                                        (Array.isArray(item.products) ? item.products[0]?.images?.[0] : item.products?.images?.[0]) ||
                                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'
                                      }
                                      alt={Array.isArray(item.products) ? item.products[0]?.name : item.products?.name}
                                      className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-1000"
                                    />
                                  </div>
                                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-black/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-2xl z-20 border border-white/10">
                                    {item.quantity}
                                  </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                  <h5 className="font-heading font-black text-xl sm:text-2xl leading-none mb-3 tracking-tighter truncate text-primary/90">
                                    {Array.isArray(item.products) ? item.products[0]?.name : item.products?.name}
                                  </h5>
                                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                                    {item.size && (
                                      <span className="text-[9px] font-black uppercase tracking-widest text-accent italic">Dim: {item.size}</span>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-accent/20" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/30 font-medium">Registry Value</span>
                                    <Price amount={item.price / item.quantity} className="text-sm font-bold tracking-tight text-primary/40" />
                                  </div>
                                </div>
                                <div className="text-right flex flex-col justify-center">
                                  <Price amount={Number(item.price)} className="font-sans font-black text-xl sm:text-2xl tracking-tighter text-primary" />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tracking Info if available */}
                          {order.tracking_number && order.status === 'shipped' && (
                            <div className="mt-12 p-8 bg-[#FFFAF5] rounded-[2.5rem] border border-accent/10 flex flex-wrap items-center gap-8 shadow-inner relative overflow-hidden group/trace">
                              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover/trace:scale-125 transition-transform duration-1000">
                                <Truck className="w-32 h-32 text-accent" />
                              </div>
                              <div className="flex-1 relative z-10">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-3 block italic">Logistics Reference</span>
                                <p className="font-heading text-xl font-bold tracking-tighter mb-1.5 gray-800">Artifact In Transit</p>
                                <p className="text-[10px] text-primary/30 font-mono tracking-widest font-bold">ARC-REF: {order.tracking_number}</p>
                              </div>
                              <Button
                                variant="outline"
                                className="h-14 px-8 rounded-full border-accent/10 bg-white shadow-lg hover:bg-black hover:text-white transition-all text-[9px] font-black uppercase tracking-widest gap-3 relative z-10"
                                onClick={() => window.open(order.tracking_url || `https://www.google.com/search?q=track+package+${order.tracking_number}`, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Trace Logistics
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Info Sections - Balanced Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 pt-16 border-t border-accent/5">
                          {/* Shipping Info */}
                          <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-accent/5 shadow-sm group/card hover:shadow-xl transition-all duration-700">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-accent" />
                              </div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Consignee Site</h4>
                            </div>
                            {order.shipping_address ? (
                              <div className="space-y-5">
                                <p className="font-heading text-xl sm:text-2xl font-black text-primary/90 leading-tight">{order.shipping_name || userName || user?.email}</p>
                                <div className="space-y-1.5">
                                  <p className="text-[10px] font-bold text-primary/30 underline italic break-all">{user?.email}</p>
                                  {userPhone && <p className="text-[10px] font-black text-accent tracking-[0.2em]">{userPhone}</p>}
                                </div>
                                <div className="pt-6 border-t border-accent/5">
                                  <p className="text-base font-medium italic text-primary/60 leading-relaxed">
                                    {order.shipping_address}
                                  </p>
                                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/20 mt-2.5">
                                    {order.shipping_city}{order.shipping_postal_code ? ` — ${order.shipping_postal_code}` : ''}
                                  </p>
                                  {order.shipping_country && (
                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/20">{order.shipping_country}</p>
                                  )}
                                </div>
                                {order.shipping_phone && (
                                  <div className="pt-5 border-t border-accent/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent mb-1 block italic opacity-50 font-medium">Logistics Contact Reference</span>
                                    <p className="text-sm font-bold tracking-tight text-primary/70">{order.shipping_phone}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-primary/20 italic ml-2">No site data recorded.</p>
                            )}
                          </div>

                          {/* Payment Summary */}
                          <div className="bg-[#111] text-white p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group/total">
                            <div className="absolute -bottom-16 -right-16 opacity-[0.03] rotate-12 pointer-events-none group-hover/total:rotate-45 transition-transform duration-[2s]">
                              <CreditCard className="w-64 h-64" />
                            </div>
                            <div className="flex items-center gap-4 mb-8 relative z-10">
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <CreditCard className="w-5 h-5 text-white/30" />
                              </div>
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Valuation Ledger</h4>
                            </div>
                            <div className="space-y-5 relative z-10">
                              {(() => {
                                const items = orderItems[order.id] || [];
                                const calculatedGross = items.length > 0
                                  ? items.reduce((sum, item) => sum + Number(item.price), 0)
                                  : (Number(order.total_amount) - Number(order.shipping_fee || 0) + Number(order.discount_amount || 0)) / 1.08;

                                const calculatedTax = calculatedGross * 0.08;
                                const calculatedShipping = Number(order.shipping_fee || 0);

                                return (
                                  <>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Gross Value</span>
                                      <Price amount={calculatedGross} className="text-base font-bold text-white/90" />
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{order.shipping_method_name || 'Standard Logistics'}</span>
                                      <Price amount={calculatedShipping} className="text-base font-bold text-white/90" />
                                    </div>
                                    <div className="flex justify-between items-center text-accent">
                                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Incentive {order.coupons?.code ? `(${order.coupons.code})` : 'Applied'}</span>
                                      <div className="flex items-center text-base font-bold">-<Price amount={Number(order.discount_amount || 0)} /></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Administrative (8%)</span>
                                      <Price amount={calculatedTax} className="text-base font-bold text-white/90" />
                                    </div>
                                    <div className="py-4">
                                      <div className="w-full h-px bg-white/5" />
                                    </div>
                                    <div className="flex justify-between items-end">
                                      <div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 block mb-1.5">Final Settlement</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent italic opacity-80">Authenticated</span>
                                      </div>
                                      <span className="font-sans font-black text-2xl tracking-tighter leading-none text-white">
                                        <Price amount={Number(order.total_amount)} />
                                      </span>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Modern Professional Invoice (Only visible during printing) */}
      {invoiceOrder && (
        <div id="invoice-print-area" className="hidden print:block p-16 bg-[#FFFAF5] text-primary min-h-screen relative overflow-hidden">
          {/* Authenticity Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-15deg] pointer-events-none">
            <h1 className="font-heading text-[20rem] font-black leading-none">MAISON</h1>
          </div>

          <header className="flex justify-between items-start border-b border-accent/10 pb-12 mb-12 relative z-10">
            <div>
              <h1 className="font-heading text-6xl font-black tracking-tighter text-primary mb-2">MAISON<span className="italic font-light text-accent">.</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Archival Fine Goods Atelier</p>
            </div>
            <div className="text-right">
              <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-accent mb-6">Acquisition Receipt</h2>
              <div className="space-y-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                <p>Registry ID: <span className="text-primary">#{invoiceOrder.id.slice(0, 8).toUpperCase()}</span></p>
                <p>Dated: <span className="text-primary">{new Date(invoiceOrder.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span></p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-20 mb-16 relative z-10">
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-accent/20" /> Consignee
              </h3>
              <div className="ml-11">
                <p className="font-heading text-2xl font-black text-primary mb-2">{invoiceOrder.shipping_name || userName || user?.email || "Anonymous Collector"}</p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 space-y-1">
                  <p className="italic underline">{user?.email}</p>
                  {userPhone && <p>{userPhone}</p>}
                </div>
                <div className="mt-6 text-sm font-medium italic text-primary/70 leading-relaxed max-w-xs">
                  {invoiceOrder.shipping_address || "Atelier Collection Point"}<br />
                  {invoiceOrder.shipping_city}{invoiceOrder.shipping_postal_code ? `, ${invoiceOrder.shipping_postal_code}` : ''}<br />
                  {invoiceOrder.shipping_country || "Global Distribution"}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-accent/20" /> Registry Parameters
              </h3>
              <div className="ml-11 grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary/30">Registry Status</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent italic">{invoiceOrder.status}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary/30">Valuation Reference</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">USD (Credit)</p>
                </div>
                {invoiceOrder.tracking_number && (
                  <div className="col-span-2 pt-2 border-t border-accent/5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-1">Logistics Reference</p>
                    <p className="font-mono text-[10px] font-bold text-primary bg-accent/5 px-3 py-1.5 rounded inline-block">
                      {invoiceOrder.tracking_number}
                      {invoiceOrder.tracking_url && " (Linked)"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-accent mb-8 flex items-center gap-3">
              <span className="w-8 h-px bg-accent/20" /> Artifact Manifest
            </h3>
            <table className="w-full mb-16 border-collapse">
              <thead>
                <tr className="border-b border-accent/10">
                  <th className="text-left py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-16">Item</th>
                  <th className="text-left py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 px-6">Archival Designation</th>
                  <th className="text-center py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-24">Dim.</th>
                  <th className="text-center py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-24">Qty</th>
                  <th className="text-right py-6 text-[8px] font-black uppercase tracking-[0.4em] text-primary/30 w-32">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/5">
                {invoiceItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-8">
                      <div className="w-12 h-16 bg-white rounded border border-accent/5 overflow-hidden">
                        <img
                          src={
                            (Array.isArray(item.products) ? item.products[0]?.image_url : item.products?.image_url) ||
                            (Array.isArray(item.products) ? item.products[0]?.images?.[0] : item.products?.images?.[0]) ||
                            'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'
                          }
                          alt={Array.isArray(item.products) ? item.products[0]?.name : item.products?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-8 px-6 text-left">
                      <p className="font-heading text-lg font-bold tracking-tight text-primary leading-tight">{Array.isArray(item.products) ? item.products[0]?.name : item.products?.name}</p>
                      <p className="text-[8px] text-primary/30 mt-2 font-black uppercase tracking-widest">Entry UID: {item.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-primary/60">{item.size || "STD"}</td>
                    <td className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-primary/60">{item.quantity}</td>
                    <td className="text-right py-8 font-sans text-lg font-bold text-primary">
                      <Price amount={Number(item.price)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-24 relative z-10">
            <div className="w-72 space-y-4">
              {(() => {
                const calculatedGross = invoiceItems.length > 0
                  ? invoiceItems.reduce((sum, item) => sum + Number(item.price), 0)
                  : (Number(invoiceOrder.total_amount) - Number(invoiceOrder.shipping_fee || 0) + Number(invoiceOrder.discount_amount || 0)) / 1.08;

                const calculatedTax = calculatedGross * 0.08;
                const calculatedShipping = Number(invoiceOrder.shipping_fee || 0);

                return (
                  <>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40">
                      <span>Gross Valuation</span>
                      <Price amount={calculatedGross} className="text-primary" />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40">
                      <span>Logistics ({invoiceOrder.shipping_method_name || 'Standard'})</span>
                      <Price amount={calculatedShipping} className="text-primary" />
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-accent">
                      <span>Incentive {invoiceOrder.coupons?.code ? `(${invoiceOrder.coupons.code})` : 'Applied'}</span>
                      <span className="text-accent flex gap-1 justify-end">-<Price amount={Number(invoiceOrder.discount_amount || 0)} /></span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40 pb-4 border-b border-accent/10">
                      <span>Fiscal Duty (8%)</span>
                      <Price amount={calculatedTax} className="text-primary" />
                    </div>
                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] text-accent">Net Total</span>
                      <Price amount={Number(invoiceOrder.total_amount)} className="font-sans text-4xl font-black text-primary" />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <footer className="mt-auto pt-16 border-t border-accent/10 flex justify-between items-end relative z-10">
            <div className="max-w-xs">
              <p className="font-heading text-sm font-bold text-accent italic mb-2">Authenticated by Maison Atelier Management.</p>
              <p className="text-[8px] text-primary/30 font-black uppercase tracking-[0.3em] leading-relaxed">This registry receipt serves as the official archival record of transfer for the artifacts listed above.</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mb-4 border border-accent/10">
                <span className="font-sans text-[10px] font-black text-accent italic">V1.0</span>
              </div>
              <p className="text-[7px] font-black uppercase tracking-[0.5em] text-primary/20">© MMXXV MAISON ATELIER</p>
            </div>
          </footer>
        </div>
      )}

      <AlertDialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <AlertDialogContent className="!rounded-[4rem] border-accent/10 bg-[#FFFAF5] p-10 max-w-md shadow-[0_30px_100px_rgba(0,0,0,0.15)] backdrop-blur-3xl overflow-hidden border">
          <AlertDialogHeader className="space-y-6">
            <AlertDialogTitle className="font-heading text-4xl font-bold text-center tracking-tighter pt-4">
              Terminate <span className="italic font-light text-accent">Acquisition?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-primary/50 text-center italic font-medium text-lg leading-relaxed">
              This action will permanently invalidate this entry within the archive and initiate the settlement reversal protocols.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-4 mt-12 sm:justify-center">
            <AlertDialogCancel className="h-14 sm:w-1/2 rounded-full border-accent/10 font-black uppercase tracking-widest text-[9px] hover:bg-accent/5 transition-all">
              Retain Record
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToCancel) {
                  handleCancelOrder(orderToCancel);
                  setOrderToCancel(null);
                }
              }}
              className="h-14 sm:w-1/2 rounded-full bg-rose-600 text-white font-black uppercase tracking-widest text-[9px] shadow-xl hover:bg-rose-700 transition-all border-none"
            >
              Confirm Termination
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Orders;