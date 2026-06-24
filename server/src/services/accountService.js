import prisma from '../db/index.js';

// Days between a deletion request and the permanent purge. During this window
// the user can log back in and restore their account.
export const ACCOUNT_DELETION_GRACE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// Permanently delete a user and their data, preserving shared-team data:
//  - teams where the user is the only member are deleted (cascades their data);
//  - in shared teams the user is just removed, a new owner is promoted if they
//    were the only one, and data they created stays (created-by set to null).
export async function purgeUser(userId) {
    await prisma.$transaction(async (tx) => {
        const memberships = await tx.teamMember.findMany({
            where: { userId },
            select: { teamId: true, role: true },
        });

        for (const m of memberships) {
            const members = await tx.teamMember.findMany({
                where: { teamId: m.teamId },
                select: { userId: true, role: true },
                orderBy: { createdAt: 'asc' },
            });
            const others = members.filter(x => x.userId !== userId);

            if (others.length === 0) {
                // Solo team — delete it; subscriptions/categories/payment methods,
                // invitations and the membership cascade away.
                await tx.team.delete({ where: { id: m.teamId } });
            } else if (m.role === 'OWNER' && !others.some(x => x.role === 'OWNER')) {
                // Sole owner leaving a shared team — promote the longest-standing
                // remaining member so the team isn't left ownerless.
                await tx.teamMember.update({
                    where: { teamId_userId: { teamId: m.teamId, userId: others[0].userId } },
                    data: { role: 'OWNER' },
                });
            }
        }

        // Cascades the user's remaining memberships, reminder logs, notifications
        // and push tokens; sets created-by (userId) to null on data kept in
        // shared teams.
        await tx.user.delete({ where: { id: userId } });
    });
}

// Hard-delete accounts whose grace period has elapsed. Safe to call repeatedly.
export async function runDueAccountDeletions(now = new Date()) {
    const cutoff = new Date(now.getTime() - ACCOUNT_DELETION_GRACE_DAYS * DAY_MS);
    const due = await prisma.user.findMany({
        where: { deletionRequestedAt: { not: null, lt: cutoff } },
        select: { id: true },
    });
    for (const u of due) {
        try {
            await purgeUser(u.id);
            console.log(`[account] purged account ${u.id} after grace period`);
        } catch (err) {
            console.error(`[account] purge failed for ${u.id}:`, err.message);
        }
    }
}
