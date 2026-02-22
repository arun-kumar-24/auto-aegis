'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ShoppingCart, Menu, X, LogOut, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Mock cart for now
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
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center group-hover:bg-violet-700 transition-all duration-300 shadow-lg shadow-violet-200">
                        <Zap size={20} className="text-white fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-xl tracking-tighter text-gray-900 leading-none">TEXUS</span>
                        <span className="text-[9px] font-bold text-violet-600 tracking-[0.2em] uppercase">Premium Tech</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100">
                    <Link href="/" className="px-5 py-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all">
                        Home
                    </Link>
                    <button
                        onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-5 py-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
                    >
                        Dashboard
                    </button>
                    {user && (
                        <Link href="/orders" className="px-5 py-2 text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all flex items-center gap-2">
                            <Package size={14} /> Orders
                        </Link>
                    )}
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-3">
                    {/* Cart Trigger */}
                    <button
                        className="relative p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all group"
                        aria-label="Open cart"
                    >
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-violet-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </button>

                    {/* Authentication / Profile */}
                    <div className="hidden md:block h-8 w-px bg-gray-100 mx-2" />

                    {user ? (
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-black text-gray-900 leading-none">{user.name || 'Account'}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Member</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-3 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all"
                                title="Sign out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login" className="px-6 py-2.5 text-xs font-black uppercase tracking-wider text-gray-900 hover:bg-gray-100 rounded-2xl transition-all">
                                Log In
                            </Link>
                            <Link href="/signup" className="px-6 py-2.5 text-xs font-black uppercase tracking-wider bg-gray-900 hover:bg-black text-white rounded-2xl transition-all shadow-lg shadow-gray-200 active:scale-95">
                                Join Now
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-3 bg-gray-100 text-gray-500 rounded-2xl"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-6 py-8 space-y-4 animate-in slide-in-from-top duration-300">
                    <Link href="/" onClick={() => setMobileOpen(false)} className="block text-sm font-black uppercase tracking-widest text-gray-900">Home</Link>
                    <button
                        onClick={() => {
                            setMobileOpen(false);
                            document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="block text-sm font-black uppercase tracking-widest text-gray-900 text-left"
                    >
                        Dashboard
                    </button>
                    {user && <Link href="/orders" onClick={() => setMobileOpen(false)} className="block text-sm font-black uppercase tracking-widest text-gray-900">Order History</Link>}
                    <div className="pt-4 border-t border-gray-50">
                        {user ? (
                            <button onClick={handleLogout} className="w-full text-left py-3 text-sm font-black uppercase tracking-widest text-red-500">Sign Out</button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-12 border border-gray-100 rounded-2xl text-xs font-black uppercase tracking-widest">Login</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center h-12 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest">Join</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
