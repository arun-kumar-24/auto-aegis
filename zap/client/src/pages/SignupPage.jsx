import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Zap, Mail, Lock, User } from 'lucide-react';

const inputCls = `w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200
  placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all`;

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return;
        setLoading(true);
        try {
            await signup(form.name, form.email, form.password);
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
                    <h1 className="text-xl font-bold text-zinc-100 mb-1">Create an account</h1>
                    <p className="text-zinc-500 text-sm mb-6">Join Texus today</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><User size={11} /> Full Name</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange}
                                className={inputCls} placeholder="John Doe" required autoComplete="name" />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Mail size={11} /> Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange}
                                className={inputCls} placeholder="you@example.com" required autoComplete="email" />
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-1 flex items-center gap-1.5"><Lock size={11} /> Password</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange}
                                className={inputCls} placeholder="Min 6 characters" required minLength={6} autoComplete="new-password" />
                        </div>
                        <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                            Create Account
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-zinc-600 mt-5">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Log in</Link>
                </p>
            </div>
        </main>
    );
}
