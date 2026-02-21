import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // ── Load cart from DB when user logs in ──────────────────────
    useEffect(() => {
        if (user) {
            api.get('/cart')
                .then((res) => setCartItems(res.data.items || []))
                .catch(() => {
                    // Cart load failed (chaos / network) — stay with local state
                    toast('Could not load cart from server. Using local cart.', {
                        icon: '⚠️',
                        duration: 3000,
                    });
                });
        } else {
            setCartItems([]);
        }
    }, [user]);

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = useCallback(async (product, quantity = 1) => {
        // Optimistic update first — UI is always responsive
        setCartItems((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { product_id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity }];
        });
        toast.success(`${product.name} added to cart!`);

        if (user) {
            await api.post('/cart', { product_id: product.id, quantity }).catch(() => {
                toast('Cart item saved locally — server sync failed.', {
                    icon: '⚠️',
                    duration: 3000,
                });
            });
        }
    }, [user]);

    const removeFromCart = useCallback(async (productId) => {
        setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
        if (user) {
            await api.delete(`/cart/${productId}`).catch(() => {
                toast('Removal saved locally — server sync failed.', {
                    icon: '⚠️',
                    duration: 3000,
                });
            });
        }
    }, [user]);

    const updateQuantity = useCallback(async (productId, quantity) => {
        if (quantity < 1) return;
        setCartItems((prev) =>
            prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
        );
        if (user) {
            await api.patch(`/cart/${productId}`, { quantity }).catch(() => {
                toast('Quantity saved locally — server sync failed.', {
                    icon: '⚠️',
                    duration: 3000,
                });
            });
        }
    }, [user]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    return (
        <CartContext.Provider value={{
            cartItems, cartTotal, cartCount,
            isCartOpen, setIsCartOpen,
            addToCart, removeFromCart, updateQuantity, clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside <CartProvider>');
    return ctx;
}
