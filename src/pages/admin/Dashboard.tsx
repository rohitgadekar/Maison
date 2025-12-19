import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
}

const AdminDashboard = () => {
  const { user, loading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth', { state: { from: '/admin' } });
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('status, total_amount');

      if (orders) {
        const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

        setStats({
          totalProducts: productsCount || 0,
          totalOrders: orders.length,
          pendingOrders: pendingCount,
          revenue: totalRevenue
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isMainDashboard = location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-4 h-16 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="font-heading text-xl">Admin</span>
        <div className="w-9" />
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-border">
            <Link to="/" className="font-heading text-xl">MAISON</Link>
            <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">Admin</span>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path, item.exact)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {isMainDashboard ? (
          <div className="p-6 lg:p-8">
            <h1 className="font-heading text-2xl lg:text-3xl mb-8">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                <p className="font-heading text-3xl">{stats.totalProducts}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="font-heading text-3xl">{stats.totalOrders}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                <p className="font-heading text-3xl">{stats.pendingOrders}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="font-heading text-3xl">${stats.revenue.toFixed(2)}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/admin/products"
                className="bg-card border border-border rounded-2xl p-6 hover:border-accent transition-colors"
              >
                <Package className="w-8 h-8 mb-4 text-accent" />
                <h3 className="font-heading text-lg mb-2">Manage Products</h3>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or remove products from your store.
                </p>
              </Link>
              <Link
                to="/admin/orders"
                className="bg-card border border-border rounded-2xl p-6 hover:border-accent transition-colors"
              >
                <ShoppingCart className="w-8 h-8 mb-4 text-accent" />
                <h3 className="font-heading text-lg mb-2">Manage Orders</h3>
                <p className="text-sm text-muted-foreground">
                  View and fulfill customer orders.
                </p>
              </Link>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
