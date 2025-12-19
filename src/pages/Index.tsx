import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />
      <main>
        <Hero />
        <FeaturedProducts />
        
        {/* Categories Banner */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative overflow-hidden rounded-lg aspect-[4/3] bg-card">
                <img 
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=450&fit=crop" 
                  alt="Clothing collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-heading text-2xl text-primary-foreground mb-2">Clothing</h3>
                  <p className="text-primary-foreground/80 text-sm">Essentials for every season</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-lg aspect-[4/3] bg-card">
                <img 
                  src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=450&fit=crop" 
                  alt="Accessories collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-heading text-2xl text-primary-foreground mb-2">Accessories</h3>
                  <p className="text-primary-foreground/80 text-sm">Complete your look</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-lg aspect-[4/3] bg-card">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop" 
                  alt="Home collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-heading text-2xl text-primary-foreground mb-2">Home</h3>
                  <p className="text-primary-foreground/80 text-sm">Curated living spaces</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="font-heading text-3xl sm:text-4xl mb-4">Stay in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Subscribe for exclusive access to new collections and special offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  className="h-12 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
