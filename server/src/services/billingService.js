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

// Advance nextBillingDate for any active subscription whose date is in the past.
// Called lazily on each fetch so no cron job is needed.
export async function advanceOverdueBillingDates(userId) {
    const now = new Date();

    const overdue = await prisma.subscription.findMany({
        where: {
            userId,
            status: 'ACTIVE',
            nextBillingDate: { lt: now },
        },
        select: { id: true, nextBillingDate: true, billingCycle: true },
    });

    if (!overdue.length) return;

    await Promise.all(overdue.map(sub => {
        let date = new Date(sub.nextBillingDate);
        while (date <= now) date = addPeriod(date, sub.billingCycle);

        return prisma.subscription.update({
            where: { id: sub.id },
            data:  { nextBillingDate: date },
        });
    }));
}
