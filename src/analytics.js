/**
 * VoltLens Analytics & Mathematical Intelligence Engine
 * 100% Truth-Grounded: Zero hallucination, strictly derived from physical report data.
 */

export function analyzeBatteryReport(data) {
  const battery = data.batteries[0] || null;
  const health = calculateHealth(battery);
  const runtime = calculateRuntimeGap(data.lifeEstimates);
  const standby = calculateStandbyAudit(data.recentUsage, battery ? battery.fullChargeCapacityMWh : null);
  const degradation = calculateDegradationTrend(data.capacityHistory);
  const habits = calculateHabitsProfile(data.usageHistory);
  const recommendations = generateRecommendations(health, standby, habits, battery);

  return {
    health,
    runtime,
    standby,
    degradation,
    habits,
    recommendations
  };
}

function calculateHealth(battery) {
  if (!battery || !battery.designCapacityMWh || !battery.fullChargeCapacityMWh) {
    return {
      status: 'Incomplete Data',
      healthPercent: 0,
      grade: 'N/A',
      lostCapacityMWh: 0,
      lostPercent: 0,
      cycleCount: { raw: '-', verified: false, syntheticEstimate: null },
      proof: 'Design or Full Charge Capacity missing in report'
    };
  }

  const design = battery.designCapacityMWh;
  const full = battery.fullChargeCapacityMWh;
  const healthPct = parseFloat(((full / design) * 100).toFixed(2));
  const lostMWh = Math.max(0, design - full);
  const lostPct = parseFloat(((lostMWh / design) * 100).toFixed(2));

  let grade = 'F';
  let badgeClass = 'badge-critical';
  let summary = 'Critical degradation. Battery needs replacement soon.';

  if (healthPct >= 95) {
    grade = 'A+';
    badgeClass = 'badge-pristine';
    summary = 'Pristine condition. Battery is essentially brand-new.';
  } else if (healthPct >= 85) {
    grade = 'A';
    badgeClass = 'badge-excellent';
    summary = 'Excellent health. Minor natural chemical wear.';
  } else if (healthPct >= 75) {
    grade = 'B';
    badgeClass = 'badge-good';
    summary = 'Good health. Normal operational capacity retention.';
  } else if (healthPct >= 65) {
    grade = 'C';
    badgeClass = 'badge-moderate';
    summary = 'Moderate wear. Battery noticeably drains faster than day one.';
  } else if (healthPct >= 50) {
    grade = 'D';
    badgeClass = 'badge-degraded';
    summary = 'Significant degradation. Battery service or replacement advised.';
  }

  const isCycleRawReported = battery.cycleCountRaw && battery.cycleCountRaw.trim() !== '-' && !isNaN(parseInt(battery.cycleCountRaw, 10));

  return {
    healthPercent: healthPct,
    grade,
    badgeClass,
    summary,
    designCapacityMWh: design,
    fullChargeCapacityMWh: full,
    lostCapacityMWh: lostMWh,
    lostPercent: lostPct,
    cycleCount: {
      raw: battery.cycleCountRaw,
      isHardwareReported: isCycleRawReported,
      value: isCycleRawReported ? parseInt(battery.cycleCountRaw, 10) : null
    },
    proof: `Derived from: Installed Batteries Table -> Design: ${design.toLocaleString()} mWh, Full Charge: ${full.toLocaleString()} mWh`
  };
}

function parseHmsToSeconds(hmsStr) {
  if (!hmsStr || hmsStr === '-') return null;
  const parts = hmsStr.split(':').map(p => parseInt(p, 10));
  if (parts.length === 3 && !parts.some(isNaN)) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
}

