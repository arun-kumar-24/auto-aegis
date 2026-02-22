'use client';

import { useMemo, useState } from 'react';
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
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

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

/* ── Custom Tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const ms = payload[0]?.value;
    return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
            <p className="text-xs font-bold text-gray-800 mb-1">{label}</p>
            <p className="text-sm font-mono" style={{ color: latencyColor(ms) }}>
                {ms} ms
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

/* ═══════════════════════════════════════════════════════════════
   LatencyChart — bar + line chart of avg latency per region
   ═══════════════════════════════════════════════════════════════ */
export default function LatencyChart({ originLocation }) {
    const [chartType, setChartType] = useState('both'); // 'bar' | 'line' | 'both'

    /* Build data sorted by latency ──────────────────────────── */
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
                return {
                    region: loc.name,
                    latency,
                    fill: latencyColor(latency),
                };
            })
            .sort((a, b) => a.latency - b.latency);
    }, [originLocation]);

    /* Stats ─────────────────────────────────────────────────── */
    const avgLatency = Math.round(data.reduce((s, d) => s + d.latency, 0) / data.length);
    const minEntry = data[0];
    const maxEntry = data[data.length - 1];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── Header ────────────────────────────────────── */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-violet-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Regional Latency
                    </span>
                </div>

                {/* Chart type toggle */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
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
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {Icon ? <Icon size={12} /> : 'Both'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Stat pills ────────────────────────────────── */}
            <div className="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-gray-100 bg-white overflow-x-auto">
                <StatPill label="Average" value={`${avgLatency} ms`} color="#a78bfa" />
                <StatPill label="Fastest" value={`${minEntry?.region} · ${minEntry?.latency} ms`} color="#22c55e" />
                <StatPill label="Slowest" value={`${maxEntry?.region} · ${maxEntry?.latency} ms`} color="#ef4444" />
            </div>

            {/* ── Chart area ────────────────────────────────── */}
            <div className="flex-1 min-h-0 px-2 py-3">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 60, left: 4 }}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(0,0,0,0.06)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="region"
                            tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 600 }}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                            tickLine={false}
                            height={60}
                        />

                        <YAxis
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            unit=" ms"
                            width={55}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />

                        <Legend
                            wrapperStyle={{ fontSize: 10, color: '#9ca3af', paddingTop: 4 }}
                        />

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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 whitespace-nowrap">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
            <span className="text-[11px] font-bold text-gray-700">{value}</span>
        </div>
    );
}
