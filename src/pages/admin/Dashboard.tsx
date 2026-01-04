import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  LogOut,
  Menu,
  X,
  Settings,
  Layers,
  Ticket,
  CreditCard
} from 'lucide-react';
import { PremiumLoader } from '@/components/PremiumLoader';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  pendingPOD: number;
}

const AdminDashboard = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const { storeCurrency, formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    pendingPOD: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth', { replace: true, state: { from: location.pathname } });
    }
  }, [user, authLoading, isAdmin, navigate, location]);

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Fetch Products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // 2. Fetch Orders for counts
      const { data: orders } = await supabase
        .from('orders')
        .select('status');

      // 3. Fetch Payments Logic (Merged for accuracy)
      const { data: rawPayments } = await (supabase as any)
        .from('payments')
        .select('*');

      const { data: podOrders } = await (supabase as any)
        .from('orders')
        .select('*')
        .ilike('shipping_method_name', '%POD%');

      // Merge Logic Reuse
      const existingPaymentOrderIds = new Set((rawPayments || []).map((p: any) => p.order_id));
      const virtualPayments = (podOrders || [])
        .filter((order: any) => !existingPaymentOrderIds.has(order.id))
        .map((order: any) => ({
          id: `virt-${order.id}`,
          order_id: order.id,
          user_id: order.user_id,
          transaction_id: `POD-${order.id.slice(0, 8)}`,
          payment_method: 'Pay on Delivery (Manual)',
          amount: order.total_amount,
          currency: 'USD',
          status: order.status === 'cancelled' ? 'failed' : 'pending',
          rzp_payment_id: 'N/A',
          created_at: order.created_at,
          is_virtual: true
        }));

      const allPayments = [...(rawPayments || []), ...virtualPayments];

      // Calculate Metrics
      const totalRevenue = allPayments
        .filter((p: any) => ['success', 'captured', 'paid'].includes(p.status) && p.status !== 'refunded')
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      const pendingPOD = allPayments
        .filter((p: any) => p.status === 'pending' && (p.payment_method?.includes('Pay on Delivery') || p.is_virtual))
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      if (orders) {
        const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: orders.length,
          pendingOrders: pendingCount,
          revenue: totalRevenue,
          pendingPOD: pendingPOD
        });
      }
    };

    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAF5]">
        <PremiumLoader message="Verifying Administrative Credentials..." />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Atelier Overview', exact: true },
    { path: '/admin/products', icon: Package, label: 'Archive Catalog' },
    { path: '/admin/collections', icon: Layers, label: 'Thematic Registries' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Order Registry' },
    { path: '/admin/customers', icon: Users, label: 'Member Directory' },
    { path: '/admin/shipping', icon: Truck, label: 'Logistics Matrix' },
    { path: '/admin/coupons', icon: Ticket, label: 'Incentive Keys' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payment Archive' },
    { path: '/admin/settings', icon: Settings, label: 'Atelier Settings' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isMainDashboard = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#FFFAF5]/80 backdrop-blur-2xl border-b border-accent/5 px-6 h-20 flex items-center justify-between no-print">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 text-primary">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-heading text-xl font-black tracking-[0.2em]">ADMIN</span>
        <div className="w-10" />
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-72 bg-white border-r border-accent/5 shadow-2xl transform transition-transform duration-700 lg:translate-x-0 no-print ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-40 flex items-center px-8 pb-4 border-b border-accent/5 pt-8">
            <Link to="/" className="font-heading text-2xl font-black tracking-[0.25em] text-primary">MAISON</Link>
            <span className="ml-4 text-[8px] font-black uppercase tracking-[0.2em] bg-accent/10 text-accent px-3 py-1 rounded-full italic">Atelier</span>
          </div>

          <nav className="flex-1 p-8 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 mb-10 ml-4">Management</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive(item.path, item.exact)
                  ? 'bg-primary text-white shadow-xl scale-105'
                  : 'text-primary/50 hover:bg-accent/5 hover:text-accent'
                  }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive(item.path, item.exact) ? '' : 'group-hover:scale-125'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-accent/5">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full h-16 rounded-2xl justify-start gap-4 hover:bg-rose-50 hover:text-rose-500 group transition-all"
            >
              <LogOut className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              <span className="text-[10px] font-black uppercase tracking-widest">Depart Terminal</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen pt-24 lg:pt-0">
        {isMainDashboard ? (
          <div className="p-8 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Overview Portal</span>
                <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tighter leading-[0.9]">
                  Atelier <br />
                  <span className="italic font-light text-accent">Performance.</span>
                </h1>
              </div>
              <p className="text-primary/40 text-sm font-medium italic max-w-xs text-right hidden md:block">
                Monitoring the core archival metrics of the Maison ecosystem in real-time.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { label: 'Total Secured Revenue', value: formatPrice(stats.revenue, storeCurrency), detail: 'Verified & Captured Assets' },
                { label: 'Pending Collections', value: formatPrice(stats.pendingPOD, storeCurrency), detail: 'Awaiting Concierge Settlement', isAlert: true },
                { label: 'Archival Orders', value: stats.totalOrders, detail: 'Lifetime Acquisitions' },
                { label: 'Total Artifacts', value: stats.totalProducts, detail: 'Archive Catalog' },
              ].map((stat, i) => (
                <div key={i} className={`bg-white border border-accent/5 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 group ${stat.isAlert ? 'bg-primary/5 border-accent/10' : ''}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b border-accent/5 pb-4 transition-colors ${stat.isAlert ? 'text-accent' : 'text-primary/30 group-hover:text-accent'}`}>{stat.label}</p>
                  <p className="text-2xl font-black mb-1 tracking-tighter text-primary">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/40 italic">{stat.detail}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Link
                to="/admin/products"
                className="group bg-white border border-accent/5 rounded-[3.5rem] p-16 hover:shadow-2xl transition-all duration-700 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <Package className="w-12 h-12 mb-8 text-accent group-hover:rotate-12 transition-transform" />
                  <h3 className="font-heading text-3xl font-bold mb-4 tracking-tight">Archive Catalog</h3>
                  <p className="text-primary/50 text-lg font-medium italic leading-relaxed">
                    Meticulously curate, refine, or augment the archival product listings within the Maison ecosystem.
                  </p>
                  <div className="mt-8 flex items-center gap-3 text-accent font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-700">
                    Enter Catalog <X className="w-3 h-3 rotate-45" />
                  </div>
                </div>
              </Link>
              <Link
                to="/admin/orders"
                className="group bg-white border border-accent/5 rounded-[3.5rem] p-16 hover:shadow-2xl transition-all duration-700 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <ShoppingCart className="w-12 h-12 mb-8 text-accent group-hover:rotate-12 transition-transform" />
                  <h3 className="font-heading text-3xl font-bold mb-4 tracking-tight">Order Registry</h3>
                  <p className="text-primary/50 text-lg font-medium italic leading-relaxed">
                    Oversee and facilitate the seamless archival transfer of pieces to members global coordinates.
                  </p>
                  <div className="mt-8 flex items-center gap-3 text-accent font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 transition-all duration-700">
                    View Registry <X className="w-3 h-3 rotate-45" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 lg:p-16">
            <Outlet />
          </div>
        )}
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#111]/40 backdrop-blur-sm z-30 lg:hidden transition-all duration-700"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
