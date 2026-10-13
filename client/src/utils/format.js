/**
 * Currency and Date formatting helpers
 */

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount));
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  } catch {
    return '—';
  }
};

/**
 * Formats a date into YYYY-MM-DD for standard HTML input[type="date"]
 */
export const formatInputDate = (dateString) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

/**
 * Checks if a deadline has passed
 */
export const isOverdue = (deadlineDate, status) => {
  if (!deadlineDate || status === 'Completed' || status === 'Cancelled') {
    return false;
  }
  return new Date(deadlineDate).getTime() < new Date().setHours(0, 0, 0, 0);
};
