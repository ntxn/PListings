import httpMocks from 'node-mocks-http';
import { Response } from 'express';

import { AppError } from '../../utils';
import { accessRestrictor } from '../access-restrictor';
import { UserRole, ErrMsg } from '../../../common';
import { User, UserDoc } from '../../models';

const restrictedToAdminMiddleware = accessRestrictor(UserRole.Admin);
const next = jest.fn();
const name = 'Jane Doe';
const email = 'jdoe@g.io';
const password = 'password';
const passwordConfirm = 'password';

let user: UserDoc | undefined;

describe('ACCESS RESTRICTOR', () => {
  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm });
    await user.save();
  });

  it('Calls next function when the role of the user in the request body is in the list', async () => {
    user!.role = UserRole.Admin;
    await user!.save({ validateBeforeSave: false });
    expect(user!.role).toBe(UserRole.Admin);

    restrictedToAdminMiddleware(
      httpMocks.createRequest({ user }),
      {} as Response,
      next
    );

    const nextFnParam = (next as jest.Mock).mock.calls[0][0];
    expect(nextFnParam).toBeUndefined();
  });

  it('Returns a 403 when the user role is not in the access granted list', async () => {
    expect(user!.role).toBe(UserRole.User);

    restrictedToAdminMiddleware(
      httpMocks.createRequest({ user }),
      {} as Response,
      next
    );

    const nextFnParam = (next as jest.Mock).mock.calls[0][0];
    expect(nextFnParam instanceof AppError).toBe(true);
    expect(nextFnParam.message).toBe(ErrMsg.AccessRestriction);
    expect(nextFnParam.statusCode).toBe(403);
  });
});
