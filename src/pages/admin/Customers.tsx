import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, ShoppingBag, DollarSign, Calendar, Search } from 'lucide-react';
import { PremiumLoader } from '@/components/PremiumLoader';

interface Customer {
    id: string;
    user_id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    created_at: string;
    total_orders: number;
    total_spent: number;
}

const AdminCustomers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomerData = async () => {
        try {
            // Fetch user IDs with the role 'customer'
            const { data: roles, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id')
                .eq('role', 'customer');

            if (rolesError) throw rolesError;

            const customerIds = roles?.map(r => r.user_id) || [];

            // Fetch profiles for these customers
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('user_id', customerIds);

            if (profilesError) throw profilesError;

            // Fetch all orders to aggregate data
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('user_id, total_amount, status');

            if (ordersError) throw ordersError;

            // Aggregate data
            const customerMap = new Map<string, { total_orders: number; total_spent: number }>();

            orders?.forEach(order => {
                const stats = customerMap.get(order.user_id) || { total_orders: 0, total_spent: 0 };
                if (order.status !== 'cancelled') {
                    stats.total_orders += 1;
                    stats.total_spent += Number(order.total_amount);
                }
                customerMap.set(order.user_id, stats);
            });

            const customerList: Customer[] = (profiles || []).map(profile => {
                const stats = customerMap.get(profile.user_id) || { total_orders: 0, total_spent: 0 };
                return {
                    ...profile,
                    total_orders: stats.total_orders,
                    total_spent: stats.total_spent
                };
            });

            setCustomers(customerList);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, []);

    const filteredCustomers = customers.filter(customer => {
        const searchStr = searchTerm.toLowerCase();
        return (
            (customer.full_name?.toLowerCase().includes(searchStr)) ||
            (customer.email?.toLowerCase().includes(searchStr)) ||
            (customer.user_id.toLowerCase().includes(searchStr))
        );
    });

    if (loading) {
        return <PremiumLoader message="Authenticating Member Profiles..." />;
    }

    return (
        <div className="lg:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Member Directory</span>
                    <h1 className="font-heading text-5xl font-bold tracking-tighter">Customer <span className="italic font-light text-accent">Overview.</span></h1>
                </div>

                {/* Registry Search */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-primary/30 group-focus-within:text-accent transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Identity, Email or UID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-16 bg-white border border-accent/5 rounded-[2rem] pl-14 pr-8 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-accent/20 focus:ring-1 focus:ring-accent/20 shadow-sm transition-all placeholder:text-primary/20"
                    />
                    {searchTerm && (
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                            <span className="text-[10px] font-black text-accent bg-accent/5 px-3 py-1 rounded-full italic">
                                {filteredCustomers.length} Found
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {filteredCustomers.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-accent/20">
                    <p className="font-heading text-2xl text-primary/30 italic">No members found matching your query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-white border border-accent/5 rounded-[3rem] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-accent/5">
                                        <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Member Identity</th>
                                        <th className="text-left px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Contact Info</th>
                                        <th className="text-center px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Acquisitions</th>
                                        <th className="text-right px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Total Investment</th>
                                        <th className="text-right px-10 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Member Since</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-accent/5">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-accent/5 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center">
                                                        <User className="w-6 h-6 text-accent" />
                                                    </div>
                                                    <div>
                                                        <p className="font-heading text-xl font-black text-primary leading-tight">
                                                            {customer.full_name || 'Anonymous Collector'}
                                                        </p>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/20">
                                                            UID: {customer.user_id.slice(0, 8)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium italic text-primary/60 underline break-all">{customer.email || 'N/A'}</p>
                                                    {customer.phone && (
                                                        <p className="text-[10px] font-black tracking-widest text-accent italic">{customer.phone}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/5">
                                                    <ShoppingBag className="w-4 h-4 text-primary/40" />
                                                    <span className="text-lg font-black tracking-tighter text-primary">{customer.total_orders}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-accent/40" />
                                                    <span className="text-2xl font-black tracking-tighter text-primary">
                                                        ${customer.total_spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-2 text-primary/40">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs font-medium italic">
                                                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Aggregated Stats for Customers */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
                        <div className="bg-white border border-accent/5 rounded-[2.5rem] p-10 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-8 border-b border-accent/5 pb-4">Total Member Base</p>
                            <p className="text-4xl font-black mb-1 tracking-tighter text-primary">{customers.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/40 italic">Registered Profiles</p>
                        </div>
                        <div className="bg-white border border-accent/5 rounded-[2.5rem] p-10 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-8 border-b border-accent/5 pb-4">Active Collectors</p>
                            <p className="text-4xl font-black mb-1 tracking-tighter text-primary">
                                {customers.filter(c => c.total_orders > 0).length}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/40 italic">Members with Acquisitions</p>
                        </div>
                        <div className="bg-white border border-accent/5 rounded-[2.5rem] p-10 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-8 border-b border-accent/5 pb-4">Average Investment</p>
                            <p className="text-4xl font-black mb-1 tracking-tighter text-primary">
                                ${(customers.reduce((acc, c) => acc + c.total_spent, 0) / (customers.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/40 italic">Per Registered Member</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
