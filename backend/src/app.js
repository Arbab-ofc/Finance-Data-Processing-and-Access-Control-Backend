import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { requestId } from './middlewares/requestIdMiddleware.js';
import { apiRouter } from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl === '*' ? true : env.clientUrl, credentials: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
