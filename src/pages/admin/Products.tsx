import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PremiumLoader } from '@/components/PremiumLoader';

interface Product {
  id: string;
  sku?: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  category: string;
  sizes: string[] | null;
  inventory: number;
  is_active: boolean;
  tag?: string | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // NEW STATE FOR OVERVIEW DIALOG
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    image_url: '',
    images: ['', '', '', '', ''],
    category: '',
    sizes: 'S, M, L, XL',
    inventory: '0',
    tag: ''
  });

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    const fetchedProducts = data || [];
    setProducts(fetchedProducts);
    setFilteredProducts(fetchedProducts);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      p.id.slice(0, 8).toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      price: '',
      image_url: '',
      images: ['', '', '', '', ''],
      category: '',
      sizes: 'S, M, L, XL',
      inventory: '0',
      tag: ''
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const productImages = product.images || [];
    const imagesArray = [...productImages, '', '', '', '', ''].slice(0, 5);
    setFormData({
      name: product.name,
      sku: product.sku || product.id.slice(0, 8).toUpperCase(),
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      images: imagesArray,
      category: product.category,
      sizes: product.sizes?.join(', ') || 'S, M, L, XL',
      inventory: product.inventory.toString(),
      tag: product.tag || ''
    });
    setIsDialogOpen(true);
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const imagesArray = formData.images.filter(img => img.trim() !== '');
    const productData = {
      name: formData.name,
      sku: formData.sku,
      description: formData.description || null,
      price: parseFloat(formData.price),
      image_url: imagesArray[0] || formData.image_url || null,
      images: imagesArray,
      category: formData.category,
      sizes: sizesArray,
      inventory: parseInt(formData.inventory),
      is_active: true,
      tag: formData.tag || null
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      if (error) {
        toast.error('Failed to update product');
        return;
      }
      toast.success('Archive updated successfully');
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      if (error) {
        toast.error('Failed to augment archive');
        return;
      }
      toast.success('Artifact successfully added to archive');
    }
    setIsDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you certain you wish to remove this artifact from the archive?')) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) {
      toast.error('Failed to remove artifact');
      return;
    }
    toast.success('Artifact removed from archive');
    fetchProducts();
  };

  const handleToggleActive = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);
    if (error) {
      toast.error('Failed to update archival status');
      return;
    }
    fetchProducts();
  };

  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=450&fit=crop';
  };

  // NEW: Open overview dialog
  const openOverview = (product: Product) => {
    setSelectedProduct(product);
    setIsOverviewOpen(true);
  };

  if (loading) {
    return <PremiumLoader message="Synchronizing Catalog Archive..." />;
  }

  return (
    <div className="lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16">
        <div className="space-y-4">
          <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] block italic">Catalog Management</span>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter">Archive <span className="italic font-light text-accent">Catalog.</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 flex-1 lg:max-w-2xl">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Search by Code, Name, or Category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 bg-white border border-accent/5 rounded-2xl px-12 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm outline-none"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30 group-focus-within:text-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </div>
          </div>
          <Button
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            className="h-16 px-10 rounded-2xl bg-primary text-white hover:bg-black transition-all shadow-xl text-[10px] font-black uppercase tracking-widest gap-3"
          >
            <Plus className="w-4 h-4" />
            Augment Archive
          </Button>
        </div>
      </div>

      {/* Products Grid - NOW CLICKABLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`group bg-white border border-accent/5 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 ${!product.is_active ? 'opacity-50 grayscale' : ''
              } cursor-pointer`} // added cursor-pointer
            onClick={() => openOverview(product)} // open overview on card click
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-primary shadow-sm w-fit border border-accent/5">
                  {product.category}
                </span>
                <span className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest text-white shadow-sm w-fit border border-white/10 italic">
                  # {product.sku || product.id.slice(0, 8).toUpperCase()}
                </span>
                {product.tag && (
                  <span className="bg-accent/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-sm w-fit border border-accent/5">
                    {product.tag}
                  </span>
                )}
              </div>
              {!product.is_active && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-rose-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Inactive</span>
                </div>
              )}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border border-accent/5">
                  <ImageIcon className="w-3 h-3 text-accent" />
                  {product.images.length} Perspectives
                </div>
              )}
            </div>
            <div className="p-10" onClick={(e) => e.stopPropagation()}> {/* stop propagation so buttons still work */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="font-heading text-2xl font-bold tracking-tight group-hover:text-accent transition-colors">{product.name}</h3>
                <span className=" text-xl font-medium italic text-primary/40">${Number(product.price).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-accent/5 p-4 rounded-2xl">
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-1">Inventory</p>
                  <p className=" text-lg font-black">{product.inventory} Units</p>
                </div>
                <div className="bg-accent/5 p-4 rounded-2xl">
                  <p className="text-[8px] font-black uppercase tracking-widest text-primary/30 mb-1">Dimensions</p>
                  <p className=" text-lg font-black">{product.sizes?.length ? product.sizes[0] : 'N/A'}+</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl border-accent/10 hover:bg-accent/5 text-[9px] font-black uppercase tracking-widest gap-2"
                  onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 h-12 rounded-2xl border-accent/10 text-[9px] font-black uppercase tracking-widest ${product.is_active ? 'hover:bg-rose-50 hover:text-rose-500' : 'hover:bg-emerald-50 hover:text-emerald-500'}`}
                  onClick={(e) => { e.stopPropagation(); handleToggleActive(product); }}
                >
                  {product.is_active ? 'Restrain' : 'Release'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-12 h-12 rounded-2xl border-accent/10 text-primary/30 hover:text-rose-500 hover:bg-rose-50 transition-all"
                  onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-accent/20">
          <p className="font-heading text-2xl text-primary/30 italic">No artifacts match your search query.</p>
        </div>
      )}

      {/* YOUR ORIGINAL Add/Edit Dialog - UNCHANGED */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[3.5rem] border-accent/10 bg-[#FFFAF5]/95 backdrop-blur-2xl p-0 shadow-2xl">
          <div className="p-6 sm:p-12">
            <DialogHeader className="mb-10 text-center md:text-left">
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Archival Registry</span>
              <DialogTitle className="font-heading text-4xl font-bold tracking-tighter">
                {editingProduct ? 'Refine Artifact' : 'Augment Archive'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ... all your original form fields unchanged ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Artifact Designation</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus:ring-accent"
                    placeholder="e.g. Silk Archival Blouse"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Archival Code (SKU)</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. MS-SH-001"
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus:ring-accent font-mono uppercase"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Provenance Class</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Apparel"
                    required
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus:ring-accent"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="tag" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Premium Tag (Optional)</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. New, Bestseller, Archival"
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus:ring-accent"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Archival Abstract</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="rounded-3xl border-accent/10 bg-white shadow-sm focus:ring-accent p-6 resize-none"
                  placeholder="Describe the material integrity and architectural build..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Contribution ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus:ring-accent"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="inventory" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Archival Units</Label>
                  <Input
                    id="inventory"
                    type="number"
                    min="0"
                    value={formData.inventory}
                    onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                    required
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus:ring-accent"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="sizes" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Dimensions</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus:ring-accent"
                  />
                </div>
              </div>
              {/* Multiple Images */}
              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Visual Perspectives (1-5)</Label>
                  <p className="text-[10px] text-primary/30 mt-1 ml-1 italic font-medium">Inject high-resolution observational data URLs</p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="flex gap-4 items-center group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-sm border border-accent/5 flex-shrink-0 flex items-center justify-center p-1">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Visual ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.opacity = '0.3';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-accent/20" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={imageUrl}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder={index === 0 ? "Main Perspective URL (Required)" : `Perspective ${index + 1} (Optional)`}
                          className="h-14 rounded-2xl border-accent/5 bg-white/50 focus:bg-white transition-all text-xs"
                        />
                      </div>
                      {imageUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleImageChange(index, '')}
                          className="w-12 h-12 rounded-full hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-accent/5">
                <Button type="submit" className="flex-1 h-20 rounded-[2rem] bg-primary text-white hover:bg-black text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all">
                  {editingProduct ? 'Commit Changes' : 'Execute Augmentation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="h-20 px-12 rounded-[2rem] border-accent/10 hover:bg-accent/5 text-[12px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Dissolve
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* NEW: Product Overview Dialog - ADDED ONLY THIS PART */}
      <Dialog open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[2rem] border-accent/10 bg-[#FFFAF5]/95 backdrop-blur-2xl p-0 shadow-2xl">
          {selectedProduct && (
            <div className="p-8 sm:p-12">
              <DialogHeader className="mb-10 text-center md:text-left">
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em] mb-4 block italic">Artifact Overview</span>
                <DialogTitle className="font-heading text-4xl font-bold tracking-tighter">
                  {selectedProduct.name}
                </DialogTitle>
                <p className="text-lg italic text-primary/60 mt-2">
                  # {selectedProduct.sku || selectedProduct.id.slice(0, 8).toUpperCase()} • {selectedProduct.category}
                </p>
              </DialogHeader>

              {/* Images */}
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="md:col-span-2">
                    <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl border border-accent/10">
                      <img
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProduct.images.slice(1).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md border border-accent/5">
                          <img src={img} alt={`Perspective ${idx + 2}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-accent/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Contribution Value</p>
                  <p className="text-3xl font-bold text-primary">${Number(selectedProduct.price).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-accent/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Available Units</p>
                  <p className="text-3xl font-bold text-primary">{selectedProduct.inventory}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-accent/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Status</p>
                  <p className={`text-2xl font-bold ${selectedProduct.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedProduct.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="mb-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-4">Available Dimensions</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.sizes.map((size) => (
                      <span key={size} className="bg-accent/10 px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.description && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-4">Archival Abstract</p>
                  <p className="text-lg leading-relaxed text-primary/80 italic">{selectedProduct.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminProducts;