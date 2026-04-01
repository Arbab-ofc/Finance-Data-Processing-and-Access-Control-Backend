import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDatabase = async () => {
  await mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
    maxPoolSize: env.mongoMaxPoolSize,
  });
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
};
