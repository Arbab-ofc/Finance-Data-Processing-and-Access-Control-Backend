import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of requiredEnv) {
  if (!process.env[key] && process.env.NODE_ENV !== 'test') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_backend_test',
  jwtSecret: process.env.JWT_SECRET || 'test_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || '*',
  authCookieName: process.env.AUTH_COOKIE_NAME || 'token',
};
