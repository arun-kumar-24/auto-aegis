import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import Button from '../components/Button';
import { SkeletonBlock, SkeletonText } from '../components/SkeletonLoader';
import { ArrowLeft, Package, ShoppingCart, Tag } from 'lucide-react';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [qty, setQty] = useState(1);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then((res) => setProduct(res.data.product || res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    async function handleAdd() {
        if (!product) return;
        setAdding(true);
        await addToCart(product, qty);
        setAdding(false);
    }

    if (loading) {
        return (
            <main className="min-h-screen pt-24 pb-16 page-enter">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <SkeletonBlock className="h-96" />
                        <div className="space-y-4 pt-4">
                            <SkeletonBlock className="h-8 w-3/4" />
                            <SkeletonBlock className="h-4 w-1/3" />
                            <SkeletonText lines={4} />
                            <SkeletonBlock className="h-12 w-full mt-6" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Package size={48} className="mx-auto text-zinc-700" />
                    <p className="text-zinc-500">Product not found.</p>
                    <Button variant="ghost" onClick={() => navigate('/')}>Go back</Button>
                </div>
            </main>
        );
    }

    const inStock = product.stock > 0;

    return (
        <main className="min-h-screen pt-24 pb-16 page-enter">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-200 mb-8 transition-colors">
                    <ArrowLeft size={14} /> Back
                </button>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 h-96 flex items-center justify-center">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <ShoppingCart size={60} className="text-zinc-700" />
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-5 pt-2">
                        {product.category_name && (
                            <div className="flex items-center gap-1.5 text-xs text-violet-400">
                                <Tag size={12} /> {product.category_name}
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-zinc-100">{product.name}</h1>
                        <p className="text-zinc-400 leading-relaxed">{product.description}</p>

                        <div className="flex items-center gap-4">
                            <span className="text-3xl font-extrabold text-violet-400">${Number(product.price).toFixed(2)}</span>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${inStock ? 'text-emerald-400 border-emerald-800 bg-emerald-900/20' : 'text-red-400 border-red-900 bg-red-900/20'
                                }`}>
                                {inStock ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                        </div>

                        {/* Qty */}
                        {inStock && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-zinc-500">Qty:</span>
                                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-zinc-400 hover:text-zinc-100 text-lg font-bold w-5">−</button>
                                    <span className="text-sm font-medium text-zinc-200 w-6 text-center">{qty}</span>
                                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="text-zinc-400 hover:text-zinc-100 text-lg font-bold w-5">+</button>
                                </div>
                            </div>
                        )}

                        <Button size="lg" loading={adding} disabled={!inStock} onClick={handleAdd} className="w-full sm:w-auto">
                            <ShoppingCart size={16} /> {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
