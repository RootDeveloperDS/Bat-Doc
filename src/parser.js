/**
 * VoltLens Battery Report Parser
 * Strict 1:1 parser for Microsoft Windows powercfg /batteryreport HTML exports.
 * 100% truth-grounded extraction with zero hallucinated or synthetic placeholders.
 */

export function parseBatteryReport(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  return {
    systemInfo: parseSystemInfo(doc),
    batteries: parseInstalledBatteries(doc),
    recentUsage: parseRecentUsage(doc),
    batteryUsage: parseBatteryUsage(doc),
    usageHistory: parseUsageHistory(doc),
    capacityHistory: parseCapacityHistory(doc),
    lifeEstimates: parseLifeEstimates(doc)
  };
}

function cleanText(text) {
  return text ? text.replace(/\s+/g, ' ').trim() : '';
}

function parseMWh(text) {
  if (!text) return null;
  const match = text.replace(/,/g, '').match(/(\d+)\s*mWh/i);
  return match ? parseInt(match[1], 10) : null;
}

function parseSystemInfo(doc) {
  const info = {
    computerName: 'Unknown',
    systemProductName: 'Unknown',
    bios: 'Unknown',
    osBuild: 'Unknown',
    platformRole: 'Mobile',
    connectedStandby: 'Unknown',
    reportTime: 'Unknown'
  };

  const tables = doc.querySelectorAll('table');
  if (tables.length > 0) {
    const firstTable = tables[0];
    const rows = firstTable.querySelectorAll('tr');
    rows.forEach(row => {
      const labelEl = row.querySelector('.label');
      const valEl = row.querySelectorAll('td')[1];
      if (labelEl && valEl) {
        const label = cleanText(labelEl.textContent).toUpperCase();
        const value = cleanText(valEl.textContent);
        if (label.includes('COMPUTER NAME')) info.computerName = value;
        else if (label.includes('SYSTEM PRODUCT NAME')) info.systemProductName = value;
        else if (label.includes('BIOS')) info.bios = value;
        else if (label.includes('OS BUILD')) info.osBuild = value;
        else if (label.includes('PLATFORM ROLE')) info.platformRole = value;
        else if (label.includes('CONNECTED STANDBY')) info.connectedStandby = value;
        else if (label.includes('REPORT TIME')) info.reportTime = value;
      }
    });
  }
  return info;
}

function parseInstalledBatteries(doc) {
  const batteries = [];
  const headers = doc.querySelectorAll('h2');
  let targetTable = null;

  for (const h2 of headers) {
    if (cleanText(h2.textContent).toLowerCase().includes('installed batteries')) {
      let next = h2.nextElementSibling;
      while (next && next.tagName !== 'TABLE') {
        next = next.nextElementSibling;
      }
      targetTable = next;
      break;
    }
  }

  if (!targetTable) return batteries;

  const battery = {
    name: 'Unknown',
    manufacturer: 'Unknown',
    serialNumber: 'Unknown',
    chemistry: 'Unknown',
    designCapacityMWh: null,
    fullChargeCapacityMWh: null,
    cycleCountRaw: '-'
  };

  const rows = targetTable.querySelectorAll('tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      const key = cleanText(cells[0].textContent).toUpperCase();
      const val = cleanText(cells[1].textContent);
      if (key.includes('NAME')) battery.name = val;
      else if (key.includes('MANUFACTURER')) battery.manufacturer = val;
      else if (key.includes('SERIAL NUMBER')) battery.serialNumber = val;
      else if (key.includes('CHEMISTRY')) battery.chemistry = val;
      else if (key.includes('DESIGN CAPACITY')) battery.designCapacityMWh = parseMWh(val);
      else if (key.includes('FULL CHARGE CAPACITY')) battery.fullChargeCapacityMWh = parseMWh(val);
      else if (key.includes('CYCLE COUNT')) battery.cycleCountRaw = val;
    }
  });

  batteries.push(battery);
  return batteries;
}

function parseRecentUsage(doc) {
  const events = [];
  const headers = doc.querySelectorAll('h2');
  let targetTable = null;

  for (const h2 of headers) {
    if (cleanText(h2.textContent).toLowerCase() === 'recent usage') {
      let next = h2.nextElementSibling;
      while (next && next.tagName !== 'TABLE') {
        next = next.nextElementSibling;
      }
      targetTable = next;
      break;
    }
  }

  if (!targetTable) return events;

  let currentDate = '';
  const rows = targetTable.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.querySelector('th')) return; // Header row
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      const dateSpan = cells[0].querySelector('.date');
      const timeSpan = cells[0].querySelector('.time');

      if (dateSpan && dateSpan.textContent.trim()) {
        currentDate = cleanText(dateSpan.textContent);
      }
      const timeStr = timeSpan ? cleanText(timeSpan.textContent) : '';
      const fullTimestamp = currentDate && timeStr ? `${currentDate} ${timeStr}` : cleanText(cells[0].textContent);

      const state = cleanText(cells[1].textContent);
      const source = cleanText(cells[2].textContent) || 'Battery/Suspended';
      const percentStr = cleanText(cells[3].textContent);
      const mwhStr = cleanText(cells[4].textContent);

      const percent = percentStr.includes('%') ? parseInt(percentStr.replace('%', '').trim(), 10) : null;
      const mwh = parseMWh(mwhStr);

      events.push({
        timestamp: fullTimestamp,
        state,
        source,
        percentRemaining: percent,
        capacityRemainingMWh: mwh
      });
    }
  });

  return events;
}

