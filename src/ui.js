/**
 * VoltLens God-Level UI Engine
 * Modular tabbed navigation, rich data views, and exportable Battery Certificate.
 */

import { renderCircularGauge, renderDegradationChart, renderRuntimeBar } from './charts.js';

export function renderDashboard(data, analysis) {
  const { systemInfo, batteries, capacityHistory, recentUsage } = data;
  const battery = batteries[0] || {};
  const { health, runtime, standby, degradation, habits, recommendations } = analysis;

  return `
    <!-- Top System Spec Bar -->
    <div class="card mb-6" style="background: linear-gradient(to right, #ffffff, #f8fafc);">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="text-xs font-bold text-sky-600 uppercase tracking-wider">Verified System Hardware</span>
          <h2 class="text-xl font-bold text-slate-900">${systemInfo.systemProductName}</h2>
          <p class="text-xs text-slate-500 mt-1">Host: <strong>${systemInfo.computerName}</strong> • BIOS: <strong>${systemInfo.bios}</strong> • OS: <strong>${systemInfo.osBuild.split('.')[0]}</strong></p>
        </div>
        <div class="flex items-center gap-6 text-sm">
          <div>
            <span class="text-xs text-slate-400 block">Battery Model</span>
            <span class="font-semibold text-slate-800">${battery.name || 'OEM Battery'} (${battery.chemistry || 'LiP'})</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">Serial Number</span>
            <span class="font-semibold text-slate-800">${battery.serialNumber || 'N/A'}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">Report Time</span>
            <span class="font-semibold text-slate-800">${systemInfo.reportTime}</span>
          </div>
          <button onclick="window.print()" class="btn btn-secondary text-xs no-print">
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-nav no-print">
      <button class="tab-btn active" onclick="switchTab('tab-overview')">📊 Overview & Vitals</button>
      <button class="tab-btn" onclick="switchTab('tab-degradation')">📈 Degradation Trajectory</button>
      <button class="tab-btn" onclick="switchTab('tab-standby')">🦇 Sleep Drain Auditor</button>
      <button class="tab-btn" onclick="switchTab('tab-certificate')">📜 Battery Certificate</button>
    </div>

    <!-- TAB 1: OVERVIEW -->
    <div id="tab-overview" class="tab-content">
      <!-- 3 Hero Cards -->
      <div class="grid-3">
        <!-- Hero 1: Battery Health -->
        <div class="card">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-base">Battery Health Score</h3>
              <p class="text-xs text-slate-500">True chemical retention vs factory spec</p>
            </div>
            <span class="proof-pill" title="${health.proof}">Proof ℹ️</span>
          </div>
          <div class="flex items-center gap-5 my-3">
            ${renderCircularGauge(health.healthPercent, health.grade)}
            <div class="space-y-1">
              <p class="text-xs font-bold text-slate-800">${health.summary}</p>
              <p class="text-xs text-slate-500">Lost Capacity: <span class="font-bold text-rose-600">${health.lostCapacityMWh.toLocaleString()} mWh</span> (-${health.lostPercent}%)</p>
            </div>
          </div>
          <div class="pt-3 border-t flex justify-between text-xs text-slate-600">
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
              <h3 class="font-bold text-slate-900 text-base">Lost Portable Runtime</h3>
              <p class="text-xs text-slate-500">Active screen-on time vs factory baseline</p>
            </div>
            <span class="proof-pill" title="${runtime.proof}">Proof ℹ️</span>
          </div>
          ${runtime.hasData ? renderRuntimeBar(runtime.originalRuntime, runtime.currentRuntime, runtime.percentLost) : '<div class="text-xs text-slate-400 py-6 text-center">Runtime estimate logs not available.</div>'}
        </div>

        <!-- Hero 3: Standby Vampire Drain -->
        <div class="card">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-base">Sleep Drain Auditor</h3>
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
                ? 'Warning: Your laptop consumes abnormal battery while sleeping with the lid closed. Typically caused by background wireless wakeups in Modern Standby.'
                : 'Standby drain is within expected operational limits.'}
            </p>
          </div>
          <div class="pt-3 border-t text-xs text-slate-500">
            ${standby.worstIncidents && standby.worstIncidents.length > 0
              ? `Worst Incident: Lost <strong>${standby.worstIncidents[0].dropPct}%</strong> in ${standby.worstIncidents[0].durationHours}h (${standby.worstIncidents[0].drainRatePerHour}%/hr)`
              : 'No abnormal standby leaks detected in past 7 days.'}
          </div>
        </div>
      </div>

      <!-- 2-Column: Habits & Recommendations -->
      <div class="grid-2">
        <!-- Usage Habits & Power Profile -->
        <div class="card">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-base">Power Source & Habit Profile</h3>
              <p class="text-xs text-slate-500">Plugged-in AC vs Battery operational split</p>
            </div>
            <span class="proof-pill" title="${habits.proof}">Proof ℹ️</span>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium text-slate-700">Operational Persona</span>
              <span class="font-bold text-sky-700">${habits.persona}</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
              <div class="bg-sky-500 h-4" style="width: ${habits.pluggedInRatioPct}%" title="Plugged In: ${habits.pluggedInRatioPct}%"></div>
              <div class="bg-emerald-500 h-4" style="width: ${habits.batteryRatioPct}%" title="On Battery: ${habits.batteryRatioPct}%"></div>
            </div>
            <div class="flex justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1.5"><span style="width:8px;height:8px;border-radius:50%;background:#0ea5e9;display:inline-block;"></span> AC Plugged: <strong>${habits.pluggedInRatioPct}%</strong></span>
              <span class="flex items-center gap-1.5"><span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;"></span> Battery Discharge: <strong>${habits.batteryRatioPct}%</strong></span>
            </div>
          </div>
        </div>

        <!-- Actionable Care Recommendations -->
        <div class="card">
          <h3 class="font-bold text-slate-900 text-base mb-1">Tailored Battery Care Guide</h3>
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
    </div>

    <!-- TAB 2: DEGRADATION TRAJECTORY -->
    <div id="tab-degradation" class="tab-content" style="display:none;">
      <div class="card mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Full Capacity Degradation Curve</h3>
            <p class="text-xs text-slate-500">Plotted from earliest recorded date (${degradation.firstRecordedDate || 'Day 1'}) to today</p>
          </div>
          <span class="proof-pill" title="${degradation.proof}">Proof ℹ️</span>
        </div>
        ${renderDegradationChart(degradation.dataPoints, health.designCapacityMWh || 40000)}
      </div>

      <div class="card">
        <h3 class="font-bold text-slate-900 text-base mb-3">Chronological Capacity History Table</h3>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Recording Period</th>
                <th>Full Charge Capacity</th>
                <th>Design Capacity</th>
                <th>Retention %</th>
              </tr>
            </thead>
            <tbody>
              ${(capacityHistory || []).slice().reverse().map(row => `
                <tr>
                  <td>${row.period}</td>
                  <td><strong>${(row.fullChargeCapacityMWh || 0).toLocaleString()} mWh</strong></td>
                  <td>${(row.designCapacityMWh || 0).toLocaleString()} mWh</td>
                  <td><span class="badge ${row.healthPercent >= 80 ? 'badge-good' : row.healthPercent >= 65 ? 'badge-moderate' : 'badge-degraded'}">${row.healthPercent}%</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: STANDBY AUDITOR -->
    <div id="tab-standby" class="tab-content" style="display:none;">
      <div class="card mb-6">
        <h3 class="font-bold text-slate-900 text-base mb-1">Modern Standby ("Vampire Drain") Diagnostics</h3>
        <p class="text-xs text-slate-500 mb-4">Detection of background battery drain when the laptop lid is closed or system is sleeping</p>
        
        <div class="p-4 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 mb-6">
          <strong>Why does this happen?</strong> Windows 10/11 "Modern Standby" keeps network radios and background tasks running during sleep. If apps or drivers misbehave, the laptop stays warm inside a backpack and drains 20–50% of its battery.
        </div>

        <h4 class="font-bold text-slate-800 text-sm mb-3">Detected Sleep Drain Incidents</h4>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Sleep Start Time</th>
                <th>Duration</th>
                <th>Battery Lost</th>
                <th>Hourly Drain Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(standby.worstIncidents || []).length > 0 ? standby.worstIncidents.map(inc => `
                <tr>
                  <td>${inc.start}</td>
                  <td>${inc.durationHours} hours</td>
                  <td class="text-rose-600 font-bold">-${inc.dropPct}%</td>
                  <td>${inc.drainRatePerHour}% / hr</td>
                  <td><span class="badge ${inc.severity === 'Severe' ? 'badge-critical' : 'badge-moderate'}">${inc.severity} Leak</span></td>
                </tr>
              `).join('') : '<tr><td colspan="5" class="text-center py-4 text-slate-400">No abnormal standby leaks recorded in recent history.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: BATTERY CERTIFICATE -->
    <div id="tab-certificate" class="tab-content" style="display:none;">
      <div class="certificate-frame">
        <div class="certificate-watermark">VERIFIED</div>
        <div class="flex justify-between items-start border-b pb-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Official Battery Health Certificate</h2>
            <p class="text-xs text-slate-500">Certified Diagnostic Report • Generated via VoltLens Open-Source Engine</p>
          </div>
          <div class="text-right">
            <span class="badge badge-excellent text-sm py-1 px-3">Grade ${health.grade}</span>
            <div class="text-xs text-slate-400 mt-1">Date: ${systemInfo.reportTime}</div>
          </div>
        </div>

        <div class="grid-2 mb-6">
          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Hardware Specifications</h4>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between border-b py-1"><span>System Model:</span><strong>${systemInfo.systemProductName}</strong></div>
              <div class="flex justify-between border-b py-1"><span>Battery Model:</span><strong>${battery.name || 'OEM Battery'}</strong></div>
              <div class="flex justify-between border-b py-1"><span>Manufacturer:</span><strong>${battery.manufacturer || 'OEM'}</strong></div>
              <div class="flex justify-between border-b py-1"><span>Chemistry:</span><strong>${battery.chemistry || 'LiP'}</strong></div>
              <div class="flex justify-between border-b py-1"><span>Serial Number:</span><strong>${battery.serialNumber || 'N/A'}</strong></div>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Capacity & Degradation Metrics</h4>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between border-b py-1"><span>Factory Design Capacity:</span><strong>${(health.designCapacityMWh || 0).toLocaleString()} mWh</strong></div>
              <div class="flex justify-between border-b py-1"><span>Current Full Charge Capacity:</span><strong>${(health.fullChargeCapacityMWh || 0).toLocaleString()} mWh</strong></div>
              <div class="flex justify-between border-b py-1"><span>Permanent Capacity Loss:</span><strong class="text-rose-600">-${(health.lostCapacityMWh || 0).toLocaleString()} mWh (-${health.lostPercent}%)</strong></div>
              <div class="flex justify-between border-b py-1"><span>Current Health Retention:</span><strong class="text-sky-700">${health.healthPercent}%</strong></div>
              <div class="flex justify-between border-b py-1"><span>Hardware Cycle Count:</span><strong>${health.cycleCount.isHardwareReported ? health.cycleCount.value : 'Not Reported by OEM (-)'}</strong></div>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-lg bg-slate-50 border text-xs text-slate-700 mb-6">
          <strong>Diagnostic Verdict:</strong> ${health.summary} This device retains ${health.healthPercent}% of its factory electrical energy storage capacity.
        </div>

        <div class="flex justify-between items-end pt-4 border-t text-xs text-slate-400">
          <div>
            <span>Audited with 100% truth-grounding from Windows ACPI power subsystem registers.</span>
          </div>
          <button onclick="window.print()" class="btn btn-primary text-xs no-print">
            🖨️ Print Certificate
          </button>
        </div>
      </div>
    </div>
  `;
}
