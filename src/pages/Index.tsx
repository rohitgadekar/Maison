import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RefreshCcw, Headphones, Star } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />
      <main>
        <Hero />
        <FeaturedProducts />
        
        {/* Trust Badges */}
        <section className="py-16 border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg mb-1">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On orders over $100</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg mb-1">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">100% secure checkout</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCcw className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg mb-1">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg mb-1">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">Dedicated support team</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Banner */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl mb-4">Shop by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our curated collections designed for the modern lifestyle
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/shop?category=Clothing" className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-card">
                <img 
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=450&fit=crop" 
                  alt="Clothing collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-heading text-2xl text-primary-foreground mb-2">Clothing</h3>
                  <p className="text-primary-foreground/80 text-sm mb-3">Essentials for every season</p>
                  <span className="inline-flex items-center text-primary-foreground text-sm group-hover:gap-2 transition-all">
                    Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
              
              <Link to="/shop?category=Bags" className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-card">
                <img 
                  src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&h=450&fit=crop" 
                  alt="Bags collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-heading text-2xl text-primary-foreground mb-2">Bags</h3>
                  <p className="text-primary-foreground/80 text-sm mb-3">Carry your essentials in style</p>
                  <span className="inline-flex items-center text-primary-foreground text-sm group-hover:gap-2 transition-all">
                    Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
              
              <Link to="/shop?category=Jewelry" className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-card">
                <img 
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=450&fit=crop" 
                  alt="Jewelry collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-heading text-2xl text-primary-foreground mb-2">Jewelry</h3>
                  <p className="text-primary-foreground/80 text-sm mb-3">Complete your look</p>
                  <span className="inline-flex items-center text-primary-foreground text-sm group-hover:gap-2 transition-all">
                    Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Banner */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop" 
                  alt="New arrivals"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:pl-12">
                <span className="text-accent uppercase tracking-wider text-sm font-medium">New Arrivals</span>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl mt-4 mb-6">
                  Spring Collection 2024
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Discover our latest collection featuring sustainable materials and timeless designs. 
                  Each piece is crafted with care to bring you the perfect blend of style and comfort.
                </p>
                <Link 
                  to="/shop" 
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Explore Collection
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl mb-4">What Our Customers Say</h2>
              <p className="text-muted-foreground">Join thousands of satisfied customers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah M.",
                  review: "Absolutely love the quality of the clothing. The fabrics are premium and the fit is perfect. Will definitely be ordering again!",
                  rating: 5
                },
                {
                  name: "James L.",
                  review: "Fast shipping and excellent customer service. The bag I ordered exceeded my expectations in terms of quality and design.",
                  rating: 5
                },
                {
                  name: "Emily R.",
                  review: "The jewelry collection is stunning. I've received so many compliments on my new necklace. Highly recommend!",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-card p-8 rounded-2xl border border-border">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.review}"
                  </p>
                  <p className="font-heading">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instagram Feed / Gallery */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-4xl mb-4">Follow Our Style</h2>
              <p className="text-muted-foreground">@aurastore on Instagram</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=400&fit=crop"
              ].map((image, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden group cursor-pointer">
                  <img 
                    src={image} 
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-accent/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-heading text-3xl sm:text-4xl mb-4">Stay in Touch</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Subscribe for exclusive access to new collections, special offers, and 10% off your first order.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
              <p className="text-sm text-muted-foreground mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;