export function toMonthly(amount, billingCycle) {
    switch (billingCycle) {
        case 'DAILY':   return amount * 30;
        case 'WEEKLY':  return amount * 4.33;
        case 'MONTHLY': return amount;
        case 'YEARLY':  return amount / 12;
        default:        return amount;
    }
}

export function toDateInputValue(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toISOString().split('T')[0];
}
