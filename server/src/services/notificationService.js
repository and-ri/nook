import prisma from '../db/index.js';
import { convert } from './currencyService.js';
import { sendEmail, isEmailConfigured } from './emailService.js';
import { sendPushToUser } from './pushService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

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

async function sendPerSubscriptionReminders(user) {
    const now    = new Date();
    const cutoff = new Date(now.getTime() + user.notifyDaysBefore * DAY_MS);

    const teamIds = await teamIdsForUser(user.id);
    if (!teamIds.length) return;

    const due = await prisma.subscription.findMany({
        where: {
            teamId:          { in: teamIds },
            status:          'ACTIVE',
            nextBillingDate: { gte: now, lte: cutoff },
        },
    });

    for (const sub of due) {
        // Dedupe per (user, subscription, billing occurrence) so multiple team
        // members can each be reminded, but only once per charge.
        const already = await prisma.reminderLog.findUnique({
            where: { userId_subscriptionId_billingDate: {
                userId: user.id, subscriptionId: sub.id, billingDate: sub.nextBillingDate,
            } },
        });
        if (already) continue;

        const title = `Upcoming payment: ${sub.name}`;
        const body  = `${sub.name} renews on ${fmtDate(sub.nextBillingDate)} for ${fmtMoney(sub.amount, sub.currency)}.`;
        const html  = emailShell(
            title,
            `<p style="font-size:14px;line-height:1.6">
                <strong>${sub.name}</strong> renews on <strong>${fmtDate(sub.nextBillingDate)}</strong>
                for <strong>${fmtMoney(sub.amount, sub.currency)}</strong>.
            </p>`
        );

        try {
            if (user.notifyEnabled && isEmailConfigured()) {
                await sendEmail({
                    to:      user.email,
                    subject: `Upcoming payment: ${sub.name} — ${fmtMoney(sub.amount, sub.currency)}`,
                    html,
                    text:    body,
                });
            }
            if (user.pushEnabled) {
                await sendPushToUser(user.id, { title, body, data: { type: 'reminder', subscriptionId: sub.id } });
            }
            await recordNotification(user.id, { title, body, type: 'reminder', data: { subscriptionId: sub.id } });
            await prisma.reminderLog.create({
                data: { userId: user.id, subscriptionId: sub.id, billingDate: sub.nextBillingDate },
            });
        } catch (err) {
            console.error(`[notifications] reminder failed for sub ${sub.id} / user ${user.id}:`, err.message);
        }
    }
}

async function sendDigest(user) {
    const now        = new Date();
    const periodDays = user.notifyDigestFrequency === 'MONTHLY' ? 30 : 7;

    // Not yet due if a digest was already sent within this period.
    if (user.lastDigestSentAt &&
        now.getTime() - new Date(user.lastDigestSentAt).getTime() < periodDays * DAY_MS) {
        return;
    }

    const teamIds = await teamIdsForUser(user.id);
    if (!teamIds.length) {
        await prisma.user.update({ where: { id: user.id }, data: { lastDigestSentAt: now } });
        return;
    }

    const cutoff = new Date(now.getTime() + periodDays * DAY_MS);
    const upcoming = await prisma.subscription.findMany({
        where: {
            teamId:          { in: teamIds },
            status:          'ACTIVE',
            nextBillingDate: { gte: now, lte: cutoff },
        },
        orderBy: { nextBillingDate: 'asc' },
    });

    // Always advance the clock so we don't re-check every run, even when empty.
    if (!upcoming.length) {
        await prisma.user.update({ where: { id: user.id }, data: { lastDigestSentAt: now } });
        return;
    }

    const total = await sumConverted(upcoming, user.preferredCurrency);
    const rows = upcoming.map(s => `
        <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${s.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#6b7280">${fmtDate(s.nextBillingDate)}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-variant-numeric:tabular-nums">${fmtMoney(s.amount, s.currency)}</td>
        </tr>`).join('');

    const periodLabel = user.notifyDigestFrequency === 'MONTHLY' ? 'next 30 days' : 'next 7 days';
    const title = `Upcoming payments — ${periodLabel}`;
    const pushBody = `${upcoming.length} upcoming ${upcoming.length === 1 ? 'payment' : 'payments'} • ${fmtMoney(total, user.preferredCurrency)}`;
    const html = emailShell(
        title,
        `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
         <p style="font-size:14px;margin-top:16px">Estimated total: <strong>${fmtMoney(total, user.preferredCurrency)}</strong></p>`
    );

    try {
        if (user.notifyEnabled && isEmailConfigured()) {
            await sendEmail({
                to:      user.email,
                subject: `Your upcoming subscription payments (${periodLabel})`,
                html,
                text:    upcoming.map(s => `${s.name} — ${fmtDate(s.nextBillingDate)} — ${fmtMoney(s.amount, s.currency)}`).join('\n'),
            });
        }
        if (user.pushEnabled) {
            await sendPushToUser(user.id, { title, body: pushBody, data: { type: 'digest' } });
        }
        await recordNotification(user.id, { title, body: pushBody, type: 'digest', data: null });
        await prisma.user.update({ where: { id: user.id }, data: { lastDigestSentAt: now } });
    } catch (err) {
        console.error(`[notifications] digest failed for user ${user.id}:`, err.message);
    }
}

// Process all users with notifications enabled. Safe to call repeatedly;
// per-occurrence dedupe prevents duplicate emails.
export async function runDueNotifications() {
    // Process anyone with email reminders OR push enabled; channel availability
    // is decided per-send below.
    const users = await prisma.user.findMany({
        where: { OR: [{ notifyEnabled: true }, { pushEnabled: true }] },
    });
    for (const user of users) {
        try {
            if (user.notifyMode === 'DIGEST') {
                await sendDigest(user);
            } else {
                await sendPerSubscriptionReminders(user);
            }
        } catch (err) {
            console.error(`[notifications] processing failed for user ${user.id}:`, err.message);
        }
    }
}
