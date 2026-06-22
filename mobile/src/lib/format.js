// Shared, locale-aware formatting helpers used across screens.

export function formatAmount(amount, currency, locale = 'en') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount ?? 0);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatDate(dateStr, locale = 'en') {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

// Maps an ISO date to the YYYY-MM-DD form the API expects (matches the
// <input type="date"> values the web app submits).
export function toDateInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}
