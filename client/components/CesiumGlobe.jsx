'use client';

import { useEffect, useRef } from 'react';
import {
    Viewer, Cartesian3, Color, VerticalOrigin, HorizontalOrigin,
    PolylineGlowMaterialProperty, ArcType, Cartesian2, Ion,
    LabelStyle, ScreenSpaceEventHandler, ScreenSpaceEventType,
    defined
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Cesium static assets base URL
if (typeof window !== 'undefined') {
    window.CESIUM_BASE_URL = '/cesium';
}

const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDJhNWIzYS1mZGQ0LTRhY2MtYTFmMC1lN2IxYzU2MWM5MjciLCJpZCI6MzM5NDU5LCJpYXQiOjE3NTczNDM4NDh9.9ol6os_vF8JKQqAM9-6jLbKob_Kiszmj7fPBnGnFoao';

const origin = { lat: 13.0827, lon: 80.2707, name: "Origin: Tamil Nadu" };

const locations = [
    { name: "Bangalore", lat: 12.9716, lon: 77.5946, latency: 8, totalHits: 12400, successHits: 12350 },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777, latency: 25, totalHits: 9800, successHits: 9650 },
    { name: "Delhi", lat: 28.6139, lon: 77.2090, latency: 35, totalHits: 8500, successHits: 8320 },
    { name: "Colombo", lat: 6.9271, lon: 79.8612, latency: 15, totalHits: 4200, successHits: 4170 },
    { name: "Singapore", lat: 1.3521, lon: 103.8198, latency: 45, totalHits: 15600, successHits: 15200 },
    { name: "Kuala Lumpur", lat: 3.1390, lon: 101.6869, latency: 50, totalHits: 5300, successHits: 5120 },
    { name: "Jakarta", lat: -6.2088, lon: 106.8456, latency: 65, totalHits: 7100, successHits: 6800 },
    { name: "Bangkok", lat: 13.7563, lon: 100.5018, latency: 55, totalHits: 6400, successHits: 6180 },
    { name: "Dubai", lat: 25.2048, lon: 55.2708, latency: 65, totalHits: 8900, successHits: 8530 },
    { name: "Riyadh", lat: 24.7136, lon: 46.6753, latency: 85, totalHits: 3600, successHits: 3380 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503, latency: 125, totalHits: 18200, successHits: 16900 },
    { name: "Seoul", lat: 37.5665, lon: 126.9780, latency: 135, totalHits: 11000, successHits: 10100 },
    { name: "Taipei", lat: 25.0330, lon: 121.5654, latency: 110, totalHits: 6700, successHits: 6250 },
    { name: "Manila", lat: 14.5995, lon: 120.9842, latency: 90, totalHits: 4800, successHits: 4520 },
    { name: "Sydney", lat: -33.8688, lon: 151.2093, latency: 145, totalHits: 9200, successHits: 8400 },
    { name: "London", lat: 51.5074, lon: -0.1278, latency: 180, totalHits: 22000, successHits: 19400 },
    { name: "Frankfurt", lat: 50.1109, lon: 8.6821, latency: 165, totalHits: 14500, successHits: 13050 },
    { name: "Paris", lat: 48.8566, lon: 2.3522, latency: 175, totalHits: 13200, successHits: 11600 },
    { name: "Amsterdam", lat: 52.3676, lon: 4.9041, latency: 170, totalHits: 10800, successHits: 9600 },
    { name: "Madrid", lat: 40.4168, lon: -3.7038, latency: 195, totalHits: 7600, successHits: 6500 },
    { name: "Rome", lat: 41.9028, lon: 12.4964, latency: 185, totalHits: 6900, successHits: 5980 },
    { name: "New York", lat: 40.7128, lon: -74.0060, latency: 240, totalHits: 25000, successHits: 20500 },
    { name: "Washington DC", lat: 38.9072, lon: -77.0369, latency: 245, totalHits: 11200, successHits: 9070 },
    { name: "Chicago", lat: 41.8781, lon: -87.6298, latency: 255, totalHits: 9500, successHits: 7500 },
    { name: "San Francisco", lat: 37.7749, lon: -122.4194, latency: 220, totalHits: 19800, successHits: 16600 },
    { name: "Seattle", lat: 47.6062, lon: -122.3321, latency: 225, totalHits: 8700, successHits: 7200 },
    { name: "Toronto", lat: 43.6510, lon: -79.3470, latency: 250, totalHits: 7800, successHits: 6100 },
    { name: "Sao Paulo", lat: -23.5505, lon: -46.6333, latency: 330, totalHits: 6200, successHits: 4340 },
    { name: "Buenos Aires", lat: -34.6037, lon: -58.3816, latency: 350, totalHits: 3400, successHits: 2240 },
    { name: "Cape Town", lat: -33.9249, lon: 18.4241, latency: 260, totalHits: 4100, successHits: 3160 },
    { name: "Nairobi", lat: -1.2864, lon: 36.8172, latency: 190, totalHits: 3800, successHits: 3250 },
    { name: "Lagos", lat: 6.5244, lon: 3.3792, latency: 280, totalHits: 5500, successHits: 4070 },
];

