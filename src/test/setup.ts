import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server/app';
import { mongoDbOptions, ResourceRoutes, Routes } from '../common';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      login(email: string): Promise<string[]>;
    }
  }
}

jest.mock('../server/utils/email');

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory test database
  mongoServer = new MongoMemoryServer();
  const mongoDbUri = await mongoServer.getUri();

  await mongoose.connect(mongoDbUri, mongoDbOptions);
});

beforeEach(async () => {
  jest.clearAllMocks();
  // Clear database before each test
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
  // Close mongoose connection and stop mongo server
  await mongoServer.stop();
  await mongoose.connection.close();
});

global.login = async (email: string) => {
  const response = await request(app)
    .post(`${ResourceRoutes.Auth}${Routes.LogIn}`)
    .send({ email, password: 'password' })
    .expect(200);

  return response.get('Set-Cookie');
};
