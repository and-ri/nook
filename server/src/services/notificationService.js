import prisma from '../db/index.js';
import { convert } from './currencyService.js';
import { sendEmail, isEmailConfigured } from './emailService.js';
import { sendPushToUser } from './pushService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Reminders are delivered in the user's local morning.
const WINDOW_START_HOUR = 9;
const WINDOW_END_HOUR   = 12; // exclusive

// ---------------------------------------------------------------------------
// Timezone / date helpers (pure, exported for unit tests).
//
// We treat a subscription's nextBillingDate as a nominal calendar date and
// compare it by its UTC date key against "today" computed in the user's zone —
// this matches how the date pickers store dates and avoids double conversion.
// ---------------------------------------------------------------------------

// Calendar parts of `date` as observed in `tz`.
export function zonedParts(date, tz) {
    const dtf = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', hour12: false, weekday: 'short',
    });
    const p = Object.fromEntries(dtf.formatToParts(date).map(x => [x.type, x.value]));
    return {
        date:    `${p.year}-${p.month}-${p.day}`, // YYYY-MM-DD
        hour:    Number(p.hour) % 24,             // some runtimes emit "24" at midnight
        weekday: p.weekday,                       // "Mon", "Tue", …
    };
}

export function zonedToday(now, tz) {
    return zonedParts(now, tz).date;
}

export function inSendWindow(now, tz) {
    const h = zonedParts(now, tz).hour;
    return h >= WINDOW_START_HOUR && h < WINDOW_END_HOUR;
}

export function isMonday(now, tz) {
    return zonedParts(now, tz).weekday === 'Mon';
}

// UTC calendar date of a stored DateTime, as "YYYY-MM-DD".
export function dateKey(d) {
    return new Date(d).toISOString().slice(0, 10);
}

