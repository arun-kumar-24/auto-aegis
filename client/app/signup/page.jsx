'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, Lock, User, ArrowRight, ShieldCheck, Activity, Globe, Fingerprint } from 'lucide-react';
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

    const inputBase = "w-full bg-[#12121e] border border-white/[0.06] rounded-xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/25 transition-all duration-300 font-medium hover:border-white/10";

    return (
        <main className="min-h-screen bg-[#0a0a14] flex page-enter">

            {/* ─── Left Panel: Brand & Visuals ─── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-16">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e1a] via-[#12121e] to-[#0a0a14]" />
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[150px] animate-glow-pulse" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-emerald-700/5 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-cyan-500/3 rounded-full blur-[100px]" />

                <div className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Top: Logo */}
                <div className="relative z-10">
                    <Link href="/" className="group inline-flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/30 group-hover:scale-105 transition-transform duration-500">
                            <Zap size={22} className="text-white fill-current" />
                        </div>
                        <div>
                            <h1 className="font-black text-xl tracking-tighter text-white leading-none">AutoAegis</h1>
                            <span className="text-[8px] font-black text-violet-400/60 tracking-[0.3em] uppercase">Security Protocol</span>
                        </div>
                    </Link>
                </div>

                {/* Center: Value proposition */}
                <div className="relative z-10 space-y-10 max-w-lg">
                    <div className="space-y-6">
                        <h2 className="text-4xl font-black text-white tracking-tight leading-[1.1]">
                            Start protecting your <span className="text-gradient-purple">Golden Paths</span> today.
                        </h2>
                        <p className="text-gray-500 text-base font-medium leading-relaxed">
                            Set up takes 30 seconds. No code changes required. Just interact with your app and our Shadow Recorder does the rest.
                        </p>
                    </div>

                    {/* Mini feature cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <Fingerprint size={18} />, label: 'Shadow Recording', color: 'violet' },
                            { icon: <Activity size={18} />, label: 'Live Monitoring', color: 'emerald' },
                            { icon: <Globe size={18} />, label: '20+ Regions', color: 'cyan' },
                            { icon: <ShieldCheck size={18} />, label: 'Zero PII Leakage', color: 'amber' },
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                    ${feat.color === 'violet' ? 'bg-violet-500/10 text-violet-400' : ''}
                                    ${feat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : ''}
                                    ${feat.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' : ''}
                                    ${feat.color === 'amber' ? 'bg-amber-500/10 text-amber-400' : ''}
                                `}>
                                    {feat.icon}
                                </div>
                                <span className="text-xs font-bold text-gray-300">{feat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom: Trust signals */}
                <div className="relative z-10 flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-purple-600/30 border-2 border-[#12121e] flex items-center justify-center">
                                    <span className="text-[8px] font-black text-violet-300/60">{String.fromCharCode(64 + i)}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/70 uppercase tracking-wide">Join 200+</p>
                            <p className="text-[9px] font-bold text-gray-600">engineering teams</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wide">Free Tier</p>
                        <p className="text-[9px] font-bold text-gray-600">No credit card needed</p>
                    </div>
                </div>
            </div>

            {/* ─── Right Panel: Signup Form ─── */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative">
                <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />

                <div className="w-full max-w-[420px] space-y-10">

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex flex-col items-center mb-6">
                        <Link href="/" className="group flex flex-col items-center">
                            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-700 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-purple-900/40 group-hover:scale-110 transition-transform duration-500">
                                <Zap size={28} className="text-white fill-current" />
                            </div>
                            <h1 className="mt-4 font-black text-2xl tracking-tighter text-white leading-none">AutoAegis</h1>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.15em]">New Account</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Create your account</h2>
                        <p className="text-gray-500 text-sm font-medium">Start monitoring in under 30 seconds.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                                    <User className="text-gray-600 group-focus-within:text-violet-400 transition-colors duration-300" size={16} />
                                </div>
                                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Alex Vance" className={`${inputBase} pl-12`} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                                    <Mail className="text-gray-600 group-focus-within:text-violet-400 transition-colors duration-300" size={16} />
                                </div>
                                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@company.com" className={`${inputBase} pl-12`} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                                    <Lock className="text-gray-600 group-focus-within:text-violet-400 transition-colors duration-300" size={16} />
                                </div>
                                <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className={`${inputBase} pl-12`} />
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <ShieldCheck className="text-emerald-400/60 mt-0.5 flex-shrink-0" size={16} />
                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                By creating an account, you agree to our <span className="text-gray-400">Terms of Service</span> and <span className="text-gray-400">Privacy Policy</span>.
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-purple-900/25 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* SSO */}
                    <button
                        type="button"
                        className="w-full h-12 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs font-bold text-gray-400 uppercase tracking-widest hover:bg-white/[0.06] hover:border-white/10 hover:text-gray-300 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Continue with Google
                    </button>

                    {/* Footer */}
                    <p className="text-center text-gray-500 text-sm font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
