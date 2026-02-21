import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Search, SlidersHorizontal, RefreshCw, AlertTriangle } from 'lucide-react';

const SKELETON_COUNT = 8;

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(false);
        Promise.all([
            api.get('/products'),
            api.get('/products/categories'),
        ])
            .then(([pRes, cRes]) => {
                const prods = pRes.data.products ?? pRes.data ?? [];
                const cats = cRes.data.categories ?? cRes.data ?? [];
                setProducts(Array.isArray(prods) ? prods : []);
                setCategories(Array.isArray(cats) ? cats : []);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = Array.isArray(products)
        ? products.filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesCat = activeCategory ? p.category_id === activeCategory : true;
            return matchesSearch && matchesCat;
        })
        : [];

    return (
        <main className="min-h-screen pt-24 pb-16 page-enter">
            {/* Hero */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-900/30 border border-violet-700/30 text-violet-300 text-xs font-medium">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                        New arrivals every week
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-100">
                        Find your perfect{' '}
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            setup
                        </span>
                    </h1>
                    <p className="text-zinc-500 max-w-xl mx-auto text-base">
                        Premium laptops and tech gear curated for performance and style.
                    </p>
                </div>

                {/* Search */}
                <div className="relative max-w-md mx-auto mt-8">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search products…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Category pills */}
                {categories.length > 0 && (
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <SlidersHorizontal size={14} className="text-zinc-500 flex-shrink-0" />
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${!activeCategory
                                ? 'bg-violet-600 border-violet-600 text-white'
                                : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-zinc-200'
                                }`}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${activeCategory === cat.id
                                    ? 'bg-violet-600 border-violet-600 text-white'
                                    : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-zinc-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid / Error / Empty */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: SKELETON_COUNT }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-14 h-14 rounded-full bg-red-900/20 border border-red-800/40 flex items-center justify-center">
                            <AlertTriangle size={26} className="text-red-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-zinc-300 font-medium">Failed to load products</p>
                            <p className="text-zinc-600 text-sm mt-1">The server may be experiencing issues. Try again.</p>
                        </div>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                        >
                            <RefreshCw size={14} /> Retry
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 text-zinc-600">
                        <Search size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No products match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </div>
        </main>
    );
}
