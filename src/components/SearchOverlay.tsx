import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Package, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Product } from '@/data/products';

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && query.length >= 2) {
                navigate(`/shop?search=${query}`);
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults([]);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, query, navigate, onClose]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .ilike('name', `%${query}%`)
                .eq('is_active', true)
                .limit(6);

            if (!error && data) {
                const mapped = (data as any[]).map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    description: item.description,
                    category: item.category,
                    image: item.image_url || item.image,
                    badge: item.badge,
                    image_url: item.image_url,
                    images: item.images,
                    inventory: item.inventory,
                    is_active: item.is_active,
                    sizes: item.sizes,
                    tag: item.tag,
                    created_at: item.created_at,
                }));
                setResults(mapped as Product[]);
            }
            setLoading(false);
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-500">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Search Content */}
            <div className="absolute top-0 left-0 right-0 max-h-screen lg:max-h-none overflow-y-auto lg:overflow-visible bg-[#FFFAF5] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-b border-accent/10 animate-in slide-in-from-top duration-700">
                <div className="container mx-auto px-4 py-8 lg:py-12">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-accent animate-pulse" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search the Archive..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-transparent border-none text-4xl lg:text-6xl font-heading font-bold tracking-tighter pl-14 focus:outline-none placeholder:text-primary/10"
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-4 rounded-full bg-accent/5 hover:bg-accent/10 transition-colors group"
                        >
                            <X className="w-8 h-8 text-primary/40 group-hover:text-primary group-hover:rotate-90 transition-all duration-500" />
                        </button>
                    </div>

                    {/* Results Area */}
                    <div className="min-h-[300px] mb-8">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/40 italic">Scanning Catalog...</span>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {results.map((product) => (
                                    <Link
                                        key={product.id}
                                        to={`/product/${product.id}`}
                                        onClick={onClose}
                                        className="group flex items-center gap-6 p-6 rounded-[2rem] bg-white border border-accent/5 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
                                    >
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-accent/5 shrink-0">
                                            {product.image ? (
                                                <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-accent/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-1 italic">/{product.category}</p>
                                            <h4 className="font-heading text-xl font-bold tracking-tight truncate group-hover:text-accent transition-colors">{product.name}</h4>
                                            <p className="text-lg font-black tracking-tighter text-primary/40 mt-1">${product.price}</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-primary/20 group-hover:text-accent group-hover:translate-x-2 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        )}

                        {!loading && query.length >= 2 && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-accent/10 rounded-[3rem]">
                                <Package className="w-12 h-12 text-accent/10 mb-6" />
                                <h3 className="font-heading text-2xl font-bold tracking-tight mb-2">No Artifacts Found</h3>
                                <p className="text-muted-foreground italic">Try refining your search identifiers.</p>
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="mt-12 flex justify-center">
                                <Link
                                    to={`/shop?search=${query}`}
                                    onClick={onClose}
                                    className="px-10 py-4 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent hover:shadow-2xl transition-all flex items-center gap-4 group"
                                >
                                    View All Search Results
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Tags */}
                    <div className="flex flex-wrap items-center gap-4 text-primary/40">
                        <span className="text-[10px] font-black uppercase tracking-widest mr-4 italic">Popular Registry Keywords:</span>
                        {['Archival', 'Spring', 'Seance', 'Minimalist', 'Maison'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setQuery(tag)}
                                className="px-6 py-2 rounded-full border border-accent/10 text-[9px] font-black uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
