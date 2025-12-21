import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Truck, Printer, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PremiumLoader } from '@/components/PremiumLoader';
import { calculateOrderTotals } from '@/lib/calculations';
import { Invoice } from '@/components/Invoice';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  shipping_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipping_method_name: string | null;
  shipping_fee: number | null;
  coupon_id: string | null;
  discount_amount: number | null;
  coupons?: { code: string } | null;
  created_at: string;
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

interface Profile {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerProfile, setCustomerProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: string; status: OrderStatus } | null>(null);
  const [printingOrder, setPrintingOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, coupons(code)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    setOrders((data as any) || []);
    setFilteredOrders((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order =>
      order.id.toLowerCase().includes(query) ||
      order.user_id.toLowerCase().includes(query)
    );
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePrintInvoice = (orderId: string) => {
    setPrintingOrder(orderId);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*, products(name, image_url, images)')
      .eq('order_id', order.id);

    setOrderItems(items || []);

    // Fetch customer profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('user_id', order.user_id)
      .single();

    setCustomerProfile(profile);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    // If changing to shipped or delivered, require tracking number
    if (newStatus === 'shipped' || newStatus === 'delivered') {
      const order = orders.find(o => o.id === orderId);
      if (!order?.tracking_number) {
        setPendingStatusChange({ orderId, status: newStatus });
        setTrackingNumber('');
        setTrackingUrl('');
        setIsTrackingDialogOpen(true);
        return;
      }
    }

    await updateOrderStatus(orderId, newStatus);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, tracking?: string, url?: string) => {
    const updateData: { status: OrderStatus; tracking_number?: string; tracking_url?: string } = { status: newStatus };
    if (tracking) {
      updateData.tracking_number = tracking;
    }
    if (url) {
      updateData.tracking_url = url;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update acquisition status');
      return;
    }

    toast.success('Acquisition Registry updated');
    fetchOrders();

    if (selectedOrder?.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus,
        tracking_number: tracking || selectedOrder.tracking_number,
        tracking_url: url || selectedOrder.tracking_url
      });
    }
  };

  const handleTrackingSubmit = async () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking reference');
      return;
    }

    if (pendingStatusChange) {
      await updateOrderStatus(pendingStatusChange.orderId, pendingStatusChange.status, trackingNumber, trackingUrl);
      setIsTrackingDialogOpen(false);
      setPendingStatusChange(null);
      setTrackingNumber('');
      setTrackingUrl('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 shadow-[0_4px_12px_-2px_rgba(245,158,11,0.15)]';
      case 'processing':
        return 'bg-blue-500/10 text-blue-600 shadow-[0_4px_12px_-2px_rgba(59,130,246,0.15)]';
      case 'shipped':
        return 'bg-indigo-500/10 text-indigo-600 shadow-[0_4px_12px_-2px_rgba(99,102,241,0.15)]';
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.15)]';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-600 shadow-[0_4px_12px_-2px_rgba(244,63,94,0.15)]';
      default:
        return 'bg-gray-500/10 text-gray-600 shadow-[0_4px_12px_-2px_rgba(107,114,128,0.15)]';
    }
  };

  if (loading) {
    return <PremiumLoader message="Accessing Order Registry..." />;
  }

  const invoiceOrder = orders.find(o => o.id === printingOrder);
  const activeInvoiceItems = orderItems; // Since we fetch on-demand for selectedOrder, we need to handle this carefully for printing.
  // Actually, for printing in Admin, we should probably use the orderItems from the currently open dialog if that's what we're printing, or fetch again.
  // To keep it consistent with the user view, I'll allow printing from the dialog.

  return (
    <div className="lg:p-8">
      <div className="no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16">
          <div className="space-y-4">
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] block italic">Acquisition Logs</span>
            <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter">Order <span className="italic font-light text-accent">Registry.</span></h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 flex-1 lg:max-w-2xl">
            <div className="relative flex-1 group">
              <input
                type="text"
                placeholder="Search by Order ID or Member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-white border border-accent/5 rounded-2xl px-12 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm outline-none"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              </div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-accent/20">
            <p className="font-heading text-2xl text-primary/30 italic">No acquisitions recorded in the registry yet.</p>
          </div>
        ) : (
          <div className="bg-white border border-accent/5 rounded-[3rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent/5">
                    <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Acquisition ID</th>
                    <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Timestamp</th>
                    <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Registry Status</th>
                    <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Logistics Ref</th>
                    <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Valuation</th>
                    <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-accent/5 transition-colors group">
                      <td className="px-10 py-8">
                        <span className="uppercase text-lg font-black tracking-tighter text-primary">#{order.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xs font-medium italic text-primary/60">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-[180px] h-12 rounded-2xl border-none px-5 font-black uppercase tracking-[.2em] text-[9px] transition-all duration-500 focus:ring-0 ring-0 focus:ring-accent/20",
                              getStatusColor(order.status)
                            )}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-[2rem] border-accent/10 bg-white/95 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] p-2 min-w-[200px]">
                            <SelectItem value="pending" className="rounded-xl pl-8 pr-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 focus:bg-amber-50 focus:text-amber-600 transition-colors">Pending Access</SelectItem>
                            <SelectItem value="processing" className="rounded-xl pl-8 pr-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 focus:bg-blue-50 focus:text-blue-600 transition-colors">Processing Ritual</SelectItem>
                            <SelectItem value="shipped" className="rounded-xl pl-8 pr-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 focus:bg-indigo-50 focus:text-indigo-600 transition-colors">Shipped Archive</SelectItem>
                            <SelectItem value="delivered" className="rounded-xl pl-8 pr-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 focus:bg-emerald-50 focus:text-emerald-600 transition-colors">Delivered Vault</SelectItem>
                            <SelectItem value="cancelled" className="rounded-xl pl-8 pr-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 focus:text-rose-600 focus:bg-rose-50 transition-colors">Dissolved Entry</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-10 py-8">
                        {order.tracking_number ? (
                          <span className="uppercase text-sm font-black tracking-widest bg-primary text-white px-4 py-2 rounded-xl">
                            {order.tracking_number}
                          </span>
                        ) : order.status === 'cancelled' ? (
                          <span className="text-primary/20 italic text-[10px] font-black uppercase tracking-widest">N/A</span>
                        ) : (
                          <span className="text-primary/20 italic text-xs">Awaiting Logistics</span>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        <span className="text-xl font-bold tracking-tighter text-primary">${Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-10 py-8">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          className="rounded-full border-accent/10 hover:bg-black hover:text-white transition-all text-[9px] font-black uppercase tracking-widest gap-2 px-6 h-10"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Observe
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl border-accent/10 bg-[#FFFAF5]/95 backdrop-blur-2xl p-0 shadow-2xl overflow-hidden rounded-[2rem]">
            <div className="p-6 sm:p-12">
              <DialogHeader className="mb-8 sm:mb-12 border-b border-accent/5 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Detailed Registry Exit</span>
                  <DialogTitle className="font-heading text-3xl sm:text-4xl font-black tracking-tighter text-primary">
                    Acquisition <span className="italic font-light text-accent ">#{selectedOrder?.id.slice(0, 8)}</span>
                  </DialogTitle>
                </div>
                <Button
                  onClick={() => selectedOrder && handlePrintInvoice(selectedOrder.id)}
                  variant="outline"
                  className="rounded-full border-accent/10 hover:bg-black hover:text-white transition-all text-[9px] font-black uppercase tracking-widest gap-2 px-6 h-12"
                >
                  <Printer className="w-4 h-4" />
                  Print Registry Receipt
                </Button>
              </DialogHeader>

              {selectedOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  {/* Left Column: Customer & Shipping */}
                  <div className="space-y-8 sm:space-y-12">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 mb-4 sm:mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-accent/20" /> Member Identity
                      </h4>
                      <div className="space-y-2 ml-4 sm:ml-11">
                        <p className="font-heading text-xl sm:text-2xl font-black text-primary">{customerProfile?.full_name || 'Anonymous Collector'}</p>
                        <p className="text-sm font-medium italic text-primary/50 underline break-all">{customerProfile?.email || 'N/A'}</p>
                        {customerProfile?.phone && (
                          <p className="text-xs font-black tracking-widest text-accent mt-2">{customerProfile.phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 mb-4 sm:mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-accent/20" /> Logistics Destination
                      </h4>
                      <div className="space-y-2 ml-4 sm:ml-11">
                        <div className="space-y-4">
                          <p className="font-heading text-xl font-black">{selectedOrder.shipping_name || customerProfile?.full_name || 'Anonymous Collector'}</p>
                          <p className="font-heading text-lg font-black">{selectedOrder.shipping_address}</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
                            {selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code} — {selectedOrder.shipping_country}
                          </p>
                          {selectedOrder.shipping_phone && (
                            <div className="pt-4 border-t border-accent/10">
                              <span className="text-[10px] font-black uppercase tracking-widest text-accent mb-1 block">Logistics Contact</span>
                              <p className="text-sm font-bold tracking-tight">{selectedOrder.shipping_phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 mb-4 sm:mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-accent/20" /> Registry Parameters
                      </h4>
                      <div className="ml-4 sm:ml-11 flex flex-wrap gap-3 sm:gap-4">
                        <div className={`px-4 sm:px-6 py-2 rounded-full border text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </div>
                        {selectedOrder.tracking_number && (
                          <div className="bg-primary text-white px-4 sm:px-6 py-2 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Truck className="w-3 h-3" />
                            {selectedOrder.tracking_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Items & Total */}
                  <div className="bg-white/40 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 border border-accent/5 backdrop-blur-sm self-start">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 mb-6 sm:mb-8 flex items-center gap-3">
                      <span className="w-8 h-px bg-accent/20" /> Artifact Manifest
                    </h4>
                    {/* Scrollable Items list */}
                    <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10 max-h-[200px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 group">
                          <div className="w-12 sm:w-16 h-16 sm:h-20 bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-accent/5 flex-shrink-0">
                            <img
                              src={item.products.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'}
                              alt={item.products.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-1 flex justify-between items-center min-w-0">
                            <div className="min-w-0">
                              <p className="font-heading text-base sm:text-lg font-bold tracking-tight text-primary leading-tight mb-1 truncate">{item.products.name}</p>
                              <div className="flex items-center gap-2">
                                {item.size && (
                                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-accent italic">Dim: {item.size}</span>
                                )}
                                <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-primary/30">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs sm:text-sm font-black text-primary/40">${Number(item.price).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 mt-4 border-t border-accent/10">
                      <div className="space-y-3 mb-6 bg-accent/5 p-4 rounded-[1.5rem]">
                        {(() => {
                          const items = orderItems.length > 0 ? orderItems : [];
                          const shipping = Number(selectedOrder.shipping_fee || 0);
                          const discount = Number(selectedOrder.discount_amount || 0);

                          let gross = items.length > 0
                            ? items.reduce((sum, item) => sum + Number(item.price), 0)
                            : 0;

                          if (gross === 0 && Number(selectedOrder.total_amount) > 0) {
                            gross = (Number(selectedOrder.total_amount) - shipping + discount) / 1.08;
                          }

                          const { tax, total, gross: calculatedGross } = calculateOrderTotals(gross, shipping, discount);

                          return (
                            <Accordion type="single" collapsible className="w-full border-none">
                              <AccordionItem value="breakdown" className="border-none">
                                <AccordionTrigger className="py-0 hover:no-underline [&>svg]:w-3 [&>svg]:h-3 [&>svg]:text-primary/30">
                                  <div className="flex justify-between items-center w-full pr-4">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">View Breakdown</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 pb-0 space-y-3">
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary/40">
                                    <span>Gross Value</span>
                                    <span>${calculatedGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary/40">
                                    <span>Logistics ({selectedOrder.shipping_method_name || 'Standard'})</span>
                                    <span>${shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary/40">
                                    <span>Incentive {selectedOrder.coupons?.code ? `(${selectedOrder.coupons.code})` : 'Applied'}</span>
                                    <span>-${discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary/40">
                                    <span>Fiscal Duty (8%)</span>
                                    <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          );
                        })()}
                      </div>

                      <div className="flex items-end justify-between px-2">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/30 mb-1 italic">Final Settlement</p>
                          <p className="text-3xl font-black tracking-tighter text-primary">
                            ${Number(selectedOrder.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center -mb-1">
                          <span className="font-heading text-[10px] font-black italic">MAI</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Tracking Number Dialog */}
        <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
          <DialogContent className="max-w-md rounded-[2rem] sm:rounded-[2rem] border-accent/10 bg-white p-0 overflow-y-auto max-h-[90vh] shadow-2xl">
            <div className="p-8 sm:p-12">
              <DialogHeader className="mb-8">
                <DialogTitle className="font-heading text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-4">
                  <Truck className="w-8 h-8 text-accent" />
                  Logistics Entry
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-8">
                <p className="text-sm font-medium italic text-primary/50 leading-relaxed">
                  Injecting a unique logistics reference is mandatory to evolve this acquisition to a terminal status (Shipped or Delivered).
                </p>

                <div className="space-y-3">
                  <Label htmlFor="tracking" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Logistics Reference Number</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. MS-ARC-102938475"
                    className="h-16 rounded-2xl border-accent/10 bg-accent/5 shadow-inner focus:bg-white transition-all font-mono text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="trackingUrl" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Logistics Tracking URL (Optional)</Label>
                  <Input
                    id="trackingUrl"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://track.mhl.com/package/..."
                    className="h-16 rounded-2xl border-accent/10 bg-accent/5 shadow-inner focus:bg-white transition-all font-mono text-sm"
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <Button onClick={handleTrackingSubmit} className="h-16 rounded-2xl bg-primary text-white hover:bg-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Commit & Evolve Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsTrackingDialogOpen(false);
                      setPendingStatusChange(null);
                      setTrackingNumber('');
                    }}
                    className="h-16 rounded-2xl border-accent/10 text-[10px] font-black uppercase tracking-widest"
                  >
                    Dissolve
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Archival Documentation Synthesis (Rendered via Portal) */}
      {invoiceOrder && (
        <Invoice
          order={invoiceOrder as any}
          items={orderItems as any}
          customer={{
            name: customerProfile?.full_name || invoiceOrder.shipping_name,
            email: customerProfile?.email || null,
            phone: customerProfile?.phone || invoiceOrder.shipping_phone
          }}
        />
      )}
    </div>
  );
};

export default AdminOrders;