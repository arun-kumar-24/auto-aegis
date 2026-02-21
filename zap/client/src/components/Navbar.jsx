import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, LogIn, LogOut, User, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    function handleLogout() {
        logout();
        navigate('/');
        setMobileOpen(false);
    }

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 shadow-xl' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* Brand */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center group-hover:bg-violet-500 transition-colors">
                        <Zap size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-100">Texus</span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-1">
                    <Link to="/" className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-all">
                        Products
                    </Link>
                    {user && (
                        <Link to="/orders" className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-1.5">
                            <Package size={14} /> My Orders
                        </Link>
                    )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Cart */}
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-2 text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 rounded-lg transition-all"
                        aria-label="Open cart"
                    >
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </button>

                    {/* Auth */}
                    {user ? (
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-sm text-zinc-400 flex items-center gap-1.5">
                                <User size={14} />{user.name || user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all"
                            >
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link to="/login" className="px-4 py-2 text-sm text-zinc-300 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-all">
                                Log in
                            </Link>
                            <Link to="/signup" className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all font-medium">
                                Sign up
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-lg"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-4 space-y-2">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg">Products</Link>
                    {user && <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg">My Orders</Link>}
                    {user ? (
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 rounded-lg">Logout</button>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg">Log in</Link>
                            <Link to="/signup" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-violet-400 hover:bg-zinc-800 rounded-lg font-medium">Sign up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
