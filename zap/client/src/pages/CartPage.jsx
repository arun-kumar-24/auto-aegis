import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';

export default function CartPage() {
    const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen pt-24 flex items-center justify-center page-enter">
                <div className="text-center space-y-4">
                    <ShoppingBag size={56} className="mx-auto text-zinc-700" />
                    <h2 className="text-xl font-semibold text-zinc-300">Your cart is empty</h2>
                    <p className="text-zinc-600 text-sm">Add some products to get started.</p>
                    <Link to="/">
                        <Button className="mt-2">Browse Products</Button>
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 page-enter">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-zinc-100 mb-8 flex items-center gap-2">
                    <ShoppingBag size={22} className="text-violet-400" /> Shopping Cart
                </h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.product_id} className="flex gap-4 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                                <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag size={24} className="text-zinc-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-zinc-200 truncate">{item.name}</p>
                                    <p className="text-violet-400 font-semibold mt-1">${Number(item.price).toFixed(2)}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-1.5 border border-zinc-700">
                                            <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1} className="text-zinc-400 hover:text-zinc-100 disabled:opacity-30">
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-sm font-medium text-zinc-200 w-5 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="text-zinc-400 hover:text-zinc-100">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <span className="text-sm text-zinc-500 ml-1">
                                            = ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                        <button onClick={() => removeFromCart(item.product_id)} className="ml-auto text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-900/20">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 h-fit space-y-4 sticky top-24">
                        <h2 className="font-semibold text-zinc-200">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            {cartItems.map((item) => (
                                <div key={item.product_id} className="flex justify-between text-zinc-500">
                                    <span className="truncate max-w-[140px]">{item.name} ×{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-zinc-100">
                            <span>Total</span>
                            <span className="text-violet-400">${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button fullWidth size="lg" onClick={() => navigate('/checkout')}>
                            Checkout <ArrowRight size={15} />
                        </Button>
                        <Link to="/" className="block text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
