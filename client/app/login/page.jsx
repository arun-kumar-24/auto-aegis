'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            router.push('/');
        } catch (err) {
            console.error("Login failed", err);
        } finally {
            setLoading(false);
        }
    };

    const inputCls = `w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-900
        placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-200 transition-all font-medium`;

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6 page-enter">
            <div className="w-full max-w-[440px]">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10">
                    <Link href="/" className="group flex flex-col items-center">
                        <div className="w-14 h-14 bg-violet-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-violet-200 group-hover:scale-110 transition-transform duration-500">
                            <Zap size={28} className="text-white fill-current" />
                        </div>
                        <h1 className="mt-4 font-black text-2xl tracking-tighter text-gray-900 leading-none">TEXUS</h1>
                        <span className="mt-1 text-[10px] font-black text-violet-600 tracking-[0.3em] uppercase">Premium Protocol</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Access Control</h2>
                        <p className="text-gray-400 text-sm font-medium mt-1 mb-8">Identify yourself to continue</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Key (Email)</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-violet-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="operator@texus.io"
                                        className={`${inputCls} pl-14`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secret Sequence</label>
                                    <button type="button" className="text-[10px] font-black text-violet-600 uppercase tracking-widest hover:text-black transition-colors">Lost Access?</button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-violet-500 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="••••••••••••"
                                        className={`${inputCls} pl-14 pr-14`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                size="lg"
                                loading={loading}
                                className="h-16 mt-4 shadow-2xl shadow-violet-100"
                            >
                                Verify Identity <ArrowRight size={18} className="ml-1" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer link */}
                <div className="mt-8 text-center px-4">
                    <p className="text-gray-400 text-sm font-medium">
                        New Operator? {' '}
                        <Link href="/signup" className="text-gray-900 font-black hover:text-violet-600 transition-colors underline decoration-2 decoration-violet-100 underline-offset-4">
                            Request Enrollment
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