// ── Pin icon generator ──
const pinCache = {};
function createPinIcon(cssColor) {
    if (pinCache[cssColor]) return pinCache[cssColor];
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size + 12;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.moveTo(size / 2, size + 6);
    ctx.bezierCurveTo(size / 2 - 2, size - 6, 4, size / 2, 4, size / 2 - 6);
    ctx.arc(size / 2, size / 2 - 6, size / 2 - 4, Math.PI, 0, false);
    ctx.bezierCurveTo(size - 4, size / 2, size / 2 + 2, size - 6, size / 2, size + 6);
    ctx.closePath();
    ctx.fillStyle = cssColor;
    ctx.shadowColor = cssColor;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 6, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    pinCache[cssColor] = dataUrl;
    return dataUrl;
}

function getStatusColor(latency) {
    if (latency > 200) return { cesium: Color.RED, css: '#ff4444' };
    if (latency > 100) return { cesium: Color.YELLOW, css: '#ffdc00' };
    return { cesium: Color.LIME, css: '#00ff64' };
}

// ── SVG pie chart builder ──
function buildPieSVG(successPct) {
    const r = 40, cx = 45, cy = 45;
    let slices;
    if (successPct >= 100) {
        slices = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#00e676" opacity="0.9"/>`;
    } else if (successPct <= 0) {
        slices = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ff4444" opacity="0.85"/>`;
    } else {
        const angle = (successPct / 100) * 360;
        const rad = (a) => (a - 90) * Math.PI / 180;
        const x1 = cx + r * Math.cos(rad(0));
        const y1 = cy + r * Math.sin(rad(0));
        const x2 = cx + r * Math.cos(rad(angle));
        const y2 = cy + r * Math.sin(rad(angle));
        const largeArc = angle > 180 ? 1 : 0;
        slices = `
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ff4444" opacity="0.85"/>
            <path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z" fill="#00e676" opacity="0.9"/>`;
    }
    return `
        <svg width="90" height="90" viewBox="0 0 90 90">
            ${slices}
            <circle cx="${cx}" cy="${cy}" r="18" fill="rgba(10,14,26,0.85)"/>
            <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle"
                  fill="#fff" font-size="11" font-weight="700">${successPct}%</text>
        </svg>`;
}

// ── Popup HTML builder ──
function buildPopupHTML(loc) {
    const latencyClass = loc.latency <= 100 ? 'low' : loc.latency <= 200 ? 'medium' : 'high';
    const latencyLabel = latencyClass === 'low' ? 'Low' : latencyClass === 'medium' ? 'Medium' : 'High';
    const pinColor = latencyClass === 'low' ? '#00ff64' : latencyClass === 'medium' ? '#ffdc00' : '#ff4444';
    const successPct = Math.round((loc.successHits / loc.totalHits) * 100);
    const failHits = loc.totalHits - loc.successHits;

    return `
        <div class="globe-popup-header">
            <span class="globe-pin-icon" style="color:${pinColor}">📍</span>
            <span class="globe-loc-name">${loc.name}</span>
        </div>
        <div class="globe-popup-details">
            <span class="globe-detail-label">Latitude</span>
            <span class="globe-detail-value">${loc.lat.toFixed(4)}°</span>
            <span class="globe-detail-label">Longitude</span>
            <span class="globe-detail-value">${loc.lon.toFixed(4)}°</span>
            <span class="globe-detail-label">Latency</span>
            <span class="globe-detail-value">
                <span class="globe-latency-badge ${latencyClass}">${loc.latency} ms · ${latencyLabel}</span>
            </span>
            <span class="globe-detail-label">Total Hits</span>
            <span class="globe-detail-value">${loc.totalHits.toLocaleString()}</span>
        </div>
        <div class="globe-chart-section">
            ${buildPieSVG(successPct)}
            <div class="globe-chart-legend">
                <div class="globe-legend-item">
                    <span class="globe-legend-dot" style="background:#00e676"></span>
                    <span>Success</span>
                    <span class="globe-legend-value">${loc.successHits.toLocaleString()}</span>
                </div>
                <div class="globe-legend-item">
                    <span class="globe-legend-dot" style="background:#ff4444"></span>
                    <span>Failed</span>
                    <span class="globe-legend-value">${failHits.toLocaleString()}</span>
                </div>
            </div>
        </div>`;
}

