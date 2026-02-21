import { ShoppingCart, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import Button from './Button';
import { SkeletonCard } from './SkeletonLoader';
import { Link } from 'react-router-dom';

export function ProductCardSkeleton() {
    return <SkeletonCard />;
}

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const [adding, setAdding] = useState(false);

    async function handleAdd(e) {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        await addToCart(product);
        setAdding(false);
    }

    const inStock = product.stock > 0;

    return (
        <Link to={`/products/${product.id}`} className="group block">
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-violet-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-violet-900/20 hover:-translate-y-1">
                {/* Image */}
                <div className="relative overflow-hidden h-52 bg-zinc-800">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart size={40} className="text-zinc-700" />
                        </div>
                    )}
                    {!inStock && (
                        <div className="absolute inset-0 bg-zinc-950/70 flex items-center justify-center">
                            <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
                                Out of Stock
                            </span>
                        </div>
                    )}
                    {product.category_name && (
                        <span className="absolute top-3 left-3 text-xs font-medium bg-violet-600/90 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {product.category_name}
                        </span>
                    )}
                </div>

                {/* Details */}
                <div className="p-4">
                    <h3 className="font-semibold text-zinc-100 truncate group-hover:text-violet-300 transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-0.5 truncate">{product.description}</p>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-violet-400">
                            ${Number(product.price).toFixed(2)}
                        </span>
                        <span className="text-xs text-zinc-600">{inStock ? `${product.stock} left` : ''}</span>
                    </div>
                    <Button
                        fullWidth
                        size="sm"
                        loading={adding}
                        disabled={!inStock}
                        onClick={handleAdd}
                        className="mt-3"
                    >
                        <Plus size={14} /> Add to Cart
                    </Button>
                </div>
            </div>
        </Link>
    );
}
