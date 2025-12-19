import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="font-heading text-2xl font-semibold mb-4 inline-block">
              MAISON
            </Link>
            <p className="text-primary-foreground/70 max-w-md">
              Curating timeless pieces for those who appreciate understated elegance 
              and quality craftsmanship since 2024.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Bestsellers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Shipping
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 Maison. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground transition-colors text-sm">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
