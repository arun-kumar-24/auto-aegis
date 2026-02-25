'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup(form.name, form.email, form.password);
            router.push('/');
        } catch (err) {
            console.error("Signup failed", err);
        } finally {
            setLoading(false);
        }
    };

    const inputCls = `w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white
        placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500/30 transition-all font-medium`;

    return (
        <main className="min-h-screen bg-[#0a0a14] bg-hero-gradient flex items-center justify-center p-6 page-enter">
            <div className="w-full max-w-[440px]">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="group flex flex-col items-center">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-purple-900/40 group-hover:scale-110 transition-transform duration-500">
                            <Zap size={28} className="text-white fill-current" />
                        </div>
                        <h1 className="mt-4 font-black text-2xl tracking-tighter text-white leading-none">AutoAegis</h1>
                        <span className="mt-1 text-[10px] font-black text-violet-400 tracking-[0.3em] uppercase">Premium Protocol</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="glass-card rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-white tracking-tight">Request Enrollment</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1 mb-8">Join the elite network of operators</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Operator Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Alex Vance"
                                        className={`${inputCls} pl-14`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comm Channel (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="operator@autoaegis.io"
                                        className={`${inputCls} pl-14`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Sequence</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-violet-400 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Minimum 12 characters"
                                        className={`${inputCls} pl-14`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                <ShieldCheck className="text-emerald-400 mt-0.5" size={20} />
                                <p className="text-[10px] text-gray-500 font-bold leading-relaxed tracking-wider uppercase">
                                    By proceeding, you agree to the protocol terms and mutual non-disclosure agreement.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={loading}
                                className="h-16 mt-4"
                            >
                                Initialize Account <ArrowRight size={18} className="ml-1" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer link */}
                <div className="mt-8 text-center px-4">
                    <p className="text-gray-500 text-sm font-medium">
                        Already Enrolled? {' '}
                        <Link href="/login" className="text-white font-black hover:text-violet-400 transition-colors underline decoration-2 decoration-violet-500/30 underline-offset-4">
                            Resume Session
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
