import { ShoppingBag, Menu, X, User, LogOut, Settings, ClipboardList, LayoutDashboard, UserCircle, Heart, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { SearchOverlay } from './SearchOverlay';

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFAF5]/80 backdrop-blur-2xl border-b border-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-primary"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-10">
            <Link
              to="/"
              className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 hover:text-accent transition-all relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
            </Link>
            <Link
              to="/shop"
              className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 hover:text-accent transition-all relative group"
            >
              Archive
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
            </Link>
            <Link
              to="/about"
              className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 hover:text-accent transition-all relative group"
            >
              Philosophy
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
            </Link>
            <Link
              to="/contact"
              className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50 hover:text-accent transition-all relative group"
            >
              Concierge
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
            </Link>
          </nav>

          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-2xl sm:text-3xl font-black tracking-[0.25em] absolute left-1/2 -translate-x-1/2 text-primary hover:text-accent transition-colors"
          >
            MAISON
          </Link>

          {/* User & Cart */}
          <div className="flex items-center gap-4">
            {!user ? (
              <Link
                to="/auth"
                className="p-2 transition-transform hover:scale-110 text-primary"
              >
                <User className="w-5 h-5" />
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 outline-none group">
                    <UserCircle className="w-5 h-5 transition-transform group-hover:scale-110 text-accent" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-4 rounded-3xl p-4 shadow-2xl border-accent/5 bg-white/95 backdrop-blur-xl">
                  <DropdownMenuLabel className="font-heading text-xs uppercase tracking-[0.3em] font-black text-accent mb-2">Member Archive</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-accent/5" />
                  <div className="py-2">
                    {isAdmin ? (
                      <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-accent/5 cursor-pointer flex items-center mb-1 group">
                        <Link to="/admin">
                          <LayoutDashboard className="mr-3 h-4 w-4 text-primary/30 group-hover:text-accent transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Admin Terminal</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-accent/5 cursor-pointer flex items-center mb-1 group">
                          <Link to="/account">
                            <UserCircle className="mr-3 h-4 w-4 text-primary/30 group-hover:text-accent transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Settings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-accent/5 cursor-pointer flex items-center mb-1 group">
                          <Link to="/orders">
                            <ClipboardList className="mr-3 h-4 w-4 text-primary/30 group-hover:text-accent transition-colors" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Archival History</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-accent/5 my-2" />
                    <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-4 py-3 focus:bg-rose-50 text-rose-500 cursor-pointer flex items-center mt-1 group">
                      <LogOut className="mr-3 h-4 w-4 opacity-50 group-hover:opacity-100" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Depart Session</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 transition-transform hover:scale-110 text-primary"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              to="/wishlist"
              className="relative p-2 group transition-transform hover:scale-110"
            >
              <Heart className="w-5 h-5 text-primary" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-accent text-white text-[8px] rounded-full flex items-center justify-center font-black animate-in fade-in zoom-in">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 group transition-transform hover:scale-110"
            >
              <ShoppingBag className="w-5 h-5 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-accent text-white text-[8px] rounded-full flex items-center justify-center font-black animate-in fade-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-12 border-t border-accent/5 animate-fade-in bg-white/95 backdrop-blur-xl absolute left-0 right-0 top-full h-[calc(100vh-80px)] overflow-y-auto px-8">
            <div className="flex flex-col gap-10 items-center justify-center h-full">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-[0.5em] text-primary/30 hover:text-accent transition-all italic"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-[0.5em] text-primary/30 hover:text-accent transition-all italic"
              >
                Archive
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-[0.5em] text-primary/30 hover:text-accent transition-all italic"
              >
                Philosophy
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-[0.5em] text-primary/30 hover:text-accent transition-all italic"
              >
                Concierge
              </Link>

              <div className="w-12 h-0.5 bg-accent/10 my-4" />

              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-black uppercase tracking-[0.4em] bg-primary text-white px-8 py-4 rounded-full"
                >
                  Enter Archive
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-black uppercase tracking-[0.4em] text-rose-500"
                >
                  Depart Session
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
