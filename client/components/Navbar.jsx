'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ShoppingCart, Menu, X, LogOut, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const cartCount = 0;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
    };

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.3)]' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-900/40">
                        <Zap size={20} className="text-white fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl tracking-tighter text-white leading-none">AutoAegis</span>
                        <span className="text-[9px] font-bold text-violet-400 tracking-[0.2em] uppercase">Premium Tech</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <Link href="/" className="px-5 py-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        Home
                    </Link>
                    <button
                        onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-5 py-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        Dashboard
                    </button>
                    {user && (
                        <Link href="/orders" className="px-5 py-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2">
                            <Package size={14} /> Orders
                        </Link>
                    )}
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-3">
                    {/* Cart Trigger */}
                    <button
                        className="relative p-3 text-gray-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all group"
                        aria-label="Open cart"
                    >
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-violet-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0a0a14] shadow-sm">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </button>

                    {/* Authentication / Profile */}
                    <div className="hidden md:block h-8 w-px bg-white/10 mx-2" />

                    {user ? (
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-3 pl-3 pr-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center text-white text-xs font-black uppercase shadow-sm">
                                    {(user.name || user.email || '?').charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-white leading-none truncate max-w-[120px]">
                                        {user.name || user.email?.split('@')[0] || 'Account'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-500 truncate max-w-[120px]">{user.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-2xl transition-all border border-white/5 hover:border-red-500/20"
                                title="Sign out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                                <Link href="/login" className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                Log In
                            </Link>
                                <Link href="/signup" className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-2xl transition-all shadow-lg shadow-purple-900/30 active:scale-95">
                                Join Now
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-3 bg-white/10 text-gray-400 rounded-2xl"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0a0a14]/95 backdrop-blur-xl border-t border-white/5 px-6 py-8 space-y-4 animate-in slide-in-from-top duration-300">
                    <Link href="/" onClick={() => setMobileOpen(false)} className="block text-sm font-black uppercase tracking-widest text-white">Home</Link>
                    <button
                        onClick={() => {
                            setMobileOpen(false);
                            document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="block text-sm font-black uppercase tracking-widest text-white text-left"
                    >
                        Dashboard
                    </button>
                    {user && <Link href="/orders" onClick={() => setMobileOpen(false)} className="block text-sm font-black uppercase tracking-widest text-white">Order History</Link>}
                    <div className="pt-4 border-t border-white/10">
                        {user ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center text-white text-sm font-black uppercase shadow-sm">
                                        {(user.name || user.email || '?').charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white">{user.name || user.email?.split('@')[0]}</span>
                                        <span className="text-xs text-gray-500">{user.email}</span>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left py-3 text-sm font-black uppercase tracking-widest text-red-400">Sign Out</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-12 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-300">Login</Link>
                                    <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-12 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Join</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
