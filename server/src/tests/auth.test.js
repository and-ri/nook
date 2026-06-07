import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import prisma from '../db/index.js';

describe('POST /auth/register', () => {
    beforeAll(async () => {
        await prisma.user.deleteMany({ where: { email: { startsWith: 'test_auth_' } } });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: { startsWith: 'test_auth_' } } });
        await prisma.$disconnect();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'test_auth_new@example.com', password: 'password123', name: 'Test' });

        expect(res.status).toBe(201);
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user.email).toBe('test_auth_new@example.com');
    });

    it('should return 500 on duplicate email', async () => {
        await request(app)
            .post('/auth/register')
            .send({ email: 'test_auth_dup@example.com', password: 'password123', name: 'Test' });

        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'test_auth_dup@example.com', password: 'password123', name: 'Test' });

        expect(res.status).toBe(500);
    });
});

describe('POST /auth/login', () => {
    beforeAll(async () => {
        await prisma.user.deleteMany({ where: { email: 'test_auth_login@example.com' } });
        await request(app)
            .post('/auth/register')
            .send({ email: 'test_auth_login@example.com', password: 'password123', name: 'Test' });
    });

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: 'test_auth_login@example.com' } });
    });

    it('should return token on valid credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test_auth_login@example.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should return 401 on wrong password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'test_auth_login@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
    });

    it('should return 401 on non-existent email', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(401);
    });
});