function parseBatteryUsage(doc) {
  const usageEvents = [];
  const headers = doc.querySelectorAll('h2');
  let targetTable = null;

  for (const h2 of headers) {
    if (cleanText(h2.textContent).toLowerCase() === 'battery usage') {
      let next = h2.nextElementSibling;
      while (next && next.tagName !== 'TABLE') {
        next = next.nextElementSibling;
      }
      targetTable = next;
      break;
    }
  }

  if (!targetTable) return usageEvents;

  let currentDate = '';
  const rows = targetTable.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.querySelector('th')) return;
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
      const dateSpan = cells[0].querySelector('.date');
      const timeSpan = cells[0].querySelector('.time');
      if (dateSpan && dateSpan.textContent.trim()) {
        currentDate = cleanText(dateSpan.textContent);
      }
      const timeStr = timeSpan ? cleanText(timeSpan.textContent) : '';
      const fullTimestamp = currentDate && timeStr ? `${currentDate} ${timeStr}` : cleanText(cells[0].textContent);

      const duration = cleanText(cells[1].textContent);
      const energyDrainedPct = cleanText(cells[2].textContent);
      const energyDrainedMWh = parseMWh(cleanText(cells[3].textContent));

      usageEvents.push({
        timestamp: fullTimestamp,
        duration,
        energyDrainedPct,
        energyDrainedMWh
      });
    }
  });

  return usageEvents;
}

function parseCapacityHistory(doc) {
  const history = [];
  const headers = doc.querySelectorAll('h2');
  let targetTable = null;

  for (const h2 of headers) {
    if (cleanText(h2.textContent).toLowerCase().includes('battery capacity history')) {
      let next = h2.nextElementSibling;
      while (next && next.tagName !== 'TABLE') {
        next = next.nextElementSibling;
      }
      targetTable = next;
      break;
    }
  }

  if (!targetTable) return history;

  const rows = targetTable.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.querySelector('th') || row.classList.contains('rowHeader')) return;
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const period = cleanText(cells[0].textContent);
      const fullCap = parseMWh(cleanText(cells[1].textContent));
      const designCap = parseMWh(cleanText(cells[2].textContent));

      if (period && fullCap !== null && designCap !== null) {
        history.push({
          period,
          fullChargeCapacityMWh: fullCap,
          designCapacityMWh: designCap,
          healthPercent: parseFloat(((fullCap / designCap) * 100).toFixed(2))
        });
      }
    }
  });

  return history;
}

function parseUsageHistory(doc) {
  const history = [];
  const headers = doc.querySelectorAll('h2');
  let targetTable = null;

  for (const h2 of headers) {
    if (cleanText(h2.textContent).toLowerCase().includes('usage history')) {
      let next = h2.nextElementSibling;
      while (next && next.tagName !== 'TABLE') {
        next = next.nextElementSibling;
      }
      targetTable = next;
      break;
    }
  }

  if (!targetTable) return history;

  const rows = targetTable.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.querySelector('th') || row.classList.contains('rowHeader')) return;
    const cells = row.querySelectorAll('td');
    if (cells.length >= 5) {
      const period = cleanText(cells[0].textContent);
      const batteryActive = cleanText(cells[1].textContent);
      const batteryStandby = cleanText(cells[2].textContent);
      const acActive = cleanText(cells[3].textContent);
      const acStandby = cleanText(cells[4].textContent);

      if (period) {
        history.push({
          period,
          batteryActive,
          batteryStandby,
          acActive,
          acStandby
        });
      }
    }
  });

  return history;
}

function parseLifeEstimates(doc) {
  const estimates = [];
  let sinceOSInstall = null;
  const headers = doc.querySelectorAll('h2');
  let targetTable = null;

  for (const h2 of headers) {
    if (cleanText(h2.textContent).toLowerCase().includes('battery life estimates')) {
      let next = h2.nextElementSibling;
      while (next && next.tagName !== 'TABLE') {
        next = next.nextElementSibling;
      }
      targetTable = next;
      break;
    }
  }

  if (!targetTable) return { estimates, sinceOSInstall };

  const rows = targetTable.querySelectorAll('tr');
  rows.forEach(row => {
    if (row.querySelector('th') || row.classList.contains('rowHeader')) return;
    const cells = row.querySelectorAll('td');
    if (cells.length >= 6) {
      const period = cleanText(cells[0].textContent);
      const fullActive = cleanText(cells[1].textContent);
      const fullStandby = cleanText(cells[2].textContent);
      const designActive = cleanText(cells[4].textContent);
      const designStandby = cleanText(cells[5].textContent);

      if (period) {
        estimates.push({
          period,
          fullCharge: { active: fullActive, standby: fullStandby },
          designCapacity: { active: designActive, standby: designStandby }
        });
      }
    }
  });

  // Check for "Since OS install" table at the bottom
  const allTables = doc.querySelectorAll('table');
  allTables.forEach(tbl => {
    const text = cleanText(tbl.textContent);
    if (text.includes('Since OS install')) {
      const cells = tbl.querySelectorAll('td');
      if (cells.length >= 5) {
        sinceOSInstall = {
          fullChargeActive: cleanText(cells[1].textContent),
          fullChargeStandby: cleanText(cells[2].textContent),
          designActive: cleanText(cells[3].textContent),
          designStandby: cleanText(cells[4].textContent)
        };
      }
    }
  });

  return { estimates, sinceOSInstall };
}