// Shift a "YYYY-MM-DD" key by `n` days.
export function addDays(ymd, n) {
    const d = new Date(`${ymd}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------

// Persist a notification-center entry. Never throws — the centre is a
// best-effort mirror of what we dispatched.
async function recordNotification(userId, { title, body, type, data }) {
    try {
        await prisma.notification.create({
            data: { userId, title, body, type: type || 'reminder', data: data ?? undefined },
        });
    } catch (err) {
        console.error('[notifications] failed to record notification:', err.message);
    }
}

function fmtMoney(amount, currency) {
    try {
        return new Intl.NumberFormat('en', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
    } catch {
        return `${amount.toFixed(2)} ${currency}`;
    }
}

function fmtDate(date) {
    return new Date(date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
}

function emailShell(title, bodyHtml) {
    return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
        <h2 style="font-size:18px;margin:0 0 16px">${title}</h2>
        ${bodyHtml}
        <p style="font-size:12px;color:#9ca3af;margin-top:24px">You received this because payment reminders are enabled in Subscree. Manage them in Settings.</p>
    </div>`;
}

// Sum a list of upcoming charges converted to the user's preferred currency.
async function sumConverted(items, targetCurrency) {
    let total = 0;
    for (const it of items) {
        try {
            const converted = await convert(it.amount, it.currency, targetCurrency);
            total += converted ?? 0;
        } catch {
            // Rates unavailable — skip this item rather than failing the digest.
        }
    }
    return total;
}

// Team ids the user belongs to — reminders cover every team's subscriptions,
// so each member who must pay gets notified.
async function teamIdsForUser(userId) {
    const memberships = await prisma.teamMember.findMany({
        where:  { userId },
        select: { teamId: true },
    });
    return memberships.map(m => m.teamId);
}

// Active subscriptions across the user's teams whose next charge falls in a
// coarse UTC window around now — callers then match exact date keys.
async function candidateSubs(teamIds, slackDaysAhead) {
    const now = new Date();
    return prisma.subscription.findMany({
        where: {
            teamId:          { in: teamIds },
            status:          'ACTIVE',
            nextBillingDate: {
                not: null,
                gte: new Date(now.getTime() - DAY_MS),
                lte: new Date(now.getTime() + (slackDaysAhead + 2) * DAY_MS),
            },
        },
        orderBy: { nextBillingDate: 'asc' },
    });
}

// Send one reminder (BEFORE or DUE) for a subscription, deduped per occurrence
// and kind so each charge triggers at most one of each.
async function dispatchReminder(user, sub, kind) {
    const already = await prisma.reminderLog.findUnique({
        where: { userId_subscriptionId_billingDate_kind: {
            userId: user.id, subscriptionId: sub.id, billingDate: sub.nextBillingDate, kind,
        } },
    });
    if (already) return;

    const money = fmtMoney(sub.amount, sub.currency);
    const title = kind === 'DUE'
        ? `Payment due today: ${sub.name}`
        : `Upcoming payment: ${sub.name}`;
    const body = kind === 'DUE'
        ? `${sub.name} renews today for ${money}.`
        : `${sub.name} renews on ${fmtDate(sub.nextBillingDate)} for ${money}.`;
    const html = emailShell(title, `<p style="font-size:14px;line-height:1.6">${body}</p>`);

    try {
        if (user.notifyEnabled && isEmailConfigured()) {
            await sendEmail({ to: user.email, subject: `${title} — ${money}`, html, text: body });
        }
        if (user.pushEnabled) {
            await sendPushToUser(user.id, { title, body, data: { type: 'reminder', kind, subscriptionId: sub.id } });
        }
        await recordNotification(user.id, { title, body, type: 'reminder', data: { subscriptionId: sub.id, kind } });
        await prisma.reminderLog.create({
            data: { userId: user.id, subscriptionId: sub.id, billingDate: sub.nextBillingDate, kind },
        });
    } catch (err) {
        console.error(`[notifications] ${kind} reminder failed for sub ${sub.id} / user ${user.id}:`, err.message);
    }
}

// Per-subscription reminders: N days before and/or on the due date.
async function sendSubscriptionReminders(user, today) {
    const teamIds = await teamIdsForUser(user.id);
    if (!teamIds.length) return;

    const beforeKey = user.remindBefore ? addDays(today, user.notifyDaysBefore) : null;
    const subs = await candidateSubs(teamIds, Math.max(user.notifyDaysBefore, 1));

    for (const sub of subs) {
        const key = dateKey(sub.nextBillingDate);
        if (user.remindOnDueDate && key === today)     await dispatchReminder(user, sub, 'DUE');
        if (user.remindBefore    && key === beforeKey) await dispatchReminder(user, sub, 'BEFORE');
    }
}

// Monday "this week" summary of charges due in the next 7 days.
async function sendWeeklySummary(user, today) {
    // Dedupe: one summary per week (guards repeated ticks within the window).
    if (user.lastWeeklySummaryAt &&
        Date.now() - new Date(user.lastWeeklySummaryAt).getTime() < 6 * DAY_MS) {
        return;
    }
    const stamp = () => prisma.user.update({
        where: { id: user.id }, data: { lastWeeklySummaryAt: new Date() },
    });

    const teamIds = await teamIdsForUser(user.id);
    if (!teamIds.length) { await stamp(); return; }

    const endKey = addDays(today, 6);
    const subs = await candidateSubs(teamIds, 7);
    const upcoming = subs.filter(s => {
        const k = dateKey(s.nextBillingDate);
        return k >= today && k <= endKey;
    });

    // Always advance the clock so we don't re-check every run, even when empty.
    if (!upcoming.length) { await stamp(); return; }

    const total = await sumConverted(upcoming, user.preferredCurrency);
    const rows = upcoming.map(s => `
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${s.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#6b7280">${fmtDate(s.nextBillingDate)}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-variant-numeric:tabular-nums">${fmtMoney(s.amount, s.currency)}</td>
        </tr>`).join('');

    const count = upcoming.length;
    const title = `This week: ${count} ${count === 1 ? 'payment' : 'payments'}`;
    const pushBody = `${count} upcoming ${count === 1 ? 'payment' : 'payments'} • ${fmtMoney(total, user.preferredCurrency)}`;
    const html = emailShell(
        title,
        `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
         <p style="font-size:14px;margin-top:16px">Estimated total: <strong>${fmtMoney(total, user.preferredCurrency)}</strong></p>`
    );

    try {
        if (user.notifyEnabled && isEmailConfigured()) {
            await sendEmail({
                to:      user.email,
                subject: `Your subscription payments this week`,
                html,
                text:    upcoming.map(s => `${s.name} — ${fmtDate(s.nextBillingDate)} — ${fmtMoney(s.amount, s.currency)}`).join('\n'),
            });
        }
        if (user.pushEnabled) {
            await sendPushToUser(user.id, { title, body: pushBody, data: { type: 'digest' } });
        }
        await recordNotification(user.id, { title, body: pushBody, type: 'digest', data: null });
        await stamp();
    } catch (err) {
        console.error(`[notifications] weekly summary failed for user ${user.id}:`, err.message);
    }
}

// Process all users with notifications enabled. Safe to call repeatedly;
// the send window + per-occurrence dedupe prevent duplicates.
export async function runDueNotifications(now = new Date()) {
    const users = await prisma.user.findMany({
        where: { OR: [{ notifyEnabled: true }, { pushEnabled: true }] },
    });

    for (const user of users) {
        // Nothing to send unless at least one content toggle is on.
        if (!user.remindBefore && !user.remindOnDueDate && !user.weeklySummary) continue;

        const tz = user.timezone || 'UTC';
        try {
            // Only deliver during the user's local morning window.
            if (!inSendWindow(now, tz)) continue;

            const today = zonedToday(now, tz);
            if (user.remindBefore || user.remindOnDueDate) {
                await sendSubscriptionReminders(user, today);
            }
            if (user.weeklySummary && isMonday(now, tz)) {
                await sendWeeklySummary(user, today);
            }
        } catch (err) {
            console.error(`[notifications] processing failed for user ${user.id}:`, err.message);
        }
    }
}
