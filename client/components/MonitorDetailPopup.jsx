'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Globe, Activity } from 'lucide-react';

// Dynamic import — Cesium requires browser APIs (no SSR)
const CesiumGlobe = dynamic(() => import('./CesiumGlobe'), { ssr: false });
const IncidentLog = dynamic(() => import('./IncidentLog'), { ssr: false });
const LatencyChart = dynamic(() => import('./LatencyChart'), { ssr: false });

export default function MonitorDetailPopup({ monitor, isOpen, onClose }) {
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
            <div className="absolute inset-0 flex flex-col bg-[#0a0a14]">
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
                            <CesiumGlobe originLocation={monitor.server_location} />
                        </div>
                        {/* Latency Chart */}
                        <div className="flex-1 bg-[#0e0e1a] overflow-hidden">
                            <LatencyChart originLocation={monitor.server_location} monitorName={monitor.name} />
                        </div>
                    </div>

                    {/* Right column — Journey Files (full height) */}
                    <div className="bg-[#0e0e1a] overflow-hidden">
                        <IncidentLog monitorId={monitor.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