export default function CesiumGlobe() {
    const containerRef = useRef(null);
    const popupRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        Ion.defaultAccessToken = CESIUM_TOKEN;

        const viewer = new Viewer(containerRef.current, {
            animation: false,
            timeline: false,
            infoBox: false,
            selectionIndicator: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            navigationHelpButton: false,
            sceneModePicker: false,
        });

        viewerRef.current = viewer;

        viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        // Draw Origin
        const originPin = createPinIcon('#00e5ff');
        viewer.entities.add({
            position: Cartesian3.fromDegrees(origin.lon, origin.lat),
            billboard: {
                image: originPin,
                verticalOrigin: VerticalOrigin.BOTTOM,
                width: 36,
                height: 44,
            },
            label: {
                text: origin.name,
                font: 'bold 13pt sans-serif',
                verticalOrigin: VerticalOrigin.BOTTOM,
                horizontalOrigin: HorizontalOrigin.LEFT,
                pixelOffset: new Cartesian2(20, -12),
                fillColor: Color.CYAN,
                outlineColor: Color.BLACK,
                outlineWidth: 3,
                style: LabelStyle.FILL_AND_OUTLINE,
            },
        });

        // Draw Location Pins + Arcs
        locations.forEach((loc) => {
            const { cesium: statusColor, css: cssColor } = getStatusColor(loc.latency);
            const pinImage = createPinIcon(cssColor);

            viewer.entities.add({
                name: loc.name,
                position: Cartesian3.fromDegrees(loc.lon, loc.lat),
                billboard: {
                    image: pinImage,
                    verticalOrigin: VerticalOrigin.BOTTOM,
                    width: 28,
                    height: 36,
                },
                label: {
                    text: loc.name,
                    font: '11px sans-serif',
                    verticalOrigin: VerticalOrigin.BOTTOM,
                    horizontalOrigin: HorizontalOrigin.LEFT,
                    pixelOffset: new Cartesian2(16, -10),
                    fillColor: statusColor,
                    outlineColor: Color.BLACK,
                    outlineWidth: 2,
                    style: LabelStyle.FILL_AND_OUTLINE,
                },
                properties: { locData: loc },
            });

            viewer.entities.add({
                polyline: {
                    positions: Cartesian3.fromDegreesArray([origin.lon, origin.lat, loc.lon, loc.lat]),
                    width: 2,
                    material: new PolylineGlowMaterialProperty({
                        glowPower: 0.2,
                        color: statusColor.withAlpha(0.4),
                    }),
                    arcType: ArcType.GEODESIC,
                },
            });
        });

        // Hover handler
        const popupEl = popupRef.current;
        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
        let lastPickedName = null;

        handler.setInputAction((movement) => {
            const picked = viewer.scene.pick(movement.endPosition);

            if (defined(picked) && picked.id && picked.id.properties && picked.id.properties.locData) {
                const loc = picked.id.properties.locData.getValue();

                if (loc.name !== lastPickedName) {
                    popupEl.innerHTML = buildPopupHTML(loc);
                    lastPickedName = loc.name;
                }

                const rect = containerRef.current.getBoundingClientRect();
                const px = movement.endPosition.x + 18;
                const py = movement.endPosition.y - 12;
                const maxX = rect.width - popupEl.offsetWidth - 16;
                const maxY = rect.height - popupEl.offsetHeight - 16;

                popupEl.style.left = Math.min(px, maxX) + 'px';
                popupEl.style.top = Math.max(8, Math.min(py, maxY)) + 'px';
                popupEl.className = 'globe-hover-popup visible';
            } else {
                if (lastPickedName !== null) {
                    popupEl.className = 'globe-hover-popup hidden';
                    lastPickedName = null;
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        viewer.zoomTo(viewer.entities);

        return () => {
            handler.destroy();
            if (!viewer.isDestroyed()) {
                viewer.destroy();
            }
        };
    }, []);

    return (
        <div className="relative w-full h-full" style={{ minHeight: '300px' }}>
            <div ref={containerRef} className="w-full h-full" />
            <div ref={popupRef} className="globe-hover-popup hidden" />
        </div>
    );
}
