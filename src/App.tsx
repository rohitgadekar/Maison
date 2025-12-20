import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Account from "./pages/Account";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Product from "./pages/Product";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCollections from "./pages/admin/Collections";
import AdminCustomers from "./pages/admin/Customers";
import AdminShipping from "./pages/admin/Shipping";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

import { CurrencyProvider } from "@/context/CurrencyContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CurrencyProvider>
              <TooltipProvider>
                <Toaster />
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<Product />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/admin" element={<AdminDashboard />}>
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="collections" element={<AdminCollections />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="shipping" element={<AdminShipping />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </CurrencyProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
