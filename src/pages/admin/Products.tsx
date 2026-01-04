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
import { SizeChartBuilder, SizeChartData } from '@/components/admin/SizeChartBuilder';
import { SizeChart } from '@/components/SizeChart';
import { Price } from '@/components/Price';
import { useCurrency } from '@/context/CurrencyContext';

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
  brand?: string | null;
  size_chart?: string | null;
  size_chart_data?: SizeChartData | null;
}

const AdminProducts = () => {
  const { storeCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [cloneSearch, setCloneSearch] = useState('');
  const [isCloneVisible, setIsCloneVisible] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);

  // NEW STATE FOR OVERVIEW DIALOG
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductStocks, setSelectedProductStocks] = useState<Record<string, number>>({});

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
    tag: '',
    brand: '',
    size_chart: '',
    size_chart_data: null as SizeChartData | null,
    size_stocks: {} as Record<string, number>
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
      tag: '',
      brand: '',
      size_chart: '',
      size_chart_data: null,
      size_stocks: {}
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
      tag: product.tag || '',
      brand: product.brand || '',
      size_chart: product.size_chart || '',
      size_chart_data: product.size_chart_data || null,
      size_stocks: {} // Will be populated by fetchStocks
    });
    fetchStocks(product.id);
    setIsDialogOpen(true);
  };

  const fetchStocks = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_stocks' as any)
      .select('size, quantity')
      .eq('product_id', productId);

    if (!error && data) {
      const stocks: Record<string, number> = {};
      data.forEach((s: any) => {
        stocks[s.size] = s.quantity;
      });
      setFormData(prev => ({ ...prev, size_stocks: stocks }));
    }
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
      tag: formData.tag || null,
      brand: formData.brand || null,
      size_chart: formData.size_chart || null,
      size_chart_data: formData.size_chart_data || null
    };

    let savedProductId = editingProduct?.id;

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      if (error) {
        toast.error(`Failed to update product: ${error.message}`);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      if (error) {
        console.error('Insert error:', error);
        toast.error(`Failed to augment archive: ${error.message}`);
        return;
      }
      savedProductId = data.id;
    }

    // Update Size Stocks
    if (savedProductId) {
      // First, remove stocks for sizes that are no longer in the sizes array
      const { error: deleteError } = await supabase
        .from('product_stocks' as any)
        .delete()
        .eq('product_id', savedProductId)
        .not('size', 'in', `(${sizesArray.map(s => `"${s}"`).join(',')})`); // Use quotes for sizes to handle spaces/special chars

      if (deleteError) {
        console.error('Error clearing stale stocks:', deleteError);
      }

      const stockInserts = sizesArray.map(size => ({
        product_id: savedProductId,
        size: size,
        quantity: formData.size_stocks[size] || 0
      }));

      if (stockInserts.length > 0) {
        const { error: stockError } = await supabase
          .from('product_stocks' as any)
          .upsert(stockInserts, { onConflict: 'product_id,size' });

        if (stockError) {
          console.error('Stock update error:', stockError);
        }
      }
    }

    toast.success(editingProduct ? 'Archive updated successfully' : 'Artifact successfully added to archive');
    setIsDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProductToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDeleteId) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productToDeleteId);

    if (error) {
      toast.error('Failed to remove artifact');
      return;
    }
    toast.success('Artifact removed from archive');
    fetchProducts();
    setIsDeleteDialogOpen(false);
    setProductToDeleteId(null);
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

  // Helper to detect video format
  const isVideo = (url: string | null) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=450&fit=crop';
  };

  // NEW: Open overview dialog
  const openOverview = async (product: Product) => {
    setSelectedProduct(product);
    setIsOverviewOpen(true);

    // Fetch stocks for the selected product
    const { data, error } = await supabase
      .from('product_stocks' as any)
      .select('size, quantity')
      .eq('product_id', product.id);

    if (!error && data) {
      const stocks: Record<string, number> = {};
      data.forEach((s: any) => {
        stocks[s.size] = s.quantity;
      });
      setSelectedProductStocks(stocks);
    } else {
      setSelectedProductStocks({});
    }
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
              className="w-full h-16 bg-white border border-accent/5 rounded-2xl px-12 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-0 focus:border-accent shadow-sm"
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

              {/* Inventory Badge */}
              <div className="absolute top-4 right-4 group-hover:translate-x-[-4px] transition-transform duration-500">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-center shadow-lg border border-accent/5 min-w-[60px]">
                  <span className="text-[7px] font-black uppercase tracking-widest text-primary/30 leading-none mb-1">Stock</span>
                  <span className="text-xs font-black text-primary leading-none">{product.inventory}</span>
                </div>
              </div>

              {!product.is_active && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-rose-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Inactive</span>
                </div>
              )}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm border border-accent/5">
                  <ImageIcon className="w-3 h-3 text-accent" />
                  {product.images.length} Perspectives
                </div>
              )}
            </div>
            <div className="p-8 sm:p-10" onClick={(e) => e.stopPropagation()}> {/* stop propagation so buttons still work */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h3 className="font-heading text-xl font-bold tracking-tight group-hover:text-accent transition-colors truncate mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/30 italic">Dimensions:</span>
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">{product.sizes?.length ? product.sizes[0] : 'N/A'}+</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-black text-primary tracking-tighter"><Price amount={Number(product.price)} /></span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4">
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl border-accent/10 hover:bg-accent/5 hover:text-accent text-[9px] font-black uppercase tracking-widest gap-2 shadow-sm"
                    onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
                <div className="col-span-5">
                  <Button
                    variant="outline"
                    className={`w-full h-11 rounded-xl border-accent/10 text-[9px] font-black uppercase tracking-widest shadow-sm ${product.is_active ? 'hover:bg-rose-50 hover:text-rose-500' : 'hover:bg-emerald-50 hover:text-emerald-500'}`}
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(product); }}
                  >
                    {product.is_active ? 'Restrain' : 'Release'}
                  </Button>
                </div>
                <div className="col-span-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-full h-11 rounded-xl border-accent/10 text-primary/30 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(e, product.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
        <DialogContent className="max-w-3xl border-accent/10 bg-[#FFFAF5]/95 backdrop-blur-2xl p-0 shadow-2xl overflow-hidden rounded-[2rem]">
          <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-12 scrollbar-thin scrollbar-thumb-accent/10 hover:scrollbar-thumb-accent/20">
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
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent"
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
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent font-mono uppercase"
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
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="tag" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Premium Tag (Optional)</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. New, Bestseller, Archival"
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Archival Abstract</Label>
                <div className="rounded-2xl border border-accent/10 bg-white shadow-sm overflow-hidden focus-within:ring-0 focus-within:border-accent transition-all">
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="border-0 shadow-none focus-visible:ring-0 p-6 resize-none scrollbar-thin scrollbar-thumb-accent/10 hover:scrollbar-thumb-accent/20 h-full w-full"
                    placeholder="Describe the material integrity and architectural build..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Contribution ({storeCurrency})</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent"
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
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="brand" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Atelier / Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Maison Margiela"
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="sizes" className="text-[10px] font-black uppercase tracking-widest ml-1 text-primary/40">Dimensions</Label>
                  <Input
                    id="sizes"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="h-16 rounded-2xl border-accent/10 bg-white shadow-sm focus-visible:ring-0 focus-visible:border-accent"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>

              {/* Size Stocks Section */}
              <div className="space-y-6 bg-accent/5 p-8 rounded-[2.5rem] border border-accent/10">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-2 italic">Proportional Inventory Protocols</h4>
                  <p className="text-[9px] text-primary/40 italic">Assign specific quantity thresholds to each architectural dimension</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.sizes.split(',').map(s => s.trim()).filter(Boolean).map(size => (
                    <div key={size} className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest ml-1 text-primary/30">{size} Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.size_stocks[size] || 0}
                        onChange={(e) => {
                          const newStocks = { ...formData.size_stocks };
                          newStocks[size] = parseInt(e.target.value) || 0;

                          // Calculate total inventory
                          const total = Object.values(newStocks).reduce((a, b) => a + b, 0);
                          setFormData({
                            ...formData,
                            size_stocks: newStocks,
                            inventory: total.toString()
                          });
                        }}
                        className="h-12 rounded-xl border-accent/5 bg-white shadow-sm focus-visible:ring-accent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Size Protocol Builder</span>
                  <button
                    type="button"
                    onClick={() => setIsCloneVisible(!isCloneVisible)}
                    className="text-[9px] font-black uppercase tracking-widest text-accent hover:underline decoration-accent underline-offset-4"
                  >
                    {isCloneVisible ? '[ Close Protocol ]' : '[ Clone Protocol ]'}
                  </button>
                </div>

                {isCloneVisible && (
                  <div className="p-8 bg-accent/5 rounded-[2.5rem] border border-accent/10 animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                    <span className="text-accent text-[8px] font-black uppercase tracking-[0.4em] mb-4 block italic">Archival Data Transfer</span>
                    <Input
                      placeholder="Search by Designation or SKU to copy size chart..."
                      value={cloneSearch}
                      onChange={(e) => setCloneSearch(e.target.value)}
                      className="h-14 mb-4 rounded-2xl border-accent/10 bg-white/50 text-xs focus-visible:ring-0 focus-visible:border-accent"
                    />
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                      {products
                        .filter(p =>
                          cloneSearch.length >= 2 &&
                          (p.name.toLowerCase().includes(cloneSearch.toLowerCase()) ||
                            p.sku?.toLowerCase().includes(cloneSearch.toLowerCase()))
                        )
                        .map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                size_chart: p.size_chart || '',
                                size_chart_data: p.size_chart_data || null
                              });
                              setIsCloneVisible(false);
                              setCloneSearch('');
                              toast.success(`Protocol cloned from ${p.name}`);
                            }}
                            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-white transition-all text-left group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm border border-accent/5 flex-shrink-0">
                                {p.image_url ? (
                                  isVideo(p.image_url) ? (
                                    <video src={p.image_url} className="w-full h-full object-cover" muted />
                                  ) : (
                                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                  )
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-accent/5">
                                    <ImageIcon className="w-4 h-4 text-accent/20" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-primary">{p.name}</span>
                                <span className="text-[8px] text-primary/40 uppercase tracking-widest">SKU: {p.sku || p.id.slice(0, 8)}</span>
                              </div>
                            </div>
                            <Plus className="w-3 h-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      {cloneSearch.length >= 2 && products.filter(p => p.name.toLowerCase().includes(cloneSearch.toLowerCase()) || p.sku?.toLowerCase().includes(cloneSearch.toLowerCase())).length === 0 && (
                        <p className="text-[9px] text-primary/40 italic p-4">No matching protocols found.</p>
                      )}
                      {cloneSearch.length < 2 && (
                        <p className="text-[9px] text-primary/40 italic p-4 text-center">Inject 2+ characters to query the archive...</p>
                      )}
                    </div>
                  </div>
                )}

                <SizeChartBuilder
                  initialData={formData.size_chart_data}
                  onChange={(data) => setFormData({ ...formData, size_chart_data: data })}
                />
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
                          isVideo(imageUrl) ? (
                            <video
                              src={imageUrl}
                              className="w-full h-full object-cover rounded-xl"
                              muted
                              loop
                              playsInline
                            // No controls for thumbnail
                            />
                          ) : (
                            <img
                              src={imageUrl}
                              alt={`Visual ${index + 1}`}
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '0.3';
                              }}
                            />
                          )
                        ) : (
                          <ImageIcon className="w-5 h-5 text-accent/20" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          value={imageUrl}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          placeholder={index === 0 ? "Main Perspective URL (Required)" : `Perspective ${index + 1} (Optional)`}
                          className="h-14 rounded-2xl border-accent/5 bg-white/50 focus:bg-white transition-all text-xs focus-visible:ring-0 focus-visible:border-accent"
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
        <DialogContent className="max-w-4xl border-accent/10 bg-[#FFFAF5]/95 backdrop-blur-2xl p-0 shadow-2xl overflow-hidden rounded-[2rem]">
          {selectedProduct && (
            <div className="max-h-[85vh] overflow-y-auto p-8 sm:p-12 scrollbar-thin scrollbar-thumb-accent/10 hover:scrollbar-thumb-accent/20">
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
                      {isVideo(selectedProduct.images[0]) ? (
                        <video
                          src={selectedProduct.images[0]}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  {selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedProduct.images.slice(1).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden shadow-md border border-accent/5">
                          {isVideo(img) ? (
                            <video
                              src={img}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                            />
                          ) : (
                            <img src={img} alt={`Perspective ${idx + 2}`} className="w-full h-full object-cover" />
                          )}
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
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Architectural Dimensions</p>
                      <p className="text-[9px] text-accent italic">Inventory distribution across size metrics</p>
                    </div>
                    <SizeChart data={selectedProduct.size_chart_data || selectedProduct.size_chart} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {selectedProduct.sizes.map((size) => (
                      <div key={size} className="bg-white p-5 rounded-[2rem] border border-accent/5 shadow-sm hover:border-accent/20 transition-colors group/size">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2 group-hover/size:text-accent transition-colors">{size}</p>
                        <p className="text-2xl font-bold text-primary flex items-baseline gap-1">
                          {selectedProductStocks[size] ?? 0}
                          <span className="text-[10px] font-normal text-primary/40 uppercase tracking-tighter">Units</span>
                        </p>
                        <div className="w-full h-1 bg-accent/5 rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-1000"
                            style={{ width: `${Math.min(((selectedProductStocks[size] ?? 0) / 50) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
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

      {/* Premium Dissolution Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.2)] bg-white">
          <div className="p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-rose-500 animate-pulse">
              <Trash2 className="w-10 h-10" />
            </div>

            <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Artifact Dissolution</span>
            <h2 className="text-3xl font-bold tracking-tighter mb-4 leading-tight">
              Confirm <span className="italic font-light text-rose-500">Purge?</span>
            </h2>
            <p className="text-muted-foreground italic text-sm leading-relaxed mb-10 px-4">
              You are about to dissolve this artifact from the master catalog. This action is irreversible and will remove all associated archival data.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="h-14 rounded-2xl border-accent/10 text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
              >
                Abort
              </Button>
              <Button
                onClick={confirmDelete}
                className="h-14 rounded-2xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
              >
                Dissolve Artifact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminProducts;