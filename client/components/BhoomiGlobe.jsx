'use client';

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";

// ==========================================
// Bhoomi Globe Config
// ==========================================
if (typeof window !== 'undefined') {
    window.CESIUM_BASE_URL = '/cesium';
}

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDJhNWIzYS1mZGQ0LTRhY2MtYTFmMC1lN2IxYzU2MWM5MjciLCJpZCI6MzM5NDU5LCJpYXQiOjE3NTczNDM4NDh9.9ol6os_vF8JKQqAM9-6jLbKob_Kiszmj7fPBnGnFoao';

const pinCache = {};

function createPinIcon(cssColor) {
    if (typeof document === 'undefined') return '';
    if (pinCache[cssColor]) return pinCache[cssColor];

    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size + 12;
    const ctx = canvas.getContext('2d');

    // Pin body
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

    // Inner dot
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 6, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    pinCache[cssColor] = dataUrl;
    return dataUrl;
}

export default function BhoomiGlobe({ monitor }) {
    const containerRef = useRef(null);
    const viewerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Viewer
        const viewer = new Cesium.Viewer(containerRef.current, {
            animation: false,
            timeline: false,
            infoBox: false,
            selectionIndicator: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            homeButton: false,
            geocoder: false,
            sceneModePicker: true, // User requested 2D/3D option
            fullscreenButton: false,
            vrButton: false,
        });

        viewerRef.current = viewer;

        // Remove credits for cleaner UI
        if (viewer.cesiumWidget.creditContainer) {
            viewer.cesiumWidget.creditContainer.style.display = 'none';
        }

        // Add monitor location if provided
        if (monitor && monitor.lat && monitor.lon) {
            const pinImage = createPinIcon('#8b5cf6'); // Violet for monitors

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(monitor.lon, monitor.lat),
                billboard: {
                    image: pinImage,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    width: 32,
                    height: 40
                },
                label: {
                    text: monitor.name || 'Monitor',
                    font: 'bold 12px sans-serif',
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                    pixelOffset: new Cesium.Cartesian2(12, -8),
                    fillColor: Cesium.Color.VIOLET,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE
                }
            });

            // Fly to location
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(monitor.lon, monitor.lat, 15000000),
                duration: 3
            });
        }

        // Programmatic Rotation
        const rotationSpeed = 0.002;
        const update = () => {
            if (viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
                viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, rotationSpeed);
            }
            requestAnimationFrame(update);
        };
        const animId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animId);
            if (viewerRef.current) {
                viewerRef.current.destroy();
                viewerRef.current = null;
            }
        };
    }, [monitor]);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-[2rem] border border-gray-100 bg-gray-900 shadow-2xl">
            <div ref={containerRef} className="w-full h-full" />
            <div className="absolute top-4 left-4 z-10">
                <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{monitor?.name || 'Live Globe'}</span>
                </div>
            </div>
        </div>
    );
}
