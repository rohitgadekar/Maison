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
    }, 100);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*, products(name, image_url)')
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
    // If changing to shipped, require tracking number
    if (newStatus === 'shipped') {
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
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'processing':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
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
                          <SelectTrigger className="w-[160px] h-11 rounded-xl border-accent/5 bg-accent/5 font-black uppercase tracking-widest text-[8px] focus:ring-accent">
                            <SelectValue>
                              <span className={`px-3 py-1.5 rounded-lg  ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-accent/5 bg-white shadow-2xl">
                            <SelectItem value="pending" className="text-[10px] font-black uppercase tracking-widest">Pending</SelectItem>
                            <SelectItem value="processing" className="text-[10px] font-black uppercase tracking-widest">Processing</SelectItem>
                            <SelectItem value="shipped" className="text-[10px] font-black uppercase tracking-widest">Shipped</SelectItem>
                            <SelectItem value="delivered" className="text-[10px] font-black uppercase tracking-widest">Delivered</SelectItem>
                            <SelectItem value="cancelled" className="text-[10px] font-black uppercase tracking-widest text-rose-500">Cancelled</SelectItem>
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
                  Injected a unique logistics reference is mandatory to evolve this acquisition to the "Shipped" state.
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

      {/* Modern Professional Invoice (Only visible during printing) */}
      {invoiceOrder && selectedOrder && (
        <div id="invoice-print-area" className="hidden print:block p-16 bg-[#FFFAF5] text-primary min-h-screen relative overflow-hidden">
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
                <p className="font-heading text-2xl font-black text-primary mb-2">{invoiceOrder.shipping_name || customerProfile?.full_name || "Anonymous Collector"}</p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary/40 space-y-1">
                  <p className="italic underline">{customerProfile?.email}</p>
                  {customerProfile?.phone && <p>{customerProfile.phone}</p>}
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
                    <p className="font-mono text-[10px] font-bold text-primary bg-accent/5 px-3 py-1.5 rounded inline-block">{invoiceOrder.tracking_number}</p>
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
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-8">
                      <div className="w-12 h-16 bg-white rounded border border-accent/5 overflow-hidden">
                        <img
                          src={item.products.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=750&fit=crop'}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-8 px-6 text-left">
                      <p className="font-heading text-lg font-bold tracking-tight text-primary leading-tight">{item.products.name}</p>
                      <p className="text-[8px] text-primary/30 mt-2 font-black uppercase tracking-widest">Entry UID: {item.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-primary/60">{item.size || "STD"}</td>
                    <td className="text-center py-8 text-[10px] font-black uppercase tracking-widest text-primary/60">{item.quantity}</td>
                    <td className="text-right py-8 font-heading text-lg font-bold text-primary">${Number(item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-24 relative z-10">
            <div className="w-72 space-y-4">
              {(() => {
                const items = orderItems.length > 0 ? orderItems : [];
                const shipping = Number(invoiceOrder.shipping_fee || 0);
                const discount = Number(invoiceOrder.discount_amount || 0);

                let gross = items.length > 0
                  ? items.reduce((sum, item) => sum + Number(item.price), 0)
                  : 0;

                if (gross === 0 && Number(invoiceOrder.total_amount) > 0) {
                  gross = (Number(invoiceOrder.total_amount) - shipping + discount) / 1.08;
                }

                const { tax, total, gross: calculatedGross } = calculateOrderTotals(gross, shipping, discount);

                return (
                  <>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40">
                      <span>Gross Valuation</span>
                      <span className="text-primary">${calculatedGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40">
                      <span>Logistics ({invoiceOrder.shipping_method_name || 'Standard'})</span>
                      <span className="text-primary">${shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-accent">
                      <span>Incentive {invoiceOrder.coupons?.code ? `(${invoiceOrder.coupons.code})` : 'Applied'}</span>
                      <span>-${discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/40 pb-4 border-b border-accent/10">
                      <span>Fiscal Duty (8%)</span>
                      <span className="text-primary">${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] text-accent">Net Total</span>
                      <span className="text-4xl font-black text-primary">${Number(invoiceOrder.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                <span className="font-heading text-[10px] font-black text-accent italic">V1.0</span>
              </div>
              <p className="text-[7px] font-black uppercase tracking-[0.5em] text-primary/20">© MMXXV MAISON ATELIER ADMIN</p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;