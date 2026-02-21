import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Zap, Mail, Lock } from 'lucide-react';

const inputCls = `w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200
  placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all`;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.email || !form.password) return;
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch { /* error toast from api.js interceptor */ }
        finally { setLoading(false); }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 page-enter">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
                        <Zap size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-xl text-zinc-100">Texus</span>
                </div>

                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
                    <h1 className="text-xl font-bold text-zinc-100 mb-1">Welcome back</h1>
                    <p className="text-zinc-500 text-sm mb-6">Sign in to your account</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Mail size={11} /> Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange}
                                className={inputCls} placeholder="you@example.com" required autoComplete="email" />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Lock size={11} /> Password</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange}
                                className={inputCls} placeholder="••••••••" required autoComplete="current-password" />
                        </div>
                        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                            Sign In
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-zinc-600 mt-5">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign up</Link>
                </p>
            </div>
        </main>
    );
}
