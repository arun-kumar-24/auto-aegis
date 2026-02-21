import {
  Viewer, Cartesian3, Color, VerticalOrigin, HorizontalOrigin,
  PolylineGlowMaterialProperty, ArcType, Cartesian2, Ion,
  LabelStyle, ScreenSpaceEventHandler, ScreenSpaceEventType,
  defined, SceneTransforms
} from 'cesium';
import './style.css';
import "cesium/Build/Cesium/Widgets/widgets.css";
import { origin, locations } from './world.js';

// ==========================================
// 1. SET YOUR TOKEN
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwMDJhNWIzYS1mZGQ0LTRhY2MtYTFmMC1lN2IxYzU2MWM5MjciLCJpZCI6MzM5NDU5LCJpYXQiOjE3NTczNDM4NDh9.9ol6os_vF8JKQqAM9-6jLbKob_Kiszmj7fPBnGnFoao';
// ==========================================

// ==========================================
// 2. Pin icon generator (canvas-drawn map pin)
// ==========================================
const pinCache = {};

function createPinIcon(cssColor) {
  if (pinCache[cssColor]) return pinCache[cssColor];

  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size + 12;
  const ctx = canvas.getContext('2d');

  // Pin body (teardrop)
  ctx.beginPath();
  ctx.moveTo(size / 2, size + 6);                 // bottom tip
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

// ==========================================
// 3. SVG pie chart builder
// ==========================================
function buildPieSVG(successPct) {
  const failPct = 100 - successPct;
  const r = 40, cx = 45, cy = 45;

  let slices;
  if (successPct >= 100) {
    // Full green circle
    slices = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#00e676" opacity="0.9"/>`;
  } else if (successPct <= 0) {
    // Full red circle
    slices = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ff4444" opacity="0.85"/>`;
  } else {
    // SVG arc for success portion
    const angle = (successPct / 100) * 360;
    const rad = (a) => (a - 90) * Math.PI / 180;

    const x1 = cx + r * Math.cos(rad(0));
    const y1 = cy + r * Math.sin(rad(0));
    const x2 = cx + r * Math.cos(rad(angle));
    const y2 = cy + r * Math.sin(rad(angle));
    const largeArc = angle > 180 ? 1 : 0;

    slices = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ff4444" opacity="0.85"/>
      <path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z"
            fill="#00e676" opacity="0.9"/>`;
  }

  return `
    <svg width="90" height="90" viewBox="0 0 90 90">
      ${slices}
      <circle cx="${cx}" cy="${cy}" r="18" fill="rgba(10,14,26,0.85)"/>
      <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle"
            fill="#fff" font-size="11" font-weight="700">${successPct}%</text>
    </svg>`;
}

// ==========================================
// 4. Popup HTML builder
// ==========================================
function buildPopupHTML(loc) {
  const latencyClass = loc.latency <= 100 ? 'low' : loc.latency <= 200 ? 'medium' : 'high';
  const latencyLabel = latencyClass === 'low' ? 'Low' : latencyClass === 'medium' ? 'Medium' : 'High';
  const pinColor = latencyClass === 'low' ? '#00ff64' : latencyClass === 'medium' ? '#ffdc00' : '#ff4444';

  const successPct = Math.round((loc.successHits / loc.totalHits) * 100);
  const failHits = loc.totalHits - loc.successHits;

  return `
    <div class="popup-header">
      <span class="pin-icon" style="color:${pinColor}">📍</span>
      <span class="loc-name">${loc.name}</span>
    </div>
    <div class="popup-details">
      <span class="detail-label">Latitude</span>
      <span class="detail-value">${loc.lat.toFixed(4)}°</span>

      <span class="detail-label">Longitude</span>
      <span class="detail-value">${loc.lon.toFixed(4)}°</span>

      <span class="detail-label">Latency</span>
      <span class="detail-value">
        <span class="latency-badge ${latencyClass}">${loc.latency} ms · ${latencyLabel}</span>
      </span>

      <span class="detail-label">Total Hits</span>
      <span class="detail-value">${loc.totalHits.toLocaleString()}</span>
    </div>
    <div class="popup-chart-section">
      ${buildPieSVG(successPct)}
      <div class="chart-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background:#00e676"></span>
          <span>Success</span>
          <span class="legend-value">${loc.successHits.toLocaleString()}</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background:#ff4444"></span>
          <span>Failed</span>
          <span class="legend-value">${failHits.toLocaleString()}</span>
        </div>
      </div>
    </div>`;
}

// ==========================================
// 5. Initialize the Viewer
// ==========================================
const viewer = new Viewer('app', {
  animation: false,
  timeline: false,
  infoBox: false,
  selectionIndicator: false,
  baseLayerPicker: false
});

// Disable double-click zoom-to-entity (we handle our own interaction)
viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

// ==========================================
// 6. Helper: get color string from latency
// ==========================================
function getStatusColor(latency) {
  if (latency > 200) return { cesium: Color.RED, css: '#ff4444' };
  if (latency > 100) return { cesium: Color.YELLOW, css: '#ffdc00' };
  return { cesium: Color.LIME, css: '#00ff64' };
}

// ==========================================
// 7. Draw Origin
// ==========================================
const originPin = createPinIcon('#00e5ff');

viewer.entities.add({
  position: Cartesian3.fromDegrees(origin.lon, origin.lat),
  billboard: {
    image: originPin,
    verticalOrigin: VerticalOrigin.BOTTOM,
    width: 36,
    height: 44
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
    style: LabelStyle.FILL_AND_OUTLINE
  }
});

// ==========================================
// 8. Draw Location Pins + Arcs
// ==========================================
locations.forEach(loc => {
  const { cesium: statusColor, css: cssColor } = getStatusColor(loc.latency);
  const pinImage = createPinIcon(cssColor);

  // Pin billboard
  viewer.entities.add({
    name: loc.name,
    position: Cartesian3.fromDegrees(loc.lon, loc.lat),
    billboard: {
      image: pinImage,
      verticalOrigin: VerticalOrigin.BOTTOM,
      width: 28,
      height: 36
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
      style: LabelStyle.FILL_AND_OUTLINE
    },
    properties: { locData: loc }   // stash data for hover lookup
  });

  // Arc
  viewer.entities.add({
    polyline: {
      positions: Cartesian3.fromDegreesArray([origin.lon, origin.lat, loc.lon, loc.lat]),
      width: 2,
      material: new PolylineGlowMaterialProperty({
        glowPower: 0.2,
        color: statusColor.withAlpha(0.4)
      }),
      arcType: ArcType.GEODESIC
    }
  });
});

// ==========================================
// 9. Hover handler — show / hide popup
// ==========================================
const popup = document.getElementById('hover-popup');
const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
let lastPickedName = null;

handler.setInputAction((movement) => {
  const picked = viewer.scene.pick(movement.endPosition);

  if (defined(picked) && picked.id && picked.id.properties && picked.id.properties.locData) {
    const loc = picked.id.properties.locData.getValue();
    const pos = picked.id.position?.getValue(viewer.clock.currentTime);

    if (loc.name !== lastPickedName) {
      popup.innerHTML = buildPopupHTML(loc);
      lastPickedName = loc.name;
    }

    // Position the popup near the cursor but clamped to viewport
    const px = movement.endPosition.x + 18;
    const py = movement.endPosition.y - 12;
    const maxX = window.innerWidth - popup.offsetWidth - 16;
    const maxY = window.innerHeight - popup.offsetHeight - 16;

    popup.style.left = Math.min(px, maxX) + 'px';
    popup.style.top = Math.max(8, Math.min(py, maxY)) + 'px';
    popup.className = 'hover-popup visible';

  } else {
    if (lastPickedName !== null) {
      popup.className = 'hover-popup hidden';
      lastPickedName = null;
    }
  }
}, ScreenSpaceEventType.MOUSE_MOVE);

// ==========================================
// 10. Camera fly-in
// ==========================================
viewer.zoomTo(viewer.entities);
