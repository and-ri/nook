import prisma from '../db/index.js';

function addPeriod(date, billingCycle) {
    const d = new Date(date);
    switch (billingCycle) {
        case 'DAILY':   d.setDate(d.getDate() + 1);          break;
        case 'WEEKLY':  d.setDate(d.getDate() + 7);           break;
        case 'MONTHLY': d.setMonth(d.getMonth() + 1);         break;
        case 'YEARLY':  d.setFullYear(d.getFullYear() + 1);   break;
    }
    return d;
}

// Advance nextBillingDate for any active subscription whose billing day has
// fully passed. Called lazily on each fetch so no cron job is needed.
//
// We advance only once the date is before the START of today (UTC) — not before
// `now` — so a charge due "today" stays on today's date for the whole day. That
// keeps it visible as due today and lets the notification scheduler fire the
// due-date reminder during the user's morning window. Scoped to a team.
export async function advanceOverdueBillingDates(teamId) {
    const now = new Date();
    const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const overdue = await prisma.subscription.findMany({
        where: {
            teamId,
            status: 'ACTIVE',
            nextBillingDate: { lt: startOfTodayUTC },
        },
        select: { id: true, nextBillingDate: true, billingCycle: true },
    });

    if (!overdue.length) return;

    await Promise.all(overdue.map(sub => {
        let date = new Date(sub.nextBillingDate);
        while (date < startOfTodayUTC) date = addPeriod(date, sub.billingCycle);

        return prisma.subscription.update({
            where: { id: sub.id },
            data:  { nextBillingDate: date },
        });
    }));
}
