'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Globe, Activity } from 'lucide-react';

// Dynamic import — Cesium requires browser APIs (no SSR)
const CesiumGlobe = dynamic(() => import('./CesiumGlobe'), { ssr: false });
const IncidentLog = dynamic(() => import('./IncidentLog'), { ssr: false });
const LatencyChart = dynamic(() => import('./LatencyChart'), { ssr: false });

export default function MonitorDetailPopup({ monitor, isOpen, onClose }) {
    const [loading, setLoading] = useState(true);

    // Handle initial loading sequence when modal opens
    useEffect(() => {
        if (!isOpen) {
            setLoading(true);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    // Close on ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !monitor) return null;

    const isActive = monitor.is_active;
    const statusColor = isActive ? 'text-emerald-400' : 'text-gray-500';
    const statusBg = isActive ? 'bg-emerald-500/10 border-emerald-500/15' : 'bg-gray-500/10 border-gray-500/15';
    const statusLabel = isActive ? 'Active' : 'Inactive';

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Full-screen container */}
            <div className={`absolute inset-0 flex flex-col bg-[#0a0a14] transition-opacity duration-500 ${!loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0e0e1a] shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${statusBg}`}>
                            <Globe size={18} className={statusColor} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white tracking-tight">{monitor.name}</h2>
                            <p className="text-xs text-gray-500 font-medium">{monitor.target_url}</p>
                        </div>
                        <span className={`ml-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusBg} ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-gray-300 transition-all"
                        title="Close (Esc)"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Two-column layout: Left (Globe + Chart) | Right (Journey Files full height) */}
                <div className="flex-1 grid grid-cols-2 gap-px bg-white/[0.04] overflow-hidden">
                    {/* Left column — Globe (top) + Latency Chart (bottom) */}
                    <div className="flex flex-col gap-px bg-white/[0.04] overflow-hidden">
                        {/* Globe */}
                        <div className="flex-1 bg-[#0a0a14] relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/[0.06]">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    Latency Map — Origin: {monitor.server_location || 'Default'}
                                </span>
                            </div>
                            {!loading && <CesiumGlobe originLocation={monitor.server_location} />}
                        </div>
                        {/* Latency Chart */}
                        <div className="flex-1 bg-[#0e0e1a] overflow-hidden">
                            {!loading && <LatencyChart originLocation={monitor.server_location} monitorName={monitor.name} autoStart={true} />}
                        </div>
                    </div>

                    {/* Right column — Journey Files (full height) */}
                    <div className="bg-[#0e0e1a] overflow-hidden">
                        {!loading && <IncidentLog monitorId={monitor.id} />}
                    </div>
                </div>
            </div>

            {/* Overlay Loading Animation */}
            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0a14]">
                    <div className="flex flex-col items-center max-w-sm w-full">
                        {/* Animated Radar/Globe Icon */}
                        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                            {/* Outer pulsing rings */}
                            <div className="absolute inset-0 rounded-full border border-violet-500/30" style={{ animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                            <div className="absolute inset-0 rounded-full border border-violet-500/20" style={{ animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.5s' }}></div>
                            <div className="absolute inset-0 rounded-full border border-violet-500/10" style={{ animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s' }}></div>

                            {/* Orbiting particle */}
                            <div className="absolute w-full h-full" style={{ animation: 'orbit 3s linear infinite' }}>
                                <div className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                            </div>

                            {/* Center icon */}
                            <div className="relative z-10 w-16 h-16 bg-[#12121e] rounded-2xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                                <Activity size={28} className="text-violet-400" />
                            </div>
                        </div>

                        {/* Status Text Sequence */}
                        <div className="text-center mb-6 h-12 flex flex-col justify-end" style={{ animation: 'fade-in-up 0.5s ease-out forwards' }}>
                            <h3 className="text-white font-black text-lg tracking-tight mb-1">Establishing Uplink</h3>
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest overflow-hidden whitespace-nowrap border-r-2 border-violet-500/50 pr-1 animate-pulse">
                                Initializing diagnostics…
                            </p>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="w-64 h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.02]">
                            <div
                                className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-emerald-400 rounded-full"
                                style={{ animation: 'progress-fill 2s ease-in-out forwards' }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
