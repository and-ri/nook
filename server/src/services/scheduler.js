import { runDueNotifications } from './notificationService.js';
import { runDueAccountDeletions } from './accountService.js';

// Poll interval for the background dispatcher. Per-occurrence dedupe makes
// frequent runs harmless; default is hourly. Channel availability is decided
// per-send inside the notification run, and account purges must run regardless,
// so the scheduler always starts.
const INTERVAL_MS = Number(process.env.NOTIFY_INTERVAL_MS) || 60 * 60 * 1000;

let timer = null;

export function startScheduler() {
    if (timer) return;

    const tick = () => {
        runDueNotifications().catch(err =>
            console.error('[scheduler] notification run failed:', err.message));
        runDueAccountDeletions().catch(err =>
            console.error('[scheduler] account deletion run failed:', err.message));
    };

    // Run shortly after boot, then on the interval.
    timer = setInterval(tick, INTERVAL_MS);
    setTimeout(tick, 10 * 1000);
    console.log(`[scheduler] background scheduler started (every ${Math.round(INTERVAL_MS / 1000)}s)`);
}

export function stopScheduler() {
    if (timer) { clearInterval(timer); timer = null; }
}
