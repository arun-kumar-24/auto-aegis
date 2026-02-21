import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, MapPin, CreditCard, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Confirm'];

const inputCls = `w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200
  placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all`;

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const [shipping, setShipping] = useState({ name: user?.name || '', address: '', city: '', postal: '', phone: '' });
    const [payment, setPayment] = useState({ card: '', expiry: '', cvc: '' });

    function updateShipping(e) { setShipping(s => ({ ...s, [e.target.name]: e.target.value })); }
    function updatePayment(e) { setPayment(p => ({ ...p, [e.target.name]: e.target.value })); }

    function validateShipping() {
        if (!shipping.name || !shipping.address || !shipping.city || !shipping.postal) {
            toast.error('Please fill in all shipping fields.'); return false;
        }
        return true;
    }

    function validatePayment() {
        if (!payment.card || !payment.expiry || !payment.cvc) {
            toast.error('Please fill in all payment fields.'); return false;
        }
        return true;
    }

    function nextStep() {
        if (step === 0 && !validateShipping()) return;
        if (step === 1 && !validatePayment()) return;
        setStep(s => s + 1);
    }

    async function placeOrder() {
        if (cartItems.length === 0) { toast.error('Your cart is empty.'); return; }
        setLoading(true);
        try {
            const res = await api.post('/orders', {
                shipping_address: `${shipping.address}, ${shipping.city}, ${shipping.postal}`,
                items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
            });
            setOrderId(res.data.order?.id || res.data.id);
            clearCart();
            setStep(2);
        } catch { /* interceptor handles toast */ }
        finally { setLoading(false); }
    }

    return (
        <main className="min-h-screen pt-24 pb-16 page-enter">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl font-bold text-zinc-100 mb-8">Checkout</h1>

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-10">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-violet-600 text-white' :
                                    i === step ? 'bg-violet-600 text-white ring-2 ring-violet-400/40' :
                                        'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                }`}>
                                {i < step ? <CheckCircle2 size={14} /> : i + 1}
                            </div>
                            <span className={`text-xs font-medium transition-colors ${i === step ? 'text-zinc-100' : i < step ? 'text-violet-400' : 'text-zinc-600'}`}>{s}</span>
                            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-zinc-700 ml-1" />}
                        </div>
                    ))}
                </div>

                {/* Step 0 — Shipping */}
                {step === 0 && (
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
                        <h2 className="font-semibold text-zinc-200 flex items-center gap-2"><MapPin size={16} className="text-violet-400" /> Shipping Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs text-zinc-500 mb-1 block">Full Name</label>
                                <input className={inputCls} name="name" value={shipping.name} onChange={updateShipping} placeholder="John Doe" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-zinc-500 mb-1 block">Street Address</label>
                                <input className={inputCls} name="address" value={shipping.address} onChange={updateShipping} placeholder="123 Main St" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">City</label>
                                <input className={inputCls} name="city" value={shipping.city} onChange={updateShipping} placeholder="Chennai" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Postal Code</label>
                                <input className={inputCls} name="postal" value={shipping.postal} onChange={updateShipping} placeholder="600001" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-zinc-500 mb-1 block">Phone (optional)</label>
                                <input className={inputCls} name="phone" value={shipping.phone} onChange={updateShipping} placeholder="+91 9876543210" />
                            </div>
                        </div>
                        <Button fullWidth onClick={nextStep}>Continue <ChevronRight size={14} /></Button>
                    </div>
                )}

                {/* Step 1 — Payment */}
                {step === 1 && (
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
                        <h2 className="font-semibold text-zinc-200 flex items-center gap-2"><CreditCard size={16} className="text-violet-400" /> Payment (Simulation)</h2>
                        <div className="bg-violet-900/20 border border-violet-800/30 rounded-lg px-4 py-2.5 text-xs text-violet-300">
                            🧪 This is a payment simulation. No real charge will be made.
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Card Number</label>
                                <input className={inputCls} name="card" value={payment.card} onChange={updatePayment} placeholder="4242 4242 4242 4242" maxLength={19} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Expiry</label>
                                    <input className={inputCls} name="expiry" value={payment.expiry} onChange={updatePayment} placeholder="MM/YY" maxLength={5} />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">CVC</label>
                                    <input className={inputCls} name="cvc" value={payment.cvc} onChange={updatePayment} placeholder="123" maxLength={4} type="password" />
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-zinc-800 pt-4 flex justify-between text-zinc-400 text-sm">
                            <span>Total due</span>
                            <span className="font-bold text-violet-400 text-lg">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setStep(0)}>Back</Button>
                            <Button fullWidth loading={loading} onClick={placeOrder}>Place Order</Button>
                        </div>
                    </div>
                )}

                {/* Step 2 — Confirmation */}
                {step === 2 && (
                    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center space-y-5">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-700/30 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100">Order Confirmed!</h2>
                            <p className="text-zinc-500 text-sm mt-1">Thank you for your purchase.</p>
                            {orderId && (
                                <p className="text-xs text-zinc-600 mt-2 font-mono">Order #{orderId}</p>
                            )}
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-4 text-sm text-zinc-400 flex items-start gap-2">
                            <Package size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
                            Your order is being processed and will ship within 2–4 business days.
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="ghost" fullWidth onClick={() => navigate('/')}>Continue Shopping</Button>
                            <Button fullWidth onClick={() => navigate('/orders')}>View Orders</Button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
