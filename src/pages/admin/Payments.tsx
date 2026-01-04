import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    CreditCard,
    Search,
    ExternalLink,
    ArrowRight,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    X,
    TrendingUp,
    AlertCircle,
    DollarSign,
    Wallet,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Price } from '@/components/Price';
import { toast } from 'sonner';
import { PremiumLoader } from '@/components/PremiumLoader';
import { useCurrency } from '@/context/CurrencyContext';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';

interface Payment {
    id: string;
    order_id: string;
    user_id: string;
    transaction_id: string;
    payment_method: string;
    amount: number;
    currency: string;
    status: string;
    rzp_payment_id: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
    is_virtual?: boolean;
}

const Payments = () => {
    const { storeCurrency } = useCurrency();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
    const [paymentToRefund, setPaymentToRefund] = useState<Payment | null>(null);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            // 1. Fetch real payments
            const { data: rawPayments, error: payError } = await (supabase as any)
                .from('payments')
                .select('*')
                .order('created_at', { ascending: false });

            if (payError) throw payError;

            // 2. Fetch POD orders (fallback for missing payment records due to RLS/errors)
            const { data: podOrders, error: orderError } = await (supabase as any)
                .from('orders')
                .select('*')
                .ilike('shipping_method_name', '%POD%')
                .order('created_at', { ascending: false });

            if (orderError) console.error('Error fetching POD orders:', orderError);

            // 3. Merge Strategies
            const existingPaymentOrderIds = new Set((rawPayments || []).map((p: any) => p.order_id));
            const virtualPayments = (podOrders || [])
                .filter((order: any) => !existingPaymentOrderIds.has(order.id))
                .map((order: any) => ({
                    id: `virt-${order.id}`, // Virtual ID
                    order_id: order.id,
                    user_id: order.user_id,
                    transaction_id: `POD-${order.id.slice(0, 8)}`, // Fallback TX ID
                    payment_method: 'Pay on Delivery (Manual)',
                    amount: order.total_amount,
                    currency: storeCurrency,
                    status: order.status === 'cancelled' ? 'failed' : 'pending',
                    rzp_payment_id: 'N/A', // Placeholder
                    created_at: order.created_at,
                    is_virtual: true
                }));

            const allPayments = [...(rawPayments || []), ...virtualPayments]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            if (allPayments.length === 0) {
                setPayments([]);
                setLoading(false);
                return;
            }

            const userIds = [...new Set(allPayments.map((p: any) => String(p.user_id)).filter(Boolean))];
            const { data: rawProfiles } = await (supabase as any)
                .from('profiles')
                .select('user_id, full_name, email')
                .in('user_id', userIds);

            const profileMap = (rawProfiles || []).reduce((acc: any, profile: any) => {
                acc[profile.user_id] = profile;
                return acc;
            }, {});

            const enrichedPayments = allPayments.map((payment: any) => ({
                ...payment,
                profiles: profileMap[payment.user_id] || null
            }));

            setPayments(enrichedPayments);
        } catch (err) {
            console.error('Error fetching payments:', err);
            toast.error('Failed to load transaction registry');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleStatusUpdate = async (payment: Payment, newStatus: string) => {
        try {
            if (payment.is_virtual) {
                // Determine 'rzp_payment_id' for NOT NULL constraint - use transaction_id
                const rzpId = payment.transaction_id;

                // Create real payment record
                const { error } = await (supabase as any)
                    .from('payments')
                    .insert({
                        order_id: payment.order_id,
                        user_id: payment.user_id,
                        amount: payment.amount,
                        currency: payment.currency,
                        status: newStatus,
                        payment_method: 'Pay on Delivery',
                        transaction_id: payment.transaction_id,
                        rzp_payment_id: rzpId,
                        created_at: new Date().toISOString()
                    });

                if (error) throw error;
            } else {
                // Update existing record
                const { error } = await (supabase as any)
                    .from('payments')
                    .update({ status: newStatus })
                    .eq('id', payment.id);

                if (error) throw error;
            }

            toast.success(`Transaction status updated to ${newStatus}`);
            fetchPayments();
        } catch (err: any) {
            console.error('Error updating status:', err);
            toast.error(`Failed to update status: ${err.message}`);
        }
    };

    const handleRefund = (payment: Payment) => {
        setPaymentToRefund(payment);
        setIsRefundDialogOpen(true);
    };

    const confirmRefund = async () => {
        if (paymentToRefund) {
            await handleStatusUpdate(paymentToRefund, 'refunded');
            setIsRefundDialogOpen(false);
            setPaymentToRefund(null);
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch =
            p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.rzp_payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesStatus = false;
        if (statusFilter === 'all') {
            matchesStatus = true;
        } else if (statusFilter === 'success') {
            matchesStatus = ['success', 'captured', 'paid'].includes(p.status);
        } else if (statusFilter === 'pending') {
            matchesStatus = ['pending', 'created'].includes(p.status);
        } else {
            matchesStatus = p.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    // Metrics Calculation
    const totalRevenue = payments
        .filter(p => ['success', 'captured', 'paid'].includes(p.status) && p.status !== 'refunded')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingPOD = payments
        .filter(p => p.status === 'pending' && (p.payment_method?.includes('Pay on Delivery') || p.is_virtual))
        .reduce((sum, p) => sum + Number(p.amount), 0);

    const getStatusColorClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'captured':
            case 'paid':
                return 'text-emerald-600 bg-emerald-50';
            case 'failed':
                return 'text-rose-600 bg-rose-50';
            case 'pending':
            case 'created':
                return 'text-amber-600 bg-amber-50';
            case 'refunded':
                return 'text-blue-600 bg-blue-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700 p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Financial Archive</span>
                    <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tighter leading-[0.9]">
                        Transaction <br />
                        <span className="italic font-light text-accent">Registry.</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        onClick={fetchPayments}
                        variant="outline"
                        className="h-14 w-14 rounded-2xl border-accent/5 bg-white shadow-sm hover:rotate-180 transition-all duration-700 group"
                    >
                        <RefreshCw className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    </Button>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Revenue Card */}
                <div className="bg-[#1a1a1a] rounded-[2.5rem] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700 group-hover:scale-110 group-hover:rotate-12 transform origin-top-right">
                        <DollarSign className="w-48 h-48 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Total Secured Revenue</span>
                        </div>
                        <div className="text-white">
                            <p className=" text-5xl sm:text-6xl font-black tracking-tighter mb-2">
                                <Price amount={totalRevenue} className="text-white" />
                            </p>
                            <p className="text-white/40 text-xs font-medium italic">Verified & Captured Assets</p>
                        </div>
                    </div>
                </div>

                {/* Pending POD Card */}
                <div className="bg-white border border-accent/10 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-700 group-hover:scale-110 group-hover:-rotate-12 transform origin-top-right">
                        <Wallet className="w-48 h-48 text-accent" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Pending Collections</span>
                        </div>
                        <div>
                            <p className="text-5xl sm:text-6xl font-black tracking-tighter mb-2 text-primary">
                                <Price amount={pendingPOD} />
                            </p>
                            <p className="text-primary/40 text-xs font-medium italic">Awaiting Concierge Settlement</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-stretch font-sans">
                {/* Search & Filter Component - Reuse existing styles but keep code compact */}
                <div className="relative flex-[3] group">
                    <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none z-10">
                        <Search className="w-6 h-6 text-primary/30 group-focus-within:text-accent transition-all duration-700" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search Transaction ID, Razorpay ID, or Member..."
                        className="w-full h-24 bg-white border border-accent/5 rounded-[2.5rem] pl-20 pr-10 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent/20 focus:ring-8 focus:ring-accent/5 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-700 placeholder:text-primary/10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center text-accent hover:bg-black hover:text-white transition-all duration-500 z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="flex-[1] min-w-[320px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-24 px-10 rounded-[2.5rem] border-accent/5 bg-white shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] focus:ring-accent text-[11px] font-black uppercase tracking-widest hover:shadow-2xl transition-all duration-700 border-none">
                            <div className="flex items-center gap-6 relative z-10 w-full">
                                <Filter className="w-6 h-6 text-accent" />
                                <div className="flex flex-col items-start text-left flex-1">
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-accent/60 mb-1.5">Registry Filter</span>
                                    <SelectValue placeholder="All Statuses" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-[2.5rem] border-none bg-white/95 backdrop-blur-3xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3)] p-4 min-w-[320px] animate-in zoom-in-95 duration-500">
                            <SelectItem value="all" className="rounded-2xl py-4 px-6 focus:bg-accent focus:text-white text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all">All Statuses</SelectItem>
                            <SelectItem value="success" className="rounded-2xl py-4 px-6 focus:bg-accent focus:text-white text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all text-emerald-600">Success (Collected)</SelectItem>
                            <SelectItem value="pending" className="rounded-2xl py-4 px-6 focus:bg-accent focus:text-white text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all text-amber-600">Pending Verification</SelectItem>
                            <SelectItem value="failed" className="rounded-2xl py-4 px-6 focus:bg-accent focus:text-white text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all text-rose-600">Failed Attempt</SelectItem>
                            <SelectItem value="refunded" className="rounded-2xl py-4 px-6 focus:bg-accent focus:text-white text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all text-blue-600">Refunded Assets</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {loading ? (
                <div className="py-32">
                    <PremiumLoader message="Syncing Financial Archive..." />
                </div>
            ) : (
                <div className="bg-white border border-accent/5 rounded-[3.5rem] overflow-hidden shadow-sm overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-accent/5">
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Member / Date</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Transaction References</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Valuation</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Method</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-primary/30">Protocol Status</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-accent/[0.03]">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-32 text-center">
                                        <CreditCard className="w-16 h-16 mx-auto text-accent/10 mb-6" />
                                        <p className="text-primary/40 font-medium italic">No transactions found in this registry volume.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-accent/[0.01] transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="space-y-1">
                                                <p className="font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
                                                    {payment.profiles?.full_name || 'Anonymous Member'}
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 italic">
                                                    {new Date(payment.created_at).toLocaleDateString('en-US', {
                                                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-2 font-mono">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black text-accent/50">TX:</span>
                                                    <span className="text-xs font-bold tracking-widest">{payment.transaction_id || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 group/link cursor-pointer" onClick={() => window.open(`/admin/orders?search=${payment.order_id}`, '_blank')}>
                                                    <span className="text-[8px] font-black text-emerald-500/50">ORD:</span>
                                                    <span className="text-xs text-emerald-600/60 group-hover/link:text-emerald-500 underline decoration-dotted underline-offset-4 transition-colors">
                                                        #{payment.order_id?.slice(0, 8).toUpperCase()}
                                                    </span>
                                                    <ExternalLink className="w-2 h-2 text-emerald-500/30 group-hover/link:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <Price amount={payment.amount} className="text-xl font-black tracking-tighter" />
                                            <p className="text-[8px] font-black uppercase tracking-widest text-primary/20 mt-1">{payment.currency}</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-accent/5 flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-accent/40" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    {payment.payment_method || 'Internal Transfer'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            {(payment.payment_method?.includes('Pay on Delivery') || payment.is_virtual) ? (
                                                <Select
                                                    value={payment.status}
                                                    onValueChange={(val) => handleStatusUpdate(payment, val)}
                                                >
                                                    <SelectTrigger className={`w-[140px] h-10 rounded-xl border-none shadow-none ring-0 outline-none ring-offset-0 focus:ring-offset-0 px-4 text-[9px] font-black uppercase tracking-widest focus:ring-0 ${getStatusColorClass(payment.status)}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-[1.5rem] p-2 bg-white/95 backdrop-blur-2xl shadow-xl border-accent/10">
                                                        <SelectItem value="pending" className="rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-amber-50 focus:text-amber-700 py-3">Pending</SelectItem>
                                                        <SelectItem value="captured" className="rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-emerald-50 focus:text-emerald-700 py-3">Collected (Paid)</SelectItem>
                                                        <SelectItem value="failed" className="rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-rose-50 focus:text-rose-700 py-3">Failed</SelectItem>
                                                        <SelectItem value="refunded" className="rounded-lg text-[9px] font-black uppercase tracking-widest focus:bg-blue-50 focus:text-blue-700 py-3">Refunded</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div className={`w-[140px] h-10 rounded-xl px-4 flex items-center text-[9px] font-black uppercase tracking-widest ${getStatusColorClass(payment.status)}`}>
                                                    <span className="truncate">{payment.status}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-10 h-10 rounded-xl hover:bg-emerald-50 group/btn"
                                                    title="View Order Details"
                                                    onClick={() => window.open(`/admin/orders?search=${payment.order_id}`, '_blank')}
                                                >
                                                    <ArrowRight className="w-4 h-4 text-emerald-600/40 group-hover/btn:text-emerald-600 transition-all group-hover/btn:translate-x-1" />
                                                </Button>
                                                {payment.status !== 'refunded' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-10 h-10 rounded-xl hover:bg-black group/btn"
                                                        title="Process Refund"
                                                        onClick={() => handleRefund(payment)}
                                                    >
                                                        <RotateCcw className="w-4 h-4 text-primary/20 group-hover/btn:text-white transition-all transform group-hover/btn:-rotate-180 duration-500" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Refund Confirmation Dialog */}
            <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.2)] bg-white">
                    <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-500 animate-pulse">
                            <RotateCcw className="w-10 h-10" />
                        </div>

                        <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Asset Reversal</span>
                        <h2 className="text-3xl font-bold tracking-tighter mb-4 leading-tight">
                            Process <span className="italic font-light text-blue-500">Refund?</span>
                        </h2>
                        <p className="text-muted-foreground italic text-sm leading-relaxed mb-2 px-4">
                            You are about to mark transaction <span className="font-bold text-primary">{paymentToRefund?.transaction_id}</span> as REFUNDED.
                        </p>
                        <p className="text-muted-foreground italic text-xs leading-relaxed mb-10 px-4">
                            This will update the payment status and adjust financial records accordingly.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsRefundDialogOpen(false)}
                                className="h-14 rounded-2xl border-accent/10 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmRefund}
                                className="h-14 rounded-2xl bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                            >
                                Confirm Refund
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Payments;
