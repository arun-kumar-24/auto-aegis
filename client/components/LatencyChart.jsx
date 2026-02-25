'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    LineChart,
    Area,
    AreaChart,
} from 'recharts';
import { BarChart3, TrendingUp, Play, Square, Zap } from 'lucide-react';
import { sendSlackAlert } from '../services/api';

/* ── Shared location data (same as CesiumGlobe) ─────────────── */
const ALL_LOCATIONS = [
    { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
    { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lon: 77.209 },
    { name: 'Colombo', lat: 6.9271, lon: 79.8612 },
    { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
    { name: 'Kuala Lumpur', lat: 3.139, lon: 101.6869 },
    { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
    { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
    { name: 'Riyadh', lat: 24.7136, lon: 46.6753 },
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
    { name: 'Seoul', lat: 37.5665, lon: 126.978 },
    { name: 'Taipei', lat: 25.033, lon: 121.5654 },
    { name: 'Manila', lat: 14.5995, lon: 120.9842 },
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
    { name: 'Paris', lat: 48.8566, lon: 2.3522 },
    { name: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
    { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
    { name: 'Rome', lat: 41.9028, lon: 12.4964 },
    { name: 'New York', lat: 40.7128, lon: -74.006 },
    { name: 'Washington DC', lat: 38.9072, lon: -77.0369 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
    { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
    { name: 'Toronto', lat: 43.651, lon: -79.347 },
    { name: 'Sao Paulo', lat: -23.5505, lon: -46.6333 },
    { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
    { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
    { name: 'Nairobi', lat: -1.2864, lon: 36.8172 },
    { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
];

/* ── Haversine & latency estimation ─────────────────────────── */
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateLatency(distKm) {
    const fiberLatency = distKm * 0.01;
    const routingOverhead = distKm * 0.004;
    const baseJitter = 3 + Math.random() * 5;
    return Math.round(fiberLatency + routingOverhead + baseJitter);
}

/* ── Colour helpers ─────────────────────────────────────────── */
function latencyColor(ms) {
    if (ms < 50) return '#22c55e';   // green
    if (ms < 120) return '#eab308';  // yellow
    if (ms < 200) return '#f97316';  // orange
    return '#ef4444';                // red
}

/* ── Custom Tooltip (static chart) ──────────────────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const ms = payload[0]?.value;
    return (
        <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 shadow-lg">
            <p className="text-xs font-bold text-gray-300 mb-1">{label}</p>
            <p className="text-sm font-mono" style={{ color: latencyColor(ms) }}>
                {ms} ms
            </p>
        </div>
    );
}

/* ── Custom Tooltip (visualisation) ─────────────────────────── */
function SimTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const ms = payload[0]?.value;
    const isSpike = ms > 100;
    return (
        <div className={`rounded-xl px-4 py-3 shadow-lg border ${isSpike ? 'bg-red-950/80 border-red-500/30' : 'bg-[#1a1a2e] border-white/10'}`}>
            <p className="text-xs font-bold text-gray-300 mb-1">{label}</p>
            <p className="text-sm font-mono" style={{ color: isSpike ? '#ef4444' : '#22c55e' }}>
                {ms} ms {isSpike ? '⚠ SPIKE' : ''}
            </p>
        </div>
    );
}

/* ── Custom bar shape with rounded tops ─────────────────────── */
function RoundedBar(props) {
    const { x, y, width, height, fill } = props;
    if (!height || height <= 0) return null;
    const radius = Math.min(4, width / 2);
    return (
        <g>
            <defs>
                <linearGradient id={`bar-grad-${x}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={fill} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={fill} stopOpacity={0.3} />
                </linearGradient>
            </defs>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={radius}
                ry={radius}
                fill={`url(#bar-grad-${x})`}
            />
        </g>
    );
}

/* ── Visualisation latency generator ────────────────────────── */
const THRESHOLD = 100;
const SIM_DURATION = 15; // seconds

/**
 * Build a random spike plan: pick 2-3 random seconds to spike.
 * Returns a Set of seconds that should have elevated latency.
 */
function buildSpikePlan() {
    const spikeCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 spikes
    const available = [];
    // Spikes can land anywhere from second 3 to 14 (avoid very start/end)
    for (let s = 3; s <= 14; s++) available.push(s);
    const plan = new Set();
    while (plan.size < spikeCount && available.length > 0) {
        const idx = Math.floor(Math.random() * available.length);
        plan.add(available[idx]);
        available.splice(idx, 1);
    }
    return plan;
}

function generateSimLatency(second, spikePlan) {
    // Normal baseline: 30-70ms with jitter
    let base = 40 + Math.random() * 25;

    // Spike only on randomly chosen seconds
    if (spikePlan.has(second)) {
        base = 110 + Math.random() * 140; // 110-250ms spike
    }

    return Math.round(base);
}

/* ═══════════════════════════════════════════════════════════════
   LatencyChart — bar + line chart with visualisation mode
   ═══════════════════════════════════════════════════════════════ */
export default function LatencyChart({ originLocation, monitorName }) {
    const [chartType, setChartType] = useState('both');
    const [simMode, setSimMode] = useState(false);       // simulation active?
    const [simData, setSimData] = useState([]);           // real-time points
    const [simSecond, setSimSecond] = useState(0);
    const [simDone, setSimDone] = useState(false);
    const [alertsSent, setAlertsSent] = useState(0);
    const [simLog, setSimLog] = useState([]);             // event log
    const alertSentRef = useRef(new Set());               // track which seconds already sent
    const timerRef = useRef(null);
    const spikePlanRef = useRef(new Set());                // randomised spike seconds

    /* ── Pick a random target region for the visualisation ─── */
    const simRegion = useMemo(() => {
        const regions = ALL_LOCATIONS.filter(
            (l) => l.name.toLowerCase() !== (originLocation || 'bangalore').toLowerCase()
        );
        return regions[Math.floor(Math.random() * regions.length)]?.name || 'Tokyo';
    }, [originLocation]);

    /* ── Start visualisation ─────────────────────────────────── */
    const startSim = useCallback(() => {
        spikePlanRef.current = buildSpikePlan(); // fresh random pattern each run
        setSimMode(true);
        setSimData([]);
        setSimSecond(0);
        setSimDone(false);
        setAlertsSent(0);
        setSimLog([]);
        alertSentRef.current = new Set();
    }, []);

    /* ── Stop simulation ────────────────────────────────────── */
    const stopSim = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSimMode(false);
        setSimDone(false);
        setSimData([]);
        setSimLog([]);
        setSimSecond(0);
        setAlertsSent(0);
    }, []);

    /* ── Simulation tick ────────────────────────────────────── */
    useEffect(() => {
        if (!simMode || simDone) return;

        let sec = 0;
        timerRef.current = setInterval(() => {
            sec += 1;
            if (sec > SIM_DURATION) {
                clearInterval(timerRef.current);
                setSimDone(true);
                setSimLog((prev) => [...prev, { type: 'done', text: 'Visualisation complete.' }]);
                return;
            }

            const latency = generateSimLatency(sec, spikePlanRef.current);
            const point = { time: `${sec}s`, latency, second: sec };

            setSimData((prev) => [...prev, point]);
            setSimSecond(sec);

            // Spike detection → Slack alert
            if (latency > THRESHOLD && !alertSentRef.current.has(sec)) {
                alertSentRef.current.add(sec);
                setAlertsSent((n) => n + 1);
                setSimLog((prev) => [
                    ...prev,
                    { type: 'alert', text: `⚠ Spike at ${sec}s → ${latency}ms → Sending Slack alert…` },
                ]);

                sendSlackAlert({
                    region: simRegion,
                    latency,
                    threshold: THRESHOLD,
                    monitorName: monitorName || 'Latency Visualisation',
                    originLocation: originLocation || 'Bangalore',
                }).then(() => {
                    setSimLog((prev) => [
                        ...prev,
                        { type: 'success', text: `✓ Slack alert sent (${latency}ms at ${sec}s)` },
                    ]);
                }).catch((err) => {
                    setSimLog((prev) => [
                        ...prev,
                        { type: 'error', text: `✗ Slack failed: ${err.message}` },
                    ]);
                });
            }
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [simMode, simDone, simRegion, monitorName, originLocation]);

    /* ── Static chart data ──────────────────────────────────── */
    const data = useMemo(() => {
        const originName = (originLocation || 'Bangalore').trim();
        const origin = ALL_LOCATIONS.find(
            (l) => l.name.toLowerCase() === originName.toLowerCase()
        ) || ALL_LOCATIONS[0];

        return ALL_LOCATIONS
            .filter((l) => l.name !== origin.name)
            .map((loc) => {
                const distKm = haversineKm(origin.lat, origin.lon, loc.lat, loc.lon);
                const latency = estimateLatency(distKm);
                return { region: loc.name, latency, fill: latencyColor(latency) };
            })
            .sort((a, b) => a.latency - b.latency);
    }, [originLocation]);

    const avgLatency = Math.round(data.reduce((s, d) => s + d.latency, 0) / data.length);
    const minEntry = data[0];
    const maxEntry = data[data.length - 1];

    /* ═══════════════════════════════════════════════════════════
       Render — Visualisation Mode
       ═══════════════════════════════════════════════════════════ */
    if (simMode) {
        const progress = Math.round((simSecond / SIM_DURATION) * 100);
        const currentLatency = simData[simData.length - 1]?.latency ?? 0;
        const isCurrentSpike = currentLatency > THRESHOLD;

        return (
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0e0e1a]">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className={simDone ? 'text-emerald-400' : 'text-amber-400 animate-pulse'} />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {simDone ? 'Visualisation Complete' : 'Live Latency Visualisation'}
                        </span>
                        <span className="text-[10px] text-gray-600 font-mono">
                            → {simRegion}
                        </span>
                    </div>
                    <button
                        onClick={stopSim}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/[0.04] text-gray-500 border border-white/[0.06] hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/25 transition-all"
                    >
                        <Square size={10} />
                        {simDone ? 'Close' : 'Stop'}
                    </button>
                </div>

                {/* Live stats bar */}
                <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-white/[0.04] bg-[#0a0a14] overflow-x-auto">
                    <StatPill label="Current" value={`${currentLatency} ms`} color={isCurrentSpike ? '#ef4444' : '#22c55e'} />
                    <StatPill label="Threshold" value={`${THRESHOLD} ms`} color="#a78bfa" />
                    <StatPill label="Alerts Sent" value={`${alertsSent}`} color="#f97316" />
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-violet-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{simSecond}/{SIM_DURATION}s</span>
                    </div>
                </div>

                {/* Real-time chart */}
                <div className="flex-1 min-h-0 px-2 py-3">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={simData} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
                            <defs>
                                <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 10, fill: '#4b5563' }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#4b5563' }}
                                axisLine={false}
                                tickLine={false}
                                unit=" ms"
                                width={50}
                                domain={[0, 300]}
                            />
                            <Tooltip content={<SimTooltip />} />
                            <ReferenceLine
                                y={THRESHOLD}
                                stroke="#ef4444"
                                strokeDasharray="6 3"
                                strokeWidth={1.5}
                                label={{ value: `${THRESHOLD}ms threshold`, position: 'right', fontSize: 9, fill: '#ef4444' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="latency"
                                stroke="#a78bfa"
                                strokeWidth={2.5}
                                fill="url(#simGrad)"
                                dot={(props) => {
                                    const { cx, cy, payload } = props;
                                    const spike = payload.latency > THRESHOLD;
                                    return (
                                        <circle
                                            key={props.index}
                                            cx={cx}
                                            cy={cy}
                                            r={spike ? 5 : 3}
                                            fill={spike ? '#ef4444' : '#a78bfa'}
                                            stroke={spike ? '#fca5a5' : '#fff'}
                                            strokeWidth={2}
                                        />
                                    );
                                }}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Event log */}
                <div className="shrink-0 max-h-24 overflow-y-auto px-4 py-2 border-t border-white/[0.04] bg-[#0a0a14] text-[10px] font-mono space-y-0.5 incident-log-content">
                    {simLog.length === 0 && (
                        <p className="text-gray-400">Waiting for events…</p>
                    )}
                    {simLog.map((entry, i) => (
                        <p
                            key={i}
                            className={
                                entry.type === 'alert' ? 'text-amber-600' :
                                entry.type === 'success' ? 'text-emerald-600' :
                                entry.type === 'error' ? 'text-red-500' :
                                'text-gray-500'
                            }
                        >
                            {entry.text}
                        </p>
                    ))}
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════════
       Render — Static Regional Chart
       ═══════════════════════════════════════════════════════════ */
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0e0e1a]">
                <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-violet-400" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Regional Latency
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Visualise Latency button */}
                    <button
                        onClick={startSim}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                        title="Run 15s latency visualisation with Slack alerts"
                    >
                        <Play size={10} fill="currentColor" />
                        Visualise Latency
                    </button>

                    {/* Chart type toggle */}
                    <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-0.5">
                        {[
                            { key: 'bar', icon: BarChart3, tip: 'Bar chart' },
                            { key: 'line', icon: TrendingUp, tip: 'Line chart' },
                            { key: 'both', icon: null, tip: 'Combined' },
                        ].map(({ key, icon: Icon, tip }) => (
                            <button
                                key={key}
                                onClick={() => setChartType(key)}
                                title={tip}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                    chartType === key
                                    ? 'bg-violet-500/15 text-violet-300'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                            >
                                {Icon ? <Icon size={12} /> : 'Both'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stat pills */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-white/[0.04] bg-[#0a0a14] overflow-x-auto">
                <StatPill label="Average" value={`${avgLatency} ms`} color="#a78bfa" />
                <StatPill label="Fastest" value={`${minEntry?.region} · ${minEntry?.latency} ms`} color="#22c55e" />
                <StatPill label="Slowest" value={`${maxEntry?.region} · ${maxEntry?.latency} ms`} color="#ef4444" />
            </div>

            {/* Chart area */}
            <div className="flex-1 min-h-0 px-2 py-3">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 60, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis
                            dataKey="region"
                            tick={{ fontSize: 9, fill: '#4b5563', fontWeight: 600 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                            tickLine={false}
                            height={60}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#4b5563' }}
                            axisLine={false}
                            tickLine={false}
                            unit=" ms"
                            width={55}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Legend wrapperStyle={{ fontSize: 10, color: '#6b7280', paddingTop: 4 }} />

                        {(chartType === 'bar' || chartType === 'both') && (
                            <Bar
                                dataKey="latency"
                                name="Latency (bar)"
                                shape={<RoundedBar />}
                                isAnimationActive={true}
                                animationDuration={800}
                            >
                                {data.map((entry, i) => (
                                    <rect key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        )}

                        {(chartType === 'line' || chartType === 'both') && (
                            <Line
                                type="monotone"
                                dataKey="latency"
                                name="Latency (line)"
                                stroke="#a78bfa"
                                strokeWidth={2}
                                dot={{ r: 2.5, fill: '#a78bfa', strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#a78bfa', stroke: '#fff', strokeWidth: 2 }}
                                isAnimationActive={true}
                                animationDuration={800}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

/* ── Small stat pill ────────────────────────────────────────── */
function StatPill({ label, value, color }) {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-500 font-semibold">{label}</span>
            <span className="text-[11px] font-bold text-gray-300">{value}</span>
        </div>
    );
}
