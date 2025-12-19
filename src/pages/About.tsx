import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <CartDrawer />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="font-heading text-4xl sm:text-5xl font-semibold mb-6">Our Story</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded on the principle that quality transcends trends, Maison curates 
              timeless pieces for those who appreciate understated elegance.
            </p>
          </div>

          {/* Image */}
          <div className="max-w-4xl mx-auto mb-16">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop" 
              alt="Maison atelier"
              className="w-full rounded-lg shadow-card"
            />
          </div>

          {/* Values */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-2xl">01</span>
                </div>
                <h3 className="font-heading text-xl mb-2">Quality First</h3>
                <p className="text-muted-foreground text-sm">
                  Every piece is selected for exceptional craftsmanship and lasting quality.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-2xl">02</span>
                </div>
                <h3 className="font-heading text-xl mb-2">Timeless Design</h3>
                <p className="text-muted-foreground text-sm">
                  We focus on pieces that transcend seasonal trends and stand the test of time.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading text-2xl">03</span>
                </div>
                <h3 className="font-heading text-xl mb-2">Thoughtful Curation</h3>
                <p className="text-muted-foreground text-sm">
                  Each item is carefully chosen to complement a modern, refined lifestyle.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-secondary rounded-lg p-8 sm:p-12 text-center">
              <h2 className="font-heading text-2xl sm:text-3xl mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Have questions? We'd love to hear from you.
              </p>
              <a 
                href="mailto:hello@maison.com" 
                className="inline-flex items-center justify-center h-12 px-8 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
