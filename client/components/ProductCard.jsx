'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Loader2 } from 'lucide-react';

export default function ProductCard({ product }) {
    const [adding, setAdding] = useState(false);

    async function handleAdd(e) {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        // Add to cart logic will go here
        setTimeout(() => setAdding(false), 500);
    }

    const inStock = product.stock > 0;

    return (
        <Link href={`/products/${product.id}`} className="group block">
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-violet-200 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-200/50 hover:-translate-y-2">
                {/* Image Section */}
                <div className="relative overflow-hidden h-64 bg-gray-50 p-6">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart size={48} className="text-gray-200" />
                        </div>
                    )}
                    {!inStock && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                                Sold Out
                            </span>
                        </div>
                    )}
                    {product.category_name && (
                        <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-widest bg-white/90 text-violet-600 px-3 py-1.5 rounded-full border border-violet-50/50 shadow-sm backdrop-blur-md">
                            {product.category_name}
                        </span>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                    <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="font-black text-gray-900 leading-tight group-hover:text-violet-600 transition-colors">
                            {product.name}
                        </h3>
                    </div>
                    <p className="text-gray-400 text-xs font-medium line-clamp-2 min-h-[2rem]">{product.description}</p>

                    <div className="flex items-center justify-between mt-6">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-gray-900">
                                ${Number(product.price).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                {inStock ? `In Stock` : 'Unavailable'}
                            </span>
                        </div>
                        <button
                            disabled={!inStock || adding}
                            onClick={handleAdd}
                            className={`p-3 rounded-2xl transition-all duration-300 ${!inStock
                                    ? 'bg-gray-100 text-gray-300'
                                    : 'bg-gray-900 text-white hover:bg-violet-600 shadow-lg shadow-gray-200 hover:shadow-violet-200 active:scale-90'
                                }`}
                        >
                            {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 p-6 space-y-4">
            <div className="skeleton h-64 w-full" />
            <div className="space-y-2">
                <div className="skeleton h-6 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-4">
                <div className="skeleton h-8 w-24" />
                <div className="skeleton h-10 w-10 rounded-2xl" />
            </div>
        </div>
    );
}
