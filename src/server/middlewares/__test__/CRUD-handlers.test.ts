import request from 'supertest';
import mongoose from 'mongoose';
import httpMocks from 'node-mocks-http';
import { Request, Response } from 'express';

import { app } from '../../app';
import { createOne, getOne, updateOne, deleteOne } from '../CRUD-handlers';
import { ErrMsg, RequestStatus, ApiRoutes } from '../../../common';
import { User } from '../../models';
import { NotFoundError } from '../../utils';

const name = 'Jane Doe';
const email = 'jdoe@g.io';
const password = 'password';
const passwordConfirm = 'password';

const next = jest.fn();
let res: httpMocks.MockResponse<Response>;
let req: httpMocks.MockRequest<Request>;

describe('CRUD HANDLER MIDDLEWARES ON MODEL', () => {
  beforeEach(() => {
    res = httpMocks.createResponse();
  });

  describe('CREATE A DOCUMENT', () => {
    const createUserMiddleware = createOne(User);

    it('Returns a 201 when providing valid document attributes to create new documents', async () => {
      req = httpMocks.createRequest({
        body: { name, email, password, passwordConfirm },
      });

      await createUserMiddleware(req, res, next);

      expect(res.statusCode).toBe(201);
      const { status, data } = res._getJSONData();
      expect(status).toBe(RequestStatus.Success);
      expect(data.name).toBe(name);
      expect(data.email).toBe(email);
    });

    it('Calls the next function to pass on the error when providing invalid input', async () => {
      req = httpMocks.createRequest({
        body: { email, password: '1234', passwordConfirm },
      });

      await createUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(
        (next as jest.Mock).mock.calls[0][0] instanceof Error
      ).toBeTruthy();
    });
  });

  describe('GET A DOCUMENT', () => {
    const getUserMiddleware = getOne(User);
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const { body } = await request(app)
        .post(ApiRoutes.SignUp)
        .send({ name, email, password, passwordConfirm })
        .expect(201);
      userId = body.data.id;
    });

    it('Return a 200 and the requested user document when providing a valid doc ID in db', async () => {
      req = httpMocks.createRequest({ params: { id: userId } });

      await getUserMiddleware(req, res, next);

      expect(res.statusCode).toBe(200);
      const { status, data } = res._getJSONData();

      expect(status).toBe(RequestStatus.Success);
      expect(data.name).toBe(name);
      expect(data.email).toBe(email);
      expect(data.id).toBe(userId);
    });

    it('Calls next function with a CastError parameter when providing non Mongoose ObjectId as doc ID', async () => {
      req = httpMocks.createRequest({ params: { id: 'dfsdf' } });

      await getUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err instanceof mongoose.Error.CastError).toBeTruthy();
    });

    it('Calls next function with a NotFoundError parameter when providing a valid Mongoose ObjectId but the id does not exist', async () => {
      req = httpMocks.createRequest({
        params: { id: mongoose.Types.ObjectId().toHexString() },
      });
      await getUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toBe(ErrMsg.NoDocWithId);
    });
  });

  describe('UPDATE A DOCUMENT', () => {
    const updateUserMiddleware = updateOne(User);
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const { body } = await request(app)
        .post(ApiRoutes.SignUp)
        .send({ name, email, password, passwordConfirm })
        .expect(201);
      userId = body.data.id;
    });

    it('Returns a 200 and updated doc data when providing valid doc id and request body', async () => {
      const user = await User.findById(userId);
      expect(user!.name).toBe(name);

      req = httpMocks.createRequest({
        params: { id: userId },
        body: { name: 'Test' },
      });

      await updateUserMiddleware(req, res, next);
      expect(res.statusCode).toBe(200);

      const { status, data } = res._getJSONData();
      expect(status).toBe(RequestStatus.Success);
      expect(data.name).toBe('Test');
      expect(data.id).toBe(userId);
    });

    it('Call next function with a CastError when providing invalid id format (non mongoose ObjectId)', async () => {
      req = httpMocks.createRequest({
        params: { id: 'invalid' },
        body: { name: 'Test' },
      });

      await updateUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err instanceof mongoose.Error.CastError).toBeTruthy();
    });

    it('Call next function with an Error when providing invalid request body fields', async () => {
      req = httpMocks.createRequest({
        params: { id: userId },
        body: { name: '' },
      });

      await updateUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err instanceof Error).toBeTruthy();
    });

    it('Call next function with an NotFoundError when providing non existing ID', async () => {
      req = httpMocks.createRequest({
        params: { id: mongoose.Types.ObjectId().toHexString() },
        body: { name: 'Test' },
      });

      await updateUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toBe(ErrMsg.NoDocWithId);
    });
  });

  describe('DELETE A DOCUMENT', () => {
    const deleteUserMiddleware = deleteOne(User);
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const { body } = await request(app)
        .post(ApiRoutes.SignUp)
        .send({ name, email, password, passwordConfirm })
        .expect(201);
      userId = body.data.id;
    });

    it('Returns a 204 and no data when providing an existing ID. Doc is deleted from DB', async () => {
      req = httpMocks.createRequest({ params: { id: userId } });

      await deleteUserMiddleware(req, res, next);
      expect(res.statusCode).toBe(204);
      expect(res._getJSONData().data).toBeNull();

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('Calls next function with NotFoundError when providing non-existing ID', async () => {
      req = httpMocks.createRequest({
        params: { id: mongoose.Types.ObjectId().toHexString() },
      });

      await deleteUserMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();

      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err instanceof NotFoundError).toBeTruthy();
    });
  });
});
