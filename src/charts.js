/**
 * VoltLens Native SVG Vector Charting Engine
 * 100% Offline: Zero external dependencies, pure mathematical SVG rendering.
 * Human-friendly labels and crisp typography.
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
  const radius = 56;
  const stroke = 11;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  let strokeColor = '#10b981'; // green
  if (percent < 50) strokeColor = '#ef4444'; // red
  else if (percent < 70) strokeColor = '#f59e0b'; // amber
  else if (percent < 85) strokeColor = '#0284c7'; // blue

  return `
    <div class="relative inline-flex items-center justify-center">
      <svg height="${radius * 2}" width="${radius * 2}" class="transform -rotate-90">
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          stroke-width="${stroke}"
          r="${normalizedRadius}"
          cx="${radius}"
          cy="${radius}"
        />
        <circle
          stroke="${strokeColor}"
          fill="transparent"
          stroke-width="${stroke}"
          stroke-dasharray="${circumference} ${circumference}"
          style="stroke-dashoffset: ${strokeDashoffset}; transition: stroke-dashoffset 1s ease-in-out;"
          stroke-linecap="round"
          r="${normalizedRadius}"
          cx="${radius}"
          cy="${radius}"
        />
      </svg>
      <div class="absolute flex flex-col items-center">
        <span class="text-3xl font-extrabold tracking-tight text-slate-900">${percent}%</span>
        <span class="text-xs font-bold px-2 py-0.5 rounded-full mt-0.5" style="background-color: ${strokeColor}18; color: ${strokeColor}">
          Grade ${grade}
        </span>
      </div>
    </div>
  `;
}

export function renderDegradationChart(dataPoints, designCapMWh) {
  if (!dataPoints || dataPoints.length < 2) {
    return `<div class="p-8 text-center text-slate-400">Insufficient history points to generate trajectory chart.</div>`;
  }

  const width = 850;
  const height = 280;
  const padding = { top: 30, right: 35, bottom: 45, left: 75 };

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
    <div class="w-full overflow-x-auto">
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto max-w-full select-none">
        <defs>
          <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.30"/>
            <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines & Y Labels -->
        ${gridLines}

        <!-- Design Capacity Reference Line -->
        <line x1="${padding.left}" y1="${designY}" x2="${width - padding.right}" y2="${designY}" stroke="#64748b" stroke-dasharray="4 4" stroke-width="1.5"/>
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

export function renderRuntimeBar(originalStr, currentStr, percentLost) {
  return `
    <div class="space-y-3">
      <div class="flex justify-between items-center text-sm">
        <span class="text-slate-600 font-medium">Original Factory Runtime</span>
        <span class="font-bold text-slate-900">${originalStr}</span>
      </div>
      <div class="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
        <div class="bg-sky-600 h-3.5 rounded-full" style="width: 100%"></div>
      </div>

      <div class="flex justify-between items-center text-sm pt-2">
        <span class="text-slate-600 font-medium">Current Observed Runtime</span>
        <span class="font-bold text-slate-900">${currentStr}</span>
      </div>
      <div class="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
        <div class="bg-rose-500 h-3.5 rounded-full" style="width: ${Math.max(12, 100 - percentLost)}%"></div>
      </div>

      <div class="flex items-center justify-between text-xs text-rose-600 font-bold pt-1">
        <span>Lost Duration: -${percentLost}%</span>
        <span>${originalStr} → ${currentStr}</span>
      </div>
    </div>
  `;
}
