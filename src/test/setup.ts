import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { mongoDbOptions } from '../common';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory test database
  mongoServer = new MongoMemoryServer();
  const mongoDbUri = await mongoServer.getUri();

  await mongoose.connect(mongoDbUri, mongoDbOptions);
});

beforeEach(async () => {
  // Clear database before each test
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
  // Close mongoose connection and stop mongo server
  await mongoServer.stop();
  await mongoose.connection.close();
});
