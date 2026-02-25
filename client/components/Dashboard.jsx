'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Activity,
    Plus,
    Globe,
    Shield,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock,
    MoreVertical,
    RefreshCw,
    X,
    Layout,
    LogOut,
    Zap,
    BadgeCheck,
    TrendingUp,
    MapPin,
    ExternalLink,
    BarChart3,
    Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';
import MonitorDetailPopup from './MonitorDetailPopup';

const SERVER_LOCATIONS = [
    "Bangalore", "Mumbai", "Delhi", "Colombo", "Singapore",
    "Kuala Lumpur", "Jakarta", "Bangkok", "Dubai", "Riyadh",
    "Tokyo", "Seoul", "Taipei", "Manila", "Sydney",
    "London", "Frankfurt", "Paris", "Amsterdam", "Madrid", "Rome",
    "New York", "Washington DC", "Chicago", "San Francisco", "Seattle", "Toronto",
    "Sao Paulo", "Buenos Aires", "Cape Town", "Nairobi", "Lagos"
];

/* ─── Monitor Card ─── */
function MonitorCard({ monitor, onUpdate, onViewDetails }) {
    const isActive = monitor.is_active;

    return (
        <div className="group relative bg-[#12121e] border border-white/[0.06] rounded-2xl p-6 hover:border-violet-500/20 hover:bg-[#16162a] transition-all duration-300">
            {/* Status indicator bar */}
            <div className={`absolute top-0 left-6 right-6 h-px ${isActive ? 'bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-600/30 to-transparent'}`} />

            <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${isActive ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' : 'bg-gray-500/10 border-gray-500/15 text-gray-500'}`}>
                    <Globe size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                        <h3 className="text-white font-bold text-sm truncate">{monitor.name}</h3>
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50' : 'bg-gray-600'}`} />
                    </div>
                    <p className="text-gray-600 text-xs font-medium truncate mt-1">{monitor.target_url}</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                    { label: 'Uptime', value: '99.9%', color: 'text-emerald-400' },
                    { label: 'Latency', value: '42ms', color: 'text-white' },
                    { label: 'Region', value: monitor.server_location?.split(' ')[0] || '—', color: 'text-violet-400' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-sm font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                    <Clock size={11} />
                    Checked just now
                </div>
                <button
                    onClick={() => onViewDetails(monitor)}
                    className="flex items-center gap-1 text-[10px] font-black text-violet-400 uppercase tracking-widest hover:text-violet-300 transition-colors group/btn"
                >
                    Details <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}

/* ─── New Monitor Modal ─── */
function NewMonitorModal({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [serverLocation, setServerLocation] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/monitors', { name, target_url: url, server_location: serverLocation });
            toast.success('Monitor deployed successfully');
            onSuccess();
            onClose();
            setName('');
            setUrl('');
            setServerLocation('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create monitor');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-5 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/25 transition-all duration-300 font-medium hover:border-white/10";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0a14]/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-[#12121e] border border-white/[0.06] rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">New Monitor</h2>
                            <p className="text-gray-500 text-sm font-medium mt-1">Configure your instance settings</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-gray-300 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Instance Name</label>
                            <input
                                required value={name} onChange={e => setName(e.target.value)}
                                placeholder="e.g. Production Checkout"
                                className={inputCls}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Target URL</label>
                            <div className="relative">
                                <Globe size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    required type="url" value={url} onChange={e => setUrl(e.target.value)}
                                    placeholder="https://api.example.com"
                                    className={`${inputCls} pl-12`}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Server Location</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                <select
                                    required value={serverLocation} onChange={e => setServerLocation(e.target.value)}
                                    className={`${inputCls} pl-12 appearance-none cursor-pointer`}
                                >
                                    <option value="" disabled>Select deployment region</option>
                                    {SERVER_LOCATIONS.map(loc => (
                                        <option key={loc} value={loc} className="bg-[#12121e]">{loc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-3 flex gap-3">
                            <button
                                type="button" onClick={onClose}
                                className="flex-1 h-13 rounded-xl border border-white/[0.06] text-gray-500 font-bold hover:bg-white/5 hover:text-gray-300 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit" disabled={loading}
                                className="flex-[2] h-13 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl font-black shadow-lg shadow-purple-900/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={16} /> : (
                                    <>Deploy <Plus size={16} className="group-hover:rotate-90 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
    const { user, logout } = useAuth();
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMonitor, setSelectedMonitor] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchMonitors = useCallback(async () => {
        try {
            const res = await api.get('/monitors');
            setMonitors(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch monitors:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMonitors();
    }, [fetchMonitors]);

    const activeCount = monitors.filter(m => m.is_active).length;

    return (
        <div className="min-h-screen bg-[#0a0a14]">

            {/* ─── Top Navbar ─── */}
            <nav className="fixed top-0 inset-x-0 z-50 h-16 bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30">
                            <Zap size={16} className="text-white fill-current" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="font-black text-white text-sm tracking-tight">AutoAegis</span>
                            <span className="text-gray-600 mx-3">·</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-500">All systems nominal</span>
                        </div>
                        <button
                            onClick={logout}
                            className="h-9 px-4 text-xs font-bold text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
                        >
                            <LogOut size={14} /> Log out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="pt-28 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ─── Header ─── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                            Welcome back, <span className="text-gradient-purple">{user?.name || user?.email?.split('@')[0] || 'Operator'}</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Your infrastructure is operating within optimal parameters.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2.5 shadow-lg shadow-purple-900/25 active:scale-[0.98] group flex-shrink-0"
                    >
                        New Monitor <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* ─── Stats Grid ─── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: 'Total Monitors', value: monitors.length, icon: <Globe size={18} className="text-violet-400" />, accent: 'violet' },
                        { label: 'Active', value: activeCount, icon: <Activity size={18} className="text-emerald-400" />, accent: 'emerald' },
                        { label: 'Active Alerts', value: '0', icon: <AlertCircle size={18} className="text-amber-400" />, accent: 'amber' },
                        { label: 'Avocado Grade', value: 'A+', icon: <BadgeCheck size={18} className="text-emerald-400" />, accent: 'emerald' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#12121e] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border
                                    ${stat.accent === 'violet' ? 'bg-violet-500/10 border-violet-500/15' : ''}
                                    ${stat.accent === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/15' : ''}
                                    ${stat.accent === 'amber' ? 'bg-amber-500/10 border-amber-500/15' : ''}
                                `}>
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* ─── Monitors Section ─── */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-white tracking-tight">Monitored Instances</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[10px] font-bold text-gray-500">
                                {monitors.length}
                            </span>
                        </div>
                        <button onClick={fetchMonitors} className="p-2 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all">
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-56 bg-[#12121e] animate-pulse rounded-2xl border border-white/[0.04]" />
                            ))}
                        </div>
                    ) : monitors.length === 0 ? (
                            <div className="py-20 text-center bg-[#12121e] border border-white/[0.06] rounded-2xl">
                                <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-5">
                                    <Fingerprint size={28} className="text-gray-600" />
                            </div>
                                <h3 className="text-lg font-black text-white">No instances found</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium text-sm">
                                    Create your first monitor to start validating your critical user journeys.
                                </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                    className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-900/25"
                            >
                                    <Plus size={14} /> Deploy First Monitor
                            </button>
                        </div>
                    ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {monitors.map(monitor => (
                                <MonitorCard
                                    key={monitor.id}
                                    monitor={monitor}
                                    onUpdate={fetchMonitors}
                                    onViewDetails={(m) => { setSelectedMonitor(m); setIsDetailOpen(true); }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <NewMonitorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchMonitors}
            />

            <MonitorDetailPopup
                monitor={selectedMonitor}
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedMonitor(null); }}
            />
        </div>
    );
}
