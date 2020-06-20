import request from 'supertest';
import mongoose from 'mongoose';
import httpMocks from 'node-mocks-http';
import { Request, Response } from 'express';

import { app } from '../../app';
import { authenticationChecker } from '../authentication-checker';
import { ErrMsg, RequestStatus, ApiRoutes } from '../../../common';
import { User, UserDoc } from '../../models';
import { NotFoundError, NotAuthorizedError, createToken } from '../../utils';

const name = 'Jane Doe';
const email = 'jdoe@g.io';
const password = 'password';
const passwordConfirm = 'password';

const next = jest.fn();
let res: httpMocks.MockResponse<Response>;
let req: httpMocks.MockRequest<Request>;

describe('AUTHENTICATING USER', () => {
  let user: UserDoc | null;

  beforeEach(async () => {
    await global.login(email);
    user = await User.findOne({ email });
  });

  it('Inserts user and token to request object when the user is authenticated', async () => {
    const { token } = user!.tokens[0];
    req = httpMocks.createRequest({ cookies: { jwt: token } });

    await authenticationChecker(req, res, next);
    expect(next).toHaveBeenCalled();

    const nextFnParam = (next as jest.Mock).mock.calls[0][0];
    expect(nextFnParam).toBeUndefined();
    expect(req.token).toBe(token);
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe(email);
  });

  it('Calls next function with Unauthenticated message when there is no token', async () => {
    req = httpMocks.createRequest();

    await authenticationChecker(req, res, next);
    const nextFnParam = (next as jest.Mock).mock.calls[0][0];
    expect(nextFnParam.statusCode).toBe(401);
    expect(nextFnParam.message).toBe(ErrMsg.Unauthenticated);
  });

  it('Calls next function with JwtNotFoundUserWithToken message when token is invalid', async () => {
    const token = createToken(user!.id, '2d');

    req = httpMocks.createRequest({ cookies: { jwt: token } });

    await authenticationChecker(req, res, next);
    const nextFnParam = (next as jest.Mock).mock.calls[0][0];
    expect(nextFnParam.statusCode).toBe(401);
    expect(nextFnParam.message).toBe(ErrMsg.JwtNotFoundUserWithToken);
  });
});
