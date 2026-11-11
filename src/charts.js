/**
 * BATDOC Native SVG Vector Charting Engine
 * 100% Offline: Zero external dependencies, pure mathematical SVG rendering.
 * Human-friendly labels, crisp typography, responsive layout.
 */

function parseShortDate(str) {
  if (!str) return '';
  const match = str.match(/(\d{4})-(\d{2})/);
  if (!match) return str;
  const year = match[1];
  const monthIdx = parseInt(match[2], 10) - 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthIdx] || match[2]} ${year}`;
}

export function renderCircularGauge(percent, grade) {
  const size = 140;
  const strokeWidth = 11;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  let strokeColor = '#10b981'; // emerald green
  let bgTint = '#ecfdf5';
  if (percent < 50) {
    strokeColor = '#ef4444'; // rose red
    bgTint = '#fff1f2';
  } else if (percent < 70) {
    strokeColor = '#f59e0b'; // amber orange
    bgTint = '#fffbeb';
  } else if (percent < 85) {
    strokeColor = '#0284c7'; // sky blue
    bgTint = '#f0f9ff';
  }

  return `
    <div class="gauge-svg-wrap">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="gauge-ring-svg">
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="none"
          stroke="#f1f5f9"
          stroke-width="${strokeWidth}"
        />
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="none"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          stroke-linecap="round"
          style="transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);"
        />
      </svg>
      <div class="gauge-center-text">
        <span class="gauge-pct">${percent}%</span>
        <span class="gauge-grade-badge" style="background-color: ${bgTint}; color: ${strokeColor}; border: 1px solid ${strokeColor}33;">
          Grade ${grade}
        </span>
      </div>
    </div>
  `;
}

export function renderRuntimeBar(originalStr, currentStr, percentLost) {
  const retainedPct = Math.max(12, Math.min(100, 100 - percentLost));
  return `
    <div class="runtime-card-body">
      <div class="runtime-row">
        <div class="runtime-label-row">
          <span class="runtime-type">Factory Spec Baseline</span>
          <span class="runtime-val">${originalStr}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill progress-fill-original" style="width: 100%;"></div>
        </div>
      </div>

      <div class="runtime-row">
        <div class="runtime-label-row">
          <span class="runtime-type">Observed Active Runtime</span>
          <span class="runtime-val">${currentStr}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill progress-fill-current" style="width: ${retainedPct}%;"></div>
        </div>
      </div>

      <div class="runtime-delta-box">
        <span class="delta-badge">-${percentLost}% Runtime Drop</span>
        <div class="delta-text">
          <span>${originalStr} factory → <strong>${currentStr}</strong> current</span>
        </div>
      </div>
    </div>
  `;
}

export function renderDegradationChart(dataPoints, designCapMWh) {
  if (!dataPoints || dataPoints.length < 2) {
    return `<div class="chart-empty-state">Insufficient history recorded by Windows to generate trajectory curve.</div>`;
  }

  const width = 850;
  const height = 280;
  const padding = { top: 32, right: 35, bottom: 45, left: 75 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const yMax = Math.max(designCapMWh * 1.05, ...dataPoints.map(p => p.fullChargeCapacityMWh * 1.05));
  const yMin = Math.min(...dataPoints.map(p => p.fullChargeCapacityMWh)) * 0.85;

  const getX = (idx) => padding.left + (idx / (dataPoints.length - 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - yMin) / (yMax - yMin)) * chartH;

  const points = dataPoints.map((pt, idx) => ({
    x: getX(idx),
    y: getY(pt.fullChargeCapacityMWh),
    val: pt.fullChargeCapacityMWh,
    period: pt.period
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${padding.top + chartH} L ${points[0].x.toFixed(1)} ${padding.top + chartH} Z`;

  const designY = getY(designCapMWh);

  // Y-axis grid lines (4 steps)
  const ySteps = 4;
  let gridLines = '';
  for (let i = 0; i <= ySteps; i++) {
    const val = yMin + ((yMax - yMin) / ySteps) * i;
    const yPos = getY(val);
    gridLines += `
      <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="#f1f5f9" stroke-dasharray="3 3"/>
      <text x="${padding.left - 12}" y="${yPos + 4}" font-size="11" fill="#94a3b8" text-anchor="end" font-weight="500">${Math.round(val).toLocaleString()} mWh</text>
    `;
  }

  // X-axis labels (4 evenly spaced dates formatted as "Month Year")
  const xIndices = [
    0,
    Math.floor(points.length * 0.33),
    Math.floor(points.length * 0.66),
    points.length - 1
  ];
  let xLabels = '';
  xIndices.forEach(idx => {
    const pt = points[idx];
    const friendlyDate = parseShortDate(pt.period);
    xLabels += `<text x="${pt.x}" y="${height - 12}" font-size="11" fill="#64748b" text-anchor="middle" font-weight="600">${friendlyDate}</text>`;
  });

  // Dots
  let dots = '';
  points.forEach((p) => {
    dots += `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#0284c7" stroke="#ffffff" stroke-width="2.5" class="cursor-pointer">
        <title>${p.period}: ${p.val.toLocaleString()} mWh</title>
      </circle>
    `;
  });

  return `
    <div class="chart-wrapper">
      <svg viewBox="0 0 ${width} ${height}" class="chart-svg select-none">
        <defs>
          <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines & Y Labels -->
        ${gridLines}

        <!-- Design Capacity Reference Line -->
        <line x1="${padding.left}" y1="${designY}" x2="${width - padding.right}" y2="${designY}" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.5"/>
        <text x="${width - padding.right}" y="${designY - 8}" font-size="11" fill="#475569" text-anchor="end" font-weight="700">
          Factory Baseline (${designCapMWh.toLocaleString()} mWh)
        </text>

        <!-- Area Fill -->
        <path d="${areaPath}" fill="url(#capacityGradient)"/>

        <!-- Line Path -->
        <path d="${linePath}" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Dots -->
        ${dots}

        <!-- X Labels -->
        ${xLabels}
      </svg>
    </div>
  `;
}
