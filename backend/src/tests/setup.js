import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;

  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await collection.deleteMany({});
    }),
  );
});

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);
