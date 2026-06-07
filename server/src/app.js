import 'dotenv/config';
import express from 'express';
import cors from 'cors'
import AuthRouter from './routes/AuthRouter.js';
import SubscribtionRouter from './routes/SubscriptionRouter.js';
import CategoryRouter from './routes/CategoryRouter.js';
import ErrorMiddleware from './middleware/ErrorMiddleware.js';

const app = express();

app.use(express.json());

app.use(cors({ origin: 'http://localhost:3001' }))

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/auth', AuthRouter);
app.use('/subscriptions', SubscribtionRouter);
app.use('/categories', CategoryRouter);
app.use(ErrorMiddleware);

export default app;
