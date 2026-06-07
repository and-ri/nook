import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db/index.js';
import { SignJWT } from 'jose';

const AuthRouter = express.Router();

AuthRouter.post('/register', async (req, res, next) => {
    const { email, name, password } = req.body;

    const passwordHash = bcrypt.hashSync(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
            },
        });

        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        return next(error);
    }    
});

AuthRouter.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = await new SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1h')
            .sign(new TextEncoder().encode(process.env.JWT_SECRET));

        res.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
        return next(error);
    }
});

export default AuthRouter;