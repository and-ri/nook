import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import prisma from '../db/index.js';

let token;
let userId;
let subscriptionId;

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test_sub@example.com' } });

    const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test_sub@example.com', password: 'password123', name: 'Test' });

    userId = res.body.user.id;

    const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: 'test_sub@example.com', password: 'password123' });

    token = loginRes.body.token;
});

afterAll(async () => {
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { email: 'test_sub@example.com' } });
    await prisma.$disconnect();
});

describe('GET /subscriptions', () => {
    it('should return 401 without token', async () => {
        const res = await request(app).get('/subscriptions');
        expect(res.status).toBe(401);
    });

    it('should return subscriptions list', async () => {
        const res = await request(app)
            .get('/subscriptions')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('subscriptions');
        expect(Array.isArray(res.body.subscriptions)).toBe(true);
    });
});

describe('POST /subscriptions', () => {
    it('should create a subscription', async () => {
        const res = await request(app)
            .post('/subscriptions')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Netflix', amount: 15.99, currency: 'USD', billingCycle: 'MONTHLY', status: 'ACTIVE' });

        expect(res.status).toBe(201);
        expect(res.body.subscription).toHaveProperty('id');
        expect(res.body.subscription.name).toBe('Netflix');

        subscriptionId = res.body.subscription.id;
    });

    it('should return 400 without required fields', async () => {
        const res = await request(app)
            .post('/subscriptions')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Netflix' });

        expect(res.status).toBe(400);
    });
});

describe('GET /subscriptions/:id', () => {
    it('should return 404 for non-existent id', async () => {
        const res = await request(app)
            .get('/subscriptions/00000000-0000-0000-0000-000000000000')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });

    it('should return subscription by id', async () => {
        const res = await request(app)
            .get(`/subscriptions/${subscriptionId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.subscription.id).toBe(subscriptionId);
    });
});
