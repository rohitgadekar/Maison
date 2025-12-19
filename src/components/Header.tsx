import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm tracking-wide hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-sm tracking-wide hover:text-accent transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-sm tracking-wide hover:text-accent transition-colors"
            >
              About
            </Link>
          </nav>

          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-xl sm:text-2xl font-semibold tracking-tight absolute left-1/2 -translate-x-1/2"
          >
            MAISON
          </Link>

          {/* User & Cart */}
          <div className="flex items-center gap-2">
            <Link
              to={user ? (isAdmin ? '/admin' : '/orders') : '/auth'}
              className="p-2 group"
            >
              <User className="w-5 h-5 transition-transform group-hover:scale-110" />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 -mr-2 group"
            >
              <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm tracking-wide hover:text-accent transition-colors"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm tracking-wide hover:text-accent transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm tracking-wide hover:text-accent transition-colors"
              >
                About
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