function formatSecondsToHms(totalSecs) {
  if (totalSecs === null || isNaN(totalSecs)) return 'N/A';
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

function calculateRuntimeGap(lifeEstimates) {
  const estimates = lifeEstimates ? lifeEstimates.estimates : [];
  if (!estimates || estimates.length === 0) {
    return {
      hasData: false,
      originalRuntime: 'N/A',
      currentRuntime: 'N/A',
      lostRuntime: 'N/A',
      percentLost: 0,
      proof: 'No life estimate rows recorded in report'
    };
  }

  // Baseline: earliest recorded full charge or design capacity active runtime
  let earliestActiveSec = null;
  let latestActiveSec = null;

  for (let i = 0; i < estimates.length; i++) {
    const sec = parseHmsToSeconds(estimates[i].designCapacity.active) || parseHmsToSeconds(estimates[i].fullCharge.active);
    if (sec && sec > 600) { // filter anomalies under 10 mins
      earliestActiveSec = sec;
      break;
    }
  }

  for (let i = estimates.length - 1; i >= 0; i--) {
    const sec = parseHmsToSeconds(estimates[i].fullCharge.active);
    if (sec && sec > 600) {
      latestActiveSec = sec;
      break;
    }
  }

  if (!earliestActiveSec || !latestActiveSec) {
    return {
      hasData: false,
      originalRuntime: 'N/A',
      currentRuntime: 'N/A',
      lostRuntime: 'N/A',
      percentLost: 0,
      proof: 'Insufficient valid runtime rows'
    };
  }

  const lostSecs = Math.max(0, earliestActiveSec - latestActiveSec);
  const pctLost = parseFloat(((lostSecs / earliestActiveSec) * 100).toFixed(1));

  return {
    hasData: true,
    originalRuntime: formatSecondsToHms(earliestActiveSec),
    currentRuntime: formatSecondsToHms(latestActiveSec),
    lostRuntime: formatSecondsToHms(lostSecs),
    percentLost: pctLost,
    originalSecs: earliestActiveSec,
    currentSecs: latestActiveSec,
    proof: `Earliest recorded baseline (${formatSecondsToHms(earliestActiveSec)}) vs Most recent full charge estimate (${formatSecondsToHms(latestActiveSec)})`
  };
}

function calculateStandbyAudit(recentUsage, fullChargeCapMWh) {
  if (!recentUsage || recentUsage.length < 2) {
    return {
      hasData: false,
      severity: 'Unknown',
      incidents: [],
      avgDrainPerHour: null,
      proof: 'Recent usage records insufficient'
    };
  }

  const standbyIncidents = [];
  let totalDrainedPct = 0;
  let totalHours = 0;

  for (let i = 0; i < recentUsage.length - 1; i++) {
    const current = recentUsage[i];
    const next = recentUsage[i + 1];

    const isStandby = current.state.toLowerCase().includes('standby') || current.state.toLowerCase().includes('suspend');
    if (isStandby && current.source.toLowerCase().includes('battery')) {
      const tStart = new Date(current.timestamp).getTime();
      const tEnd = new Date(next.timestamp).getTime();
      const diffMs = tEnd - tStart;

      if (!isNaN(diffMs) && diffMs >= 30 * 60 * 1000 && diffMs <= 72 * 3600 * 1000) { // 30 mins to 3 days
        const hours = diffMs / (1000 * 3600);
        const pStart = current.percentRemaining;
        const pEnd = next.percentRemaining;

        if (pStart !== null && pEnd !== null && pStart >= pEnd) {
          const dropPct = pStart - pEnd;
          const drainRatePerHour = parseFloat((dropPct / hours).toFixed(2));

          totalDrainedPct += dropPct;
          totalHours += hours;

          if (drainRatePerHour >= 1.5) { // Moderate to severe leak
            standbyIncidents.push({
              start: current.timestamp,
              durationHours: parseFloat(hours.toFixed(1)),
              dropPct,
              drainRatePerHour,
              severity: drainRatePerHour >= 3.0 ? 'Severe' : 'Moderate'
            });
          }
        }
      }
    }
  }

  const avgDrainPerHour = totalHours > 0 ? parseFloat((totalDrainedPct / totalHours).toFixed(2)) : 0;
  let severity = 'Healthy';
  let badgeClass = 'badge-good';

  if (avgDrainPerHour >= 3.0) {
    severity = 'Severe Leak';
    badgeClass = 'badge-critical';
  } else if (avgDrainPerHour >= 1.5) {
    severity = 'Moderate Drain';
    badgeClass = 'badge-moderate';
  }

  return {
    hasData: true,
    severity,
    badgeClass,
    avgDrainPerHour,
    totalIncidentsDetected: standbyIncidents.length,
    worstIncidents: standbyIncidents.sort((a, b) => b.drainRatePerHour - a.drainRatePerHour).slice(0, 5),
    proof: `Aggregated from ${recentUsage.length} power state transitions in Recent Usage table`
  };
}

function calculateDegradationTrend(capacityHistory) {
  if (!capacityHistory || capacityHistory.length < 2) {
    return {
      hasData: false,
      monthlyDeclineMWh: null,
      dataPoints: [],
      projectedHalfLife: null,
      proof: 'Insufficient capacity history points'
    };
  }

  const validPoints = capacityHistory.filter(p => p.fullChargeCapacityMWh && p.fullChargeCapacityMWh > 5000);
  if (validPoints.length < 2) {
    return { hasData: false, monthlyDeclineMWh: null, dataPoints: [], projectedHalfLife: null };
  }

  const firstPoint = validPoints[0];
  const lastPoint = validPoints[validPoints.length - 1];

  const totalCapacityLoss = Math.max(0, firstPoint.fullChargeCapacityMWh - lastPoint.fullChargeCapacityMWh);

  return {
    hasData: true,
    firstRecordedDate: firstPoint.period,
    lastRecordedDate: lastPoint.period,
    initialCapacityMWh: firstPoint.fullChargeCapacityMWh,
    currentCapacityMWh: lastPoint.fullChargeCapacityMWh,
    totalCapacityLossMWh: totalCapacityLoss,
    dataPoints: validPoints,
    proof: `Tracked across ${validPoints.length} chronological periods in Battery Capacity History`
  };
}

function calculateHabitsProfile(usageHistory) {
  if (!usageHistory || usageHistory.length === 0) {
    return {
      hasData: false,
      pluggedInRatioPct: 50,
      batteryRatioPct: 50,
      persona: 'Unknown',
      proof: 'No usage history logged'
    };
  }

  let totalAcSeconds = 0;
  let totalBatterySeconds = 0;

  usageHistory.forEach(item => {
    const acSec = (parseHmsToSeconds(item.acActive) || 0) + (parseHmsToSeconds(item.acStandby) || 0);
    const batSec = (parseHmsToSeconds(item.batteryActive) || 0) + (parseHmsToSeconds(item.batteryStandby) || 0);
    totalAcSeconds += acSec;
    totalBatterySeconds += batSec;
  });

  const totalSeconds = totalAcSeconds + totalBatterySeconds;
  if (totalSeconds === 0) {
    return { hasData: false, pluggedInRatioPct: 50, batteryRatioPct: 50, persona: 'Balanced User' };
  }

  const acPct = Math.round((totalAcSeconds / totalSeconds) * 100);
  const batPct = 100 - acPct;

  let persona = 'Hybrid Worker';
  if (acPct >= 80) persona = 'Desk Worker (Always Plugged In)';
  else if (acPct <= 35) persona = 'Road Warrior (Nomadic Battery User)';

  return {
    hasData: true,
    pluggedInRatioPct: acPct,
    batteryRatioPct: batPct,
    persona,
    proof: `Aggregated total AC vs Battery active & standby seconds from Usage History`
  };
}

function generateRecommendations(health, standby, habits, battery) {
  const recs = [];

  // Capacity / Health recs
  if (health.healthPercent < 65) {
    recs.push({
      type: 'critical',
      title: 'Battery Capacity Significantly Worn',
      desc: `Your battery has lost ${health.lostPercent}% of its factory energy storage. If on-the-go battery life is critical for your work, consider an OEM battery replacement.`,
      action: 'Check replacement availability using part number: ' + (battery ? battery.name : 'OEM specification')
    });
  }

  // Habits recs
  if (habits.hasData && habits.pluggedInRatioPct >= 75) {
    recs.push({
      type: 'tip',
      title: 'Enable Battery Charge Limit (Prolong Longevity)',
      desc: `You keep your laptop plugged into AC power ${habits.pluggedInRatioPct}% of the time. Keeping lithium cells constantly at 100% state-of-charge increases thermal wear and swelling risk.`,
      action: 'Set an 80% charge threshold limit inside your laptop manufacturer software (Dell Power Manager, Lenovo Vantage, MyASUS, or BIOS).'
    });
  }

  // Standby recs
  if (standby.hasData && standby.severity !== 'Healthy') {
    recs.push({
      type: 'warning',
      title: 'Fix Modern Standby Sleep Drain ("Vampire Drain")',
      desc: `Your laptop lost significant battery while sleeping (avg ${standby.avgDrainPerHour}%/hr). Windows Modern Standby is keeping wireless radios or background updates running with the lid closed.`,
      action: 'Switch "When I close the lid" from Sleep to Hibernate in Windows Power Options to completely eliminate sleep drain.'
    });
  }

  // Generic best practice
  recs.push({
    type: 'info',
    title: 'Avoid Deep Discharges Below 10%',
    desc: 'Lithium-polymer cells suffer maximum physical stress when discharged below 10% or left empty for long periods.',
    action: 'Plug in before reaching 15-20% whenever feasible to preserve chemical cycles.'
  });

  return recs;
}
