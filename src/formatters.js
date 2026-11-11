/**
 * VoltLens Humanized Formatting Utilities
 * Converts raw machine timestamps and hex-like durations into conversational human language.
 */

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatHumanDate(rawDateStr) {
  if (!rawDateStr || rawDateStr === '-') return 'N/A';
  const clean = rawDateStr.trim();

  // Range format: "2024-01-22 - 2024-02-05"
  if (clean.includes(' - ')) {
    const parts = clean.split(' - ');
    return `${formatSingleDate(parts[0], false)} – ${formatSingleDate(parts[1], true)}`;
  }

  // Single date with or without time: "2026-11-11 11:45:14" or "2026-11-11"
  return formatSingleDate(clean, true);
}

function formatSingleDate(str, includeYear) {
  if (!str) return '';
  const match = str.match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return str;

  const year = match[1];
  const monthIdx = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const monthName = MONTHS_SHORT[monthIdx] || match[2];

  let result = `${monthName} ${day}`;
  if (includeYear) result += `, ${year}`;

  if (match[4] && match[5]) {
    let hours = parseInt(match[4], 10);
    const mins = match[5];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    result += ` at ${hours}:${mins} ${ampm}`;
  }

  return result;
}

export function formatHumanDuration(hmsOrHours) {
  if (!hmsOrHours || hmsOrHours === '-') return 'N/A';

  // If already a number (decimal hours like 3.5)
  if (typeof hmsOrHours === 'number') {
    const totalMinutes = Math.round(hmsOrHours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} mins`;
  }

  // If "H:MM:SS" or "HH:MM:SS"
  const parts = hmsOrHours.split(':').map(p => parseInt(p, 10));
  if (parts.length === 3 && !parts.some(isNaN)) {
    const hrs = parts[0];
    const mins = parts[1];
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins > 1 ? 's' : ''}`;
  }

  return hmsOrHours;
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';

  const past = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  const now = new Date();
  const diffDays = Math.round((now - past) / (1000 * 3600 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.round(diffDays / 30.4);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  const diffYears = (diffDays / 365.25).toFixed(1);
  return `${diffYears} years ago`;
}
