import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, ShoppingBag, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { SkeletonBlock } from '../components/SkeletonLoader';

function OrderRow({ order }) {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(order.order_items || []);
    const [loading, setLoading] = useState(false);
    const [itemError, setItemError] = useState(false);

    async function toggleExpand() {
        if (!open && items.length === 0) {
            setLoading(true);
            setItemError(false);
            try {
                const res = await api.get(`/orders/${order.id}/items`);
                setItems(res.data.items || []);
            } catch {
                setItemError(true);
            }
            finally { setLoading(false); }
        }
        setOpen(o => !o);
    }

    const statusColors = {
        pending: 'text-amber-400 bg-amber-900/20 border-amber-800/40',
        processing: 'text-blue-400 bg-blue-900/20 border-blue-800/40',
        shipped: 'text-violet-400 bg-violet-900/20 border-violet-800/40',
        delivered: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40',
        cancelled: 'text-red-400 bg-red-900/20 border-red-800/40',
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
            <button onClick={toggleExpand} className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package size={18} className="text-violet-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-zinc-200 font-mono">#{order.id}</p>
                        <p className="text-xs text-zinc-600 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusColors[order.status] || statusColors.pending}`}>
                        {order.status || 'pending'}
                    </span>
                    <span className="text-sm font-bold text-violet-400">${Number(order.total_amount || order.total || 0).toFixed(2)}</span>
                    {open ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-zinc-800 px-5 py-4 space-y-3">
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2].map(i => <SkeletonBlock key={i} className="h-12" />)}
                        </div>
                    ) : itemError ? (
                        <p className="text-xs text-red-400 flex items-center gap-1.5">
                            <AlertTriangle size={12} /> Failed to load order items — please try again.
                        </p>
                    ) : items.length === 0 ? (
                        <p className="text-xs text-zinc-600">No items found.</p>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                                <div>
                                    <p className="text-sm text-zinc-300">{item.product_name || item.name || `Product #${item.product_id}`}</p>
                                    <p className="text-xs text-zinc-600 mt-0.5">Qty: {item.quantity}</p>
                                </div>
                                <span className="text-sm font-semibold text-zinc-300">${Number(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))
                    )}
                    {order.shipping_address && (
                        <p className="text-xs text-zinc-600 mt-2 pt-2 border-t border-zinc-800/50">
                            📦 Ships to: {order.shipping_address}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchOrders = useCallback(() => {
        if (!user) { navigate('/login'); return; }
        setLoading(true);
        setError(false);
        api.get('/orders')
            .then((res) => setOrders(res.data.orders || res.data || []))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    return (
        <main className="min-h-screen pt-24 pb-16 page-enter">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-bold text-zinc-100 mb-8 flex items-center gap-2">
                    <Package size={22} className="text-violet-400" /> My Orders
                </h1>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-20 rounded-2xl" />)}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-14 h-14 rounded-full bg-red-900/20 border border-red-800/40 flex items-center justify-center">
                            <AlertTriangle size={26} className="text-red-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-zinc-300 font-medium">Failed to load orders</p>
                            <p className="text-zinc-600 text-sm mt-1">The server may be experiencing issues. Try again.</p>
                        </div>
                        <button
                            onClick={fetchOrders}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                        >
                            <RefreshCw size={14} /> Retry
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                        <ShoppingBag size={48} className="mx-auto text-zinc-700" />
                        <p className="text-zinc-500">You haven't placed any orders yet.</p>
                        <Button variant="ghost" onClick={() => navigate('/')}>Start Shopping</Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => <OrderRow key={order.id} order={order} />)}
                    </div>
                )}
            </div>
        </main>
    );
}
