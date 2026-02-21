import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

export default function CartDrawer() {
    const { cartItems, cartTotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
    const navigate = useNavigate();

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isCartOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isCartOpen]);

    function handleCheckout() {
        setIsCartOpen(false);
        navigate('/checkout');
    }

    return (
        <>
            {/* Overlay */}
            <div
                onClick={() => setIsCartOpen(false)}
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            />

            {/* Drawer */}
            <aside className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                        <ShoppingBag size={20} className="text-violet-400" />
                        Cart
                        {cartItems.length > 0 && (
                            <span className="text-sm text-zinc-500">({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                        )}
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 pt-16">
                            <ShoppingBag size={48} className="text-zinc-700" />
                            <p className="text-zinc-500 text-sm">Your cart is empty</p>
                            <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(false)}>Continue Shopping</Button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.product_id} className="flex gap-3 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                                <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag size={20} className="text-zinc-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-200 truncate">{item.name}</p>
                                    <p className="text-violet-400 text-sm font-semibold mt-0.5">${Number(item.price).toFixed(2)}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="p-1 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-30" disabled={item.quantity <= 1}>
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-sm font-medium w-5 text-center text-zinc-200">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all">
                                            <Plus size={12} />
                                        </button>
                                        <button onClick={() => removeFromCart(item.product_id)} className="ml-auto p-1 rounded-md hover:bg-red-900/30 text-zinc-600 hover:text-red-400 transition-all">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="px-6 py-5 border-t border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">Subtotal</span>
                            <span className="text-xl font-bold text-zinc-100">${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button fullWidth size="lg" onClick={handleCheckout}>
                            Checkout
                        </Button>
                    </div>
                )}
            </aside>
        </>
    );
}
