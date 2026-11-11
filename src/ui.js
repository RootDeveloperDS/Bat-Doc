/**
 * VoltLens UI Rendering Engine
 * Translates parsed data and analytical insights into a high-grade light dashboard.
 */

import { renderCircularGauge, renderDegradationChart, renderRuntimeBar } from './charts.js';

export function renderDashboard(data, analysis) {
  const { systemInfo, batteries } = data;
  const battery = batteries[0] || {};
  const { health, runtime, standby, degradation, habits, recommendations } = analysis;

  return `
    <!-- Top System Spec Bar -->
    <div class="card mb-6 bg-slate-50 border-slate-200">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Device Hardware</span>
          <h2 class="text-lg font-bold text-slate-900">${systemInfo.systemProductName}</h2>
          <p class="text-xs text-slate-500">${systemInfo.computerName} • BIOS ${systemInfo.bios} • OS ${systemInfo.osBuild.split('.')[0]}</p>
        </div>
        <div class="flex items-center gap-6 text-sm">
          <div>
            <span class="text-xs text-slate-500 block">Battery Model</span>
            <span class="font-semibold text-slate-800">${battery.name || 'OEM Battery'} (${battery.chemistry || 'LiP'})</span>
          </div>
          <div>
            <span class="text-xs text-slate-500 block">Report Date</span>
            <span class="font-semibold text-slate-800">${systemInfo.reportTime}</span>
          </div>
          <button onclick="window.print()" class="btn btn-secondary text-xs no-print">
            🖨️ Export / Print PDF
          </button>
        </div>
      </div>
    </div>

    <!-- 3 Core Hero Cards -->
    <div class="grid-3">
      <!-- Hero 1: Battery Health -->
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-slate-800 text-base">Battery Health Score</h3>
            <p class="text-xs text-slate-500">True chemical retention vs factory spec</p>
          </div>
          <span class="proof-pill" title="${health.proof}">Proof ℹ️</span>
        </div>
        <div class="flex items-center gap-5 my-3">
          ${renderCircularGauge(health.healthPercent, health.grade)}
          <div class="space-y-1">
            <p class="text-xs font-semibold text-slate-700">${health.summary}</p>
            <p class="text-xs text-slate-500">Lost Capacity: <span class="font-bold text-rose-600">${health.lostCapacityMWh.toLocaleString()} mWh</span> (-${health.lostPercent}%)</p>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
          <span>Design: <strong>${(health.designCapacityMWh || 0).toLocaleString()} mWh</strong></span>
          <span>Current: <strong>${(health.fullChargeCapacityMWh || 0).toLocaleString()} mWh</strong></span>
        </div>
        <div class="mt-2 text-xs text-slate-400">
          Hardware Cycles: ${health.cycleCount.isHardwareReported ? health.cycleCount.value : '<span title="OEM sensor omitted cycle counter in hardware">Not reported by OEM (-)</span>'}
        </div>
      </div>

      <!-- Hero 2: Lost Runtime -->
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-slate-800 text-base">Lost Portable Runtime</h3>
            <p class="text-xs text-slate-500">Active screen-on time vs day one</p>
          </div>
          <span class="proof-pill" title="${runtime.proof}">Proof ℹ️</span>
        </div>
        ${runtime.hasData ? renderRuntimeBar(runtime.originalRuntime, runtime.currentRuntime, runtime.percentLost) : '<div class="text-xs text-slate-400 py-6 text-center">Runtime estimate logs not available.</div>'}
      </div>

      <!-- Hero 3: Standby Vampire Drain -->
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-slate-800 text-base">Sleep Drain Auditor</h3>
            <p class="text-xs text-slate-500">Modern standby power loss rate</p>
          </div>
          <span class="proof-pill" title="${standby.proof}">Proof ℹ️</span>
        </div>
        <div class="my-2">
          <div class="flex items-center gap-2 mb-2">
            <span class="badge ${standby.badgeClass}">${standby.severity}</span>
            <span class="text-sm font-bold text-slate-800">${standby.avgDrainPerHour || 0}% / hour</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">
            ${standby.severity === 'Severe Leak'
              ? 'Warning: Your laptop consumes abnormal battery while sleeping with the lid closed. Typically caused by background wireless wakeups.'
              : 'Standby drain is within expected operational limits.'}
          </p>
        </div>
        <div class="pt-3 border-t border-slate-100 text-xs text-slate-500">
          ${standby.worstIncidents && standby.worstIncidents.length > 0
            ? `Worst Leak: Lost <strong>${standby.worstIncidents[0].dropPct}%</strong> in ${standby.worstIncidents[0].durationHours}h (${standby.worstIncidents[0].drainRatePerHour}%/hr)`
            : 'No abnormal standby leaks detected in past 7 days.'}
        </div>
      </div>
    </div>

    <!-- Degradation Trajectory Section -->
    <div class="card mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="font-bold text-slate-800 text-base">Capacity Degradation Trajectory</h3>
          <p class="text-xs text-slate-500">Chronological retention curve from initial recorded date to today</p>
        </div>
        <span class="proof-pill" title="${degradation.proof}">Proof ℹ️</span>
      </div>
      ${renderDegradationChart(degradation.dataPoints, health.designCapacityMWh || 40000)}
    </div>

    <!-- 2 Column Section: Habits & Recommendations -->
    <div class="grid-2">
      <!-- Usage Habits & Power Profile -->
      <div class="card">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="font-bold text-slate-800 text-base">Power Source & Habit Profile</h3>
            <p class="text-xs text-slate-500">Plugged-in AC vs Battery operational split</p>
          </div>
          <span class="proof-pill" title="${habits.proof}">Proof ℹ️</span>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium text-slate-700">User Persona</span>
            <span class="font-bold text-sky-700">${habits.persona}</span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
            <div class="bg-sky-500 h-4" style="width: ${habits.pluggedInRatioPct}%" title="Plugged In: ${habits.pluggedInRatioPct}%"></div>
            <div class="bg-emerald-500 h-4" style="width: ${habits.batteryRatioPct}%" title="On Battery: ${habits.batteryRatioPct}%"></div>
          </div>
          <div class="flex justify-between text-xs text-slate-500">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-sky-500 rounded-full inline-block"></span> AC Plugged: ${habits.pluggedInRatioPct}%</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> Battery Discharge: ${habits.batteryRatioPct}%</span>
          </div>
        </div>
      </div>

      <!-- Actionable Care Recommendations -->
      <div class="card">
        <h3 class="font-bold text-slate-800 text-base mb-1">Tailored Battery Care Guide</h3>
        <p class="text-xs text-slate-500 mb-4">Manufacturer-neutral, actionable steps grounded in your report</p>
        <div class="space-y-3">
          ${recommendations.map(r => `
            <div class="p-3 rounded-lg border text-xs ${
              r.type === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-900' :
              r.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              r.type === 'tip' ? 'bg-sky-50 border-sky-200 text-sky-900' :
              'bg-slate-50 border-slate-200 text-slate-800'
            }">
              <div class="font-bold mb-0.5">${r.title}</div>
              <p class="mb-1.5 opacity-90">${r.desc}</p>
              <div class="font-semibold text-slate-900">👉 ${r.action}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
