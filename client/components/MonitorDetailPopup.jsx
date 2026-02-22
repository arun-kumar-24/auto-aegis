'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Globe, Activity, Clock } from 'lucide-react';

// Dynamic import — Cesium requires browser APIs (no SSR)
const CesiumGlobe = dynamic(() => import('./CesiumGlobe'), { ssr: false });
const IncidentLog = dynamic(() => import('./IncidentLog'), { ssr: false });

export default function MonitorDetailPopup({ monitor, isOpen, onClose }) {
    // Close on ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        // Prevent body scroll when popup is open
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !monitor) return null;

    const statusColor = monitor.is_active ? 'text-emerald-500' : 'text-zinc-500';
    const statusBg = monitor.is_active ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-500/10 border-zinc-500/20';
    const statusLabel = monitor.is_active ? 'Active' : 'Inactive';

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Full-screen container */}
            <div className="absolute inset-0 flex flex-col bg-black">
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-black/80 backdrop-blur-md shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${statusBg}`}>
                            <Globe size={18} className={statusColor} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white tracking-tight">{monitor.name}</h2>
                            <p className="text-xs text-gray-500 font-medium">{monitor.target_url}</p>
                        </div>
                        <span className={`ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBg} ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"
                        title="Close (Esc)"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 2x2 Grid */}
                <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-[1px] bg-white/5 overflow-hidden">
                    {/* Quadrant 1 — Globe */}
                    <div className="bg-gray-950 relative overflow-hidden">
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                                Latency Map — Origin: {monitor.server_location || 'Default'}
                            </span>
                        </div>
                        <CesiumGlobe originLocation={monitor.server_location} />
                    </div>

                    {/* Quadrant 2 — Placeholder */}
                    <div className="bg-black flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <Activity size={28} className="text-gray-600" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">Performance Metrics</p>
                            <p className="text-xs text-gray-600 mt-1">Coming soon</p>
                        </div>
                    </div>

                    {/* Quadrant 3 — Placeholder */}
                    <div className="bg-black flex items-center justify-center p-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                <Clock size={28} className="text-gray-600" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">Uptime History</p>
                            <p className="text-xs text-gray-600 mt-1">Coming soon</p>
                        </div>
                    </div>

                    {/* Quadrant 4 — Incident Log (Journey Files) */}
                    <div className="bg-black overflow-hidden">
                        <IncidentLog monitorId={monitor.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
