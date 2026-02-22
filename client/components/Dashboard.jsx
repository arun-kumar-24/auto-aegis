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
    LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import MonitorDetailPopup from './MonitorDetailPopup';
import { MapPin } from 'lucide-react';

const SERVER_LOCATIONS = [
    "Bangalore", "Mumbai", "Delhi", "Colombo", "Singapore",
    "Kuala Lumpur", "Jakarta", "Bangkok", "Dubai", "Riyadh",
    "Tokyo", "Seoul", "Taipei", "Manila", "Sydney",
    "London", "Frankfurt", "Paris", "Amsterdam", "Madrid", "Rome",
    "New York", "Washington DC", "Chicago", "San Francisco", "Seattle", "Toronto",
    "Sao Paulo", "Buenos Aires", "Cape Town", "Nairobi", "Lagos"
];

function MonitorCard({ monitor, onUpdate, onViewDetails }) {
    const statusColor = monitor.is_active ? 'text-emerald-500' : 'text-zinc-500';
    const statusBg = monitor.is_active ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-500/10 border-zinc-500/20';

    return (
        <div className="group relative bg-white border border-gray-100 rounded-[2rem] p-6 hover:border-violet-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${statusBg}`}>
                    <Globe size={20} className={statusColor} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 font-bold truncate">{monitor.name}</h3>
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full ${monitor.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                    </div>
                    <p className="text-gray-400 text-xs font-medium truncate mt-0.5">{monitor.target_url}</p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uptime</p>
                    <p className="text-gray-900 font-mono text-sm mt-0.5">99.9%</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Latency</p>
                    <p className="text-gray-900 font-mono text-sm mt-0.5">42ms</p>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Clock size={12} />
                    Last checked: Just now
                </div>
                <button
                    onClick={() => onViewDetails(monitor)}
                    className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-500 transition-colors"
                >
                    Details <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

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
            toast.success('Monitor created successfully');
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Instance</h2>
                            <p className="text-gray-400 text-sm font-medium mt-1">Configure your monitor settings</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Instance Name</label>
                            <input
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. Production API"
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-200 border outline-none transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target URL</label>
                            <div className="relative">
                                <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    required
                                    type="url"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    placeholder="https://api.example.com"
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl pl-14 pr-5 py-4 text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-200 border outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Server Location</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <select
                                    required
                                    value={serverLocation}
                                    onChange={e => setServerLocation(e.target.value)}
                                    className="w-full bg-gray-50 border-gray-100 rounded-2xl pl-14 pr-5 py-4 text-gray-900 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-200 border outline-none transition-all font-medium appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select deployment region</option>
                                    {SERVER_LOCATIONS.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 h-14 rounded-2xl border border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-black shadow-lg shadow-gray-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                                    <>Create Instance <Plus size={18} className="group-hover:rotate-90 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

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

    return (
        <div className="min-h-screen pt-32 pb-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Activity size={12} /> Live Infrastructure
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Welcome, <span className="text-violet-600 underline decoration-violet-100 decoration-8 underline-offset-8">{user?.name || user?.email?.split('@')[0] || 'Member'}</span>
                        </h1>
                        <p className="text-gray-400 font-medium text-lg">Your systems are operating within optimal parameters.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={logout}
                            className="h-14 px-6 bg-white hover:bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl font-black transition-all flex items-center gap-2 shadow-sm active:scale-95"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="h-14 px-8 bg-gray-900 hover:bg-black text-white rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl shadow-gray-100 active:scale-95 group"
                        >
                            New Monitor <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {[
                        { label: 'Total Monitors', value: monitors.length, icon: Globe, color: 'text-violet-600', bg: 'bg-violet-50' },
                        { label: 'Active Alerts', value: '0', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
                        { label: 'System Health', value: 'Excellent', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-gray-100 transition-all">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
                                <stat.icon size={20} className={stat.color} />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Monitors Grid */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            Monitored Instances
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-black text-gray-400">
                                {monitors.length}
                            </span>
                        </h2>
                        <button onClick={fetchMonitors} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[2rem] border border-gray-100" />
                            ))}
                        </div>
                    ) : monitors.length === 0 ? (
                        <div className="py-24 text-center bg-gray-50 border border-gray-100 rounded-[3rem]">
                            <div className="w-20 h-20 bg-white shadow-sm rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <Activity size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No instances found</h3>
                            <p className="text-gray-400 mt-2 max-w-sm mx-auto font-medium">Create your first monitor to start tracking your infrastructure's health and performance.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-8 px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black transition-all inline-flex items-center gap-2"
                            >
                                <Plus size={18} /> Add First Monitor
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
