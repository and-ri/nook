import express from 'express';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import prisma from '../db/index.js';
import { SubscribtionValidator } from '../validators/SubscribtionValidator.js';
import { convert, toMonthly } from '../services/currencyService.js';
import { advanceOverdueBillingDates } from '../services/billingService.js';

const SubscribtionRouter = express.Router();
SubscribtionRouter.use(AuthMiddleware);

const SUBSCRIPTION_INCLUDE = {
    categories:    true,
    paymentMethod: true,
};

SubscribtionRouter.get('/', async (req, res, next) => {
    const { userId } = req;
    const { status } = req.query;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip  = (page - 1) * limit;

    try {
        await advanceOverdueBillingDates(userId);

        const subscriptions = await prisma.subscription.findMany({
            where:   { userId, ...(status && { status }) },
            include: SUBSCRIPTION_INCLUDE,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        res.json({ subscriptions });
    } catch (err) { next(err); }
});

SubscribtionRouter.post('/', async (req, res, next) => {
    const result = SubscribtionValidator.add.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.issues[0].message });

    const {
        name, url, logoUrl, categories, paymentMethodId,
        amount, currency, billingCycle, status,
        startDate, nextBillingDate, cancelledAt, notes,
    } = result.data;

    try {
        const subscription = await prisma.subscription.create({
            data: {
                userId: req.userId,
                name, amount, currency, billingCycle, status,
                url:             url             || null,
                logoUrl:         logoUrl         || null,
                paymentMethodId: paymentMethodId || null,
                startDate,
                nextBillingDate,
                cancelledAt,
                notes,
                categories: categories?.length
                    ? { connect: categories.map(id => ({ id })) }
                    : undefined,
            },
            include: SUBSCRIPTION_INCLUDE,
        });
        res.status(201).json({ subscription });
    } catch (err) { next(err); }
});

SubscribtionRouter.get('/stats', async (req, res, next) => {
    const { userId } = req;
    try {
        await advanceOverdueBillingDates(userId);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const targetCurrency = user?.preferredCurrency ?? 'USD';

        const [activeSubscriptions, subscriptionsByStatus, upcomingRenewals] = await prisma.$transaction([
            prisma.subscription.findMany({
                where:   { userId, status: 'ACTIVE' },
                select:  { amount: true, currency: true, billingCycle: true },
            }),
            prisma.subscription.groupBy({
                by:    ['status'],
                where: { userId },
                _count: { status: true },
            }),
            prisma.subscription.findMany({
                where: {
                    userId,
                    status: 'ACTIVE',
                    nextBillingDate: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                },
                orderBy: { nextBillingDate: 'asc' },
                include: SUBSCRIPTION_INCLUDE,
            }),
        ]);

        const monthlyAmounts = await Promise.all(
            activeSubscriptions.map(async sub => {
                const monthly   = toMonthly(sub.amount, sub.billingCycle);
                const converted = await convert(monthly, sub.currency, targetCurrency);
                return converted ?? 0;
            })
        );

        res.json({
            totalSubscriptions:  activeSubscriptions.length,
            totalMonthlySpend:   Math.round(monthlyAmounts.reduce((s, v) => s + v, 0) * 100) / 100,
            currency:            targetCurrency,
            subscriptionsByStatus: subscriptionsByStatus.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {}),
            upcomingRenewals,
        });
    } catch (err) { next(err); }
});

SubscribtionRouter.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req;
    try {
        const subscription = await prisma.subscription.findFirst({
            where:   { id, userId },
            include: SUBSCRIPTION_INCLUDE,
        });
        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        res.json({ subscription });
    } catch (err) { next(err); }
});

SubscribtionRouter.patch('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req;
    const result = SubscribtionValidator.update.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: result.error.issues[0].message });

    const {
        name, url, logoUrl, categories, paymentMethodId,
        amount, currency, billingCycle, status,
        startDate, nextBillingDate, cancelledAt, notes,
    } = result.data;

    try {
        const existing = await prisma.subscription.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ message: 'Subscription not found' });

        const subscription = await prisma.subscription.update({
            where: { id },
            data: {
                ...(name             !== undefined && { name }),
                ...(amount           !== undefined && { amount }),
                ...(currency         !== undefined && { currency }),
                ...(billingCycle     !== undefined && { billingCycle }),
                ...(status           !== undefined && { status }),
                ...(url              !== undefined && { url: url || null }),
                ...(logoUrl          !== undefined && { logoUrl: logoUrl || null }),
                ...(paymentMethodId  !== undefined && { paymentMethodId: paymentMethodId || null }),
                ...(startDate        !== undefined && { startDate }),
                ...(nextBillingDate  !== undefined && { nextBillingDate }),
                ...(cancelledAt      !== undefined && { cancelledAt }),
                ...(notes            !== undefined && { notes }),
                ...(categories !== undefined && {
                    categories: { set: categories.map(cid => ({ id: cid })) },
                }),
            },
            include: SUBSCRIPTION_INCLUDE,
        });
        res.json({ subscription });
    } catch (err) { next(err); }
});

SubscribtionRouter.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req;
    try {
        const existing = await prisma.subscription.findFirst({ where: { id, userId } });
        if (!existing) return res.status(404).json({ message: 'Subscription not found' });
        await prisma.subscription.delete({ where: { id } });
        res.json({ message: 'Subscription deleted' });
    } catch (err) { next(err); }
});

export default SubscribtionRouter;
