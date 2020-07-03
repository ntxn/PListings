import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../server/app';
import { mongoDbOptions, ApiRoutes, DEFAULT_LOCATION } from '../common';

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
  const name = 'Jane Doe';
  const password = 'password';
  const passwordConfirm = 'password';
  const location = DEFAULT_LOCATION;

  const response = await request(app)
    .post(ApiRoutes.SignUp)
    .send({ name, email, password, passwordConfirm, location })
    .expect(201);

  return response.get('Set-Cookie');
};
