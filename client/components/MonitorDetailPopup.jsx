'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Globe } from 'lucide-react';

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
        <div className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Full-screen container */}
            <div className="absolute inset-0 flex flex-col bg-white">
                {/* Top bar */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${statusBg}`}>
                            <Globe size={18} className={statusColor} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight">{monitor.name}</h2>
                            <p className="text-xs text-gray-500 font-medium">{monitor.target_url}</p>
                        </div>
                        <span className={`ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusBg} ${statusColor}`}>
                            {statusLabel}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-700 transition-all"
                        title="Close (Esc)"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Two-column layout: Left (Globe + Chart) | Right (Journey Files full height) */}
                <div className="flex-1 grid grid-cols-2 gap-[1px] bg-gray-200 overflow-hidden">
                    {/* Left column — Globe (top) + Latency Chart (bottom) */}
                    <div className="flex flex-col gap-[1px] bg-gray-200 overflow-hidden">
                        {/* Globe */}
                        <div className="flex-1 bg-gray-950 relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                                <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                                    Latency Map — Origin: {monitor.server_location || 'Default'}
                                </span>
                            </div>
                            <CesiumGlobe originLocation={monitor.server_location} />
                        </div>
                        {/* Latency Chart */}
                        <div className="flex-1 bg-white overflow-hidden">
                            <LatencyChart originLocation={monitor.server_location} />
                        </div>
                    </div>

                    {/* Right column — Journey Files (full height) */}
                    <div className="bg-white overflow-hidden">
                        <IncidentLog monitorId={monitor.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
