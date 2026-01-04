import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PremiumCheckbox } from '@/components/PremiumCheckbox';
import { toast } from 'sonner';
import {
    Plus,
    Trash2,
    Edit3,
    Check,
    X,
    Layers,
    Package,
    Search,
    Eye,
    Calendar,
    ArrowRight
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import { PremiumLoader } from '@/components/PremiumLoader';

interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
}

interface Product {
    id: string;
    name: string;
    image: string;
    category: string;
}

export default function AdminCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [viewingCollection, setViewingCollection] = useState<Collection | null>(null);
    const [isOverviewLoading, setIsOverviewLoading] = useState(false);
    const [overviewProducts, setOverviewProducts] = useState<Product[]>([]);
    const [collectionProducts, setCollectionProducts] = useState<string[]>([]); // product IDs
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [collectionToDeleteId, setCollectionToDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        is_active: true
    });

    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        fetchCollections();
        fetchProducts();
    }, []);

    const fetchCollections = async () => {
        const { data, error } = await supabase
            .from('collections')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) toast.error('Error fetching collections');
        else setCollections(data || []);
        setLoading(false);
    };

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, image_url, category')
            .eq('is_active', true);

        if (error) toast.error('Error fetching products');
        else setProducts((data || []).map(p => ({
            id: p.id,
            name: p.name,
            image: p.image_url || '',
            category: p.category
        })));
    };

    const fetchCollectionProducts = async (collectionId: string) => {
        const { data, error } = await supabase
            .from('collection_products')
            .select('product_id')
            .eq('collection_id', collectionId);

        if (error) toast.error('Error fetching collection products');
        else setCollectionProducts(data?.map(cp => cp.product_id) || []);
    };

    const handleEdit = (e: React.MouseEvent, collection: Collection) => {
        e.stopPropagation();
        setSelectedCollection(collection);
        setFormData({
            name: collection.name,
            slug: collection.slug,
            description: collection.description || '',
            is_active: collection.is_active
        });
        fetchCollectionProducts(collection.id);
        setIsEditing(true);
    };

    const handleViewOverview = async (collection: Collection) => {
        setOverviewProducts([]); // Clear previous artifacts to prevent registry lag
        setIsOverviewLoading(true);
        setViewingCollection(collection);
        const { data, error } = await supabase
            .from('collection_products')
            .select('product_id, products(id, name, image_url, category)')
            .eq('collection_id', collection.id);

        if (error) {
            toast.error('Error fetching collection content');
        } else {
            setOverviewProducts((data || []).map((item: any) => ({
                id: item.products.id,
                name: item.products.name,
                image: item.products.image_url || '',
                category: item.products.category
            })));
        }
        setIsOverviewLoading(false);
    };

    const resetForm = () => {
        setSelectedCollection(null);
        setFormData({ name: '', slug: '', description: '', is_active: true });
        setCollectionProducts([]);
        setIsEditing(false);
    };

    const saveCollection = async () => {
        if (!formData.name || !formData.slug) {
            toast.error('Name and Slug are required');
            return;
        }

        try {
            let collectionId = selectedCollection?.id;

            if (selectedCollection) {
                // Update collection
                const { error } = await supabase
                    .from('collections')
                    .update(formData)
                    .eq('id', selectedCollection.id);
                if (error) throw error;
            } else {
                // Create collection
                const { data, error } = await supabase
                    .from('collections')
                    .insert([formData])
                    .select();
                if (error) throw error;
                collectionId = data[0].id;
            }

            // Update products in collection
            if (collectionId) {
                // 1. Delete existing
                await supabase
                    .from('collection_products')
                    .delete()
                    .eq('collection_id', collectionId);

                // 2. Insert new
                if (collectionProducts.length > 0) {
                    const { error: insError } = await supabase
                        .from('collection_products')
                        .insert(collectionProducts.map(pId => ({
                            collection_id: collectionId!,
                            product_id: pId
                        })));
                    if (insError) throw insError;
                }
            }

            toast.success(selectedCollection ? 'Collection updated' : 'Collection created');
            fetchCollections();
            resetForm();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setCollectionToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!collectionToDeleteId) return;

        const { error } = await supabase
            .from('collections')
            .delete()
            .eq('id', collectionToDeleteId);

        if (error) toast.error('Error dissolving collection');
        else {
            toast.success('Collection dissolved from registry');
            fetchCollections();
        }
        setIsDeleteDialogOpen(false);
        setCollectionToDeleteId(null);
    };

    const toggleProduct = (productId: string) => {
        setCollectionProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <PremiumLoader message="Synchronizing Registry Archive..." />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <div className="flex justify-between items-end pb-8 border-b border-accent/10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter mb-2">Curate <span className="italic font-light text-accent">Collections</span></h1>
                    <p className="text-muted-foreground italic">Organize your artifacts into seasonal and thematic registries.</p>
                </div>
                {!isEditing && (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="rounded-full bg-primary text-white h-12 px-8 font-black uppercase tracking-widest text-[10px]"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Registry
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
                    {/* Collection Info */}
                    <div className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-accent/5 shadow-sm">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold uppercase tracking-widest">
                                {selectedCollection ? 'Edit Registry' : 'New Registry'}
                            </h2>
                            <Button variant="ghost" onClick={resetForm} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Registry Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. SPRING 25"
                                    className="rounded-2xl border-accent/10 h-14 bg-accent/[0.02]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Identifier (Slug)</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    placeholder="e.g. spring-25"
                                    className="rounded-2xl border-accent/10 h-14 bg-accent/[0.02]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-40">Registry Philosophy</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the essence of this collection..."
                                    className="rounded-2xl border-accent/10 min-h-[120px] bg-accent/[0.02]"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <PremiumCheckbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    label="ACTIVE IN SHOWROOM"
                                />
                            </div>

                            <Button
                                onClick={saveCollection}
                                className="w-full h-16 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all"
                            >
                                Seal & Secure Registry
                            </Button>
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-accent/5 shadow-sm overflow-hidden flex flex-col h-[700px]">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold uppercase tracking-widest">Select Artifacts</h2>
                            <span className="text-[10px] font-black text-accent bg-accent/5 px-4 py-2 rounded-full">
                                {collectionProducts.length} Secured
                            </span>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                            <Input
                                placeholder="Search Archive..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="pl-12 rounded-2xl border-accent/10 h-12"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => toggleProduct(product.id)}
                                    className={cn(
                                        "flex items-center p-4 rounded-3xl border cursor-pointer transition-all hover:border-accent group",
                                        collectionProducts.includes(product.id)
                                            ? "bg-accent/5 border-accent shadow-xl"
                                            : "bg-white border-accent/10"
                                    )}
                                >
                                    <div className="w-14 h-14 rounded-xl overflow-hidden mr-4 bg-accent/5">
                                        <img src={product.image} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={cn(
                                            "font-bold tracking-tight text-sm",
                                            collectionProducts.includes(product.id) ? "text-accent" : "text-primary"
                                        )}>
                                            {product.name}
                                        </h4>
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest italic opacity-40",
                                            collectionProducts.includes(product.id) ? "text-accent" : "text-primary"
                                        )}>
                                            {product.category}
                                        </p>
                                    </div>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                                        collectionProducts.includes(product.id)
                                            ? "bg-accent border-accent text-white"
                                            : "border-accent/10 group-hover:border-accent"
                                    )}>
                                        {collectionProducts.includes(product.id) ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Plus className="w-4 h-4 text-accent" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                    {collections.map(collection => (
                        <div
                            key={collection.id}
                            onClick={() => handleViewOverview(collection)}
                            className="bg-white p-8 rounded-[3rem] border border-accent/5 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden cursor-pointer"
                        >
                            {!collection.is_active && (
                                <div className="absolute top-6 right-6 px-4 py-1.5 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest rounded-full z-10">
                                    Archived
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="w-16 h-16 bg-accent/5 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-500">
                                    <Layers className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight mb-2">{collection.name}</h3>
                                <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] italic mb-4">
                                    /{collection.slug}
                                </p>
                                <p className="text-muted-foreground text-sm line-clamp-2 italic mb-10">
                                    {collection.description || 'No philosophy added yet.'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-accent/5">
                                <div className="flex items-center text-primary/40">
                                    <Package className="w-3.5 h-3.5 mr-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Secure Collection</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleEdit(e, collection)}
                                        className="w-10 h-10 rounded-full hover:bg-accent/5 hover:text-accent"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDeleteClick(e, collection.id)}
                                        className="w-10 h-10 rounded-full hover:bg-destructive/5 hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {collections.length === 0 && (
                        <div className="col-span-full py-32 text-center border-2 border-dashed border-accent/10 rounded-[4rem]">
                            <Layers className="w-16 h-16 text-accent/10 mx-auto mb-8" />
                            <h3 className="text-xl font-bold mb-2">No Registries Found</h3>
                            <p className="text-muted-foreground italic mb-10">Begin curating your first themed registry.</p>
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="rounded-full bg-primary text-white h-12 px-8 font-black uppercase tracking-widest text-[10px]"
                            >
                                Create First Registry
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Premium Overview Modal */}
            <Dialog open={!!viewingCollection} onOpenChange={() => setViewingCollection(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-[#FFFAF5]">
                    <div
                        data-lenis-prevent
                        className="flex flex-col lg:flex-row h-full max-h-[70vh] overflow-y-auto"
                    >
                        {/* Left: Info Section */}
                        <div className="lg:w-2/5 p-12 bg-white flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center mb-8">
                                    <Layers className="w-6 h-6 text-accent" />
                                </div>
                                <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Registry Overview</span>
                                <h2 className="font-heading text-4xl font-bold tracking-tighter mb-6 leading-tight">
                                    {viewingCollection?.name.split(' ')[0]} <br />
                                    <span className="italic font-light text-accent">
                                        {viewingCollection?.name.split(' ').slice(1).join(' ')}
                                    </span>
                                </h2>
                                <p className="text-muted-foreground italic text-sm leading-relaxed mb-8">
                                    {viewingCollection?.description || 'No philosophy added yet.'}
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-primary/40">
                                        <Package className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{overviewProducts.length} Secured Artifacts</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-primary/40">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Archived Segment</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-accent/5">
                                <a
                                    href={`/shop?registry=${viewingCollection?.slug}`}
                                    target="_blank"
                                    className="flex items-center justify-between group hover:text-accent transition-colors"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Live Showroom</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* Right: Product Grid */}
                        <div
                            className={cn(
                                "lg:w-3/5 p-12 lg:overflow-y-auto custom-scrollbar bg-accent/[0.02]",
                                isOverviewLoading && "flex items-center justify-center min-h-[400px]"
                            )}>
                            {isOverviewLoading ? (
                                <div className="scale-75 origin-center">
                                    <PremiumLoader message="Fetching Archive Content..." />
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/20 mb-8 italic">Registry Content /</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        {overviewProducts.map((product) => (
                                            <div key={product.id} className="group relative">
                                                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                    />
                                                    <div className="absolute rounded-b-3xl inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p className="text-white text-[10px] font-bold tracking-tight truncate">{product.name}</p>
                                                        <p className="text-white/60 text-[8px] font-black uppercase tracking-widest italic">{product.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {overviewProducts.length === 0 && (
                                            <div className="col-span-2 py-20 text-center opacity-30 italic">
                                                <Package className="w-10 h-10 mx-auto mb-4" />
                                                <p className="text-sm">Empty Registry</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Premium Dissolution Confirmation */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_50px_100px_rgba(0,0,0,0.2)] bg-white">
                    <div
                        data-lenis-prevent
                        className="p-10 text-center"
                    >
                        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-rose-500 animate-pulse">
                            <Trash2 className="w-10 h-10" />
                        </div>

                        <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block italic">Archival Dissolution</span>
                        <h2 className="text-3xl font-bold tracking-tighter mb-4 leading-tight">
                            Confirm <span className="italic font-light text-rose-500">Purge?</span>
                        </h2>
                        <p className="text-muted-foreground italic text-sm leading-relaxed mb-10 px-4">
                            You are about to dissolve this segmented registry. This action is irreversible and will remove the curation from the showroom.
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
                                Dissolve Registry
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
