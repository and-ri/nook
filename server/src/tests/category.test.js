import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import prisma from '../db/index.js';

let token;
let userId;

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test_cat@example.com' } });

    const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test_cat@example.com', password: 'password123', name: 'Test' });

    userId = res.body.user.id;

    const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: 'test_cat@example.com', password: 'password123' });

    token = loginRes.body.token;
});

afterAll(async () => {
    await prisma.category.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { email: 'test_cat@example.com' } });
    await prisma.$disconnect();
});

describe('POST /categories', () => {
    it('should create a category', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Streaming' });

        expect(res.status).toBe(201);
        expect(res.body.category.name).toBe('Streaming');
    });

    it('should return 409 on duplicate name', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Streaming' });

        expect(res.status).toBe(409);
    });

    it('should return 400 without name', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
    });
});

describe('GET /categories', () => {
    it('should return 401 without token', async () => {
        const res = await request(app).get('/categories');
        expect(res.status).toBe(401);
    });

    it('should return categories list', async () => {
        const res = await request(app)
            .get('/categories')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.categories)).toBe(true);
    });
});
