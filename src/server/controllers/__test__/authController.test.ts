import request from 'supertest';
import { app } from '../../app';
import { User, UserDoc } from '../../models';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../utils/email';
import { createToken } from '../../utils';
import {
  Base,
  ApiRoutes,
  RequestStatus,
  AccountStatus,
  ErrMsg,
} from '../../../common';

const name = 'Jane Doe';
const email = 'jdoe@g.io';
const password = 'password';
const passwordConfirm = 'password';

describe('SIGN UP', () => {
  type ReqBody = { [key: string]: string };
  const validReqBody = { name, email, password, passwordConfirm };

  const testField = async (
    fieldName: string,
    errMsg: string,
    reqBody: ReqBody
  ) => {
    const response = await request(app).post(ApiRoutes.SignUp).send(reqBody);
    expect(response.body.status).toEqual(RequestStatus.Fail);

    const { field, message } = response.body.errors[0];
    expect(field).toBe(fieldName);
    expect(message).toBe(errMsg);
  };

  it('Returns a 201 when valid input are provided', async () => {
    const { body } = await request(app)
      .post(ApiRoutes.SignUp)
      .send(validReqBody)
      .expect(201);

    // Test the return user data
    const user = body.data;
    expect(body.status).toBe(RequestStatus.Success);
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.password).toBeUndefined();
    expect(user.passwordConfirm).toBeUndefined();
    expect(user.id).toBeDefined();

    // Confirm that there's such a user saved to the database
    const userDB = await User.findById(user.id);
    expect(userDB).toBeDefined();
    expect(userDB!.id).toEqual(user.id);
    expect(userDB!.tokens.length).toBe(1);
    expect(userDB!.tokens[0].token).toBeDefined();

    // A welcome email should have been sent out
    expect(sendWelcomeEmail).toHaveBeenCalled();
  });

  it('Returns a 400 when any of the required body fields are missing', async () => {
    const response = await request(app)
      .post(ApiRoutes.SignUp)
      .send()
      .expect(400);
    expect(response.body.status).toEqual(RequestStatus.Fail);
    expect(response.body.message).toEqual(ErrMsg.ValidationError);
    expect(response.body.errors.length).toBe(4);

    let missedFieldBody: ReqBody = { email, password, passwordConfirm };
    await testField('name', ErrMsg.NameRequired, missedFieldBody);

    missedFieldBody = { name, password, passwordConfirm };
    await testField('email', ErrMsg.EmailRequired, missedFieldBody);

    missedFieldBody = { name, email, passwordConfirm };
    await testField('password', ErrMsg.PasswordRequired, missedFieldBody);

    missedFieldBody = { name, email, password };
    await testField(
      'passwordConfirm',
      ErrMsg.PasswordConfirmRequired,
      missedFieldBody
    );
  });

  it('Returns a 400 when email, password are invalid and passwordConfirm is different from password', async () => {
    let invalidFieldBody: ReqBody = {
      name,
      email: 'k',
      password,
      passwordConfirm,
    };
    await testField('email', ErrMsg.EmailInvalid, invalidFieldBody);

    invalidFieldBody = { name, email, password: '1', passwordConfirm };
    await testField('password', ErrMsg.PasswordMinLength, invalidFieldBody);

    invalidFieldBody = { name, email, password, passwordConfirm: 'difPass123' };
    await testField(
      'passwordConfirm',
      ErrMsg.PasswordConfirmNotMatch,
      invalidFieldBody
    );
  });

  it('Returns a 400 when signing up with an existing email', async () => {
    // Create a user and save in DB
    const user = User.build(validReqBody);
    await user.save();

    // Error message of email in use if account status is Active
    expect(user.status).toEqual(AccountStatus.Active);
    let response = await request(app)
      .post(ApiRoutes.SignUp)
      .send(validReqBody)
      .expect(400);
    expect(response.body.message).toEqual(ErrMsg.EmailInUse);

    // Error message of inactive account if account status is Inactive
    user.status = AccountStatus.Inactive;
    await user.save({ validateBeforeSave: false });
    response = await request(app)
      .post(ApiRoutes.SignUp)
      .send(validReqBody)
      .expect(400);
    expect(response.body.message).toEqual(ErrMsg.InactiveAccount);

    // Error message of account suspended if account status is Suspended
    user.status = AccountStatus.Suspended;
    await user.save({ validateBeforeSave: false });
    response = await request(app)
      .post(ApiRoutes.SignUp)
      .send(validReqBody)
      .expect(400);
    expect(response.body.message).toEqual(ErrMsg.SuspendedAccount);
  });
});

describe('LOG IN', () => {
  let user: UserDoc | null;

  beforeEach(async () => {
    const { body } = await request(app)
      .post(ApiRoutes.SignUp)
      .send({ name, email, password, passwordConfirm });
    user = await User.findById(body.data.id);
  });

  it('Returns a 200 when valid input are provided', async () => {
    const response = await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email, password })
      .expect(200);
    expect(response.body.status).toEqual(RequestStatus.Success);
    expect(response.body.data.email).toEqual(email);

    expect(response.get('Set-Cookie')).toBeDefined();
  });

  it('Returns a 400 when email and password are invalid', async () => {
    let response = await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email: 'w', password: '2' })
      .expect(400);
    expect(response.body.status).toEqual(RequestStatus.Fail);
    expect(response.body.message).toEqual(ErrMsg.ValidationError);
    expect(response.body.errors.length).toBe(2);

    response = await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email: 'w', password })
      .expect(400);
    expect(response.body.errors[0].message).toEqual(ErrMsg.EmailInvalid);

    response = await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email, password: '1' })
      .expect(400);
    expect(response.body.errors[0].message).toEqual(ErrMsg.PasswordMinLength);
  });

  it('Returns a 401 when there is no match of the provided email and password', async () => {
    let response = await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email: 'email@email.com', password })
      .expect(401);
    expect(response.body.message).toEqual(ErrMsg.InvalidCredentials);

    response = await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email, password: 'SomeOtherPassword' })
      .expect(401);
    expect(response.body.message).toEqual(ErrMsg.InvalidCredentials);
  });

  it('Returns a 400 when the user is suspended', async () => {
    user!.status = AccountStatus.Suspended;
    await user!.save({ validateBeforeSave: false });

    const response = await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email, password })
      .expect(400);
    expect(response.body.message).toEqual(ErrMsg.SuspendedAccount);
  });

  it('Updates account status to Active if it was inactive before', async () => {
    user!.status = AccountStatus.Inactive;
    await user!.save({ validateBeforeSave: false });

    await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email, password })
      .expect(200);

    const loggedInUser = await User.findById(user!.id);
    expect(loggedInUser!.status).toEqual(AccountStatus.Active);
  });

  it('Removes expired tokens', async () => {
    // Add 2 expired tokens, and 1 token expires in 2 days
    user!.tokens.push({ token: createToken(user!.id, '0') });
    user!.tokens.push({ token: createToken(user!.id, '1') });
    user!.tokens.push({ token: createToken(user!.id, '2d') });
    await user!.save({ validateBeforeSave: false });
    expect(user!.tokens.length).toBe(4);

    // Log in which adds 1 new token and remove expired tokens
    await request(app)
      .post(ApiRoutes.LogIn)
      .send({ email, password })
      .expect(200);

    // The user data in database should remove the 2 expired tokens
    const loggedInUser = await User.findById(user!.id);
    expect(loggedInUser!.tokens.length).toBe(3);
  });
});

describe('LOG OUT', () => {
  let user: UserDoc | null;
  let userCookie: string[];

  beforeEach(async () => {
    userCookie = await global.login(email);
    user = await User.findOne({ email });

    user!.tokens.push({ token: createToken(user!.id, '0') });
    user!.tokens.push({ token: createToken(user!.id, '1') });
    user!.tokens.push({ token: createToken(user!.id, '2d') });
    await user!.save({ validateBeforeSave: false });

    expect(user!.tokens.length).toBe(4);
  });

  it('Removes token of the current login session and clears cookie session (for single log out)', async () => {
    const response = await request(app)
      .get(ApiRoutes.LogOut)
      .set('Cookie', userCookie)
      .send()
      .expect(200);

    expect(response.get('Set-Cookie')[0].split('; ')[0]).toEqual(
      'jwt=loggedOut'
    );

    const loggedOutUser = await User.findById(user!.id);
    expect(loggedOutUser!.tokens.length).toBe(1);
  });

  it('Removes all tokens and clears cookie session (for log out all)', async () => {
    const response = await request(app)
      .get(ApiRoutes.LogOutAll)
      .set('Cookie', userCookie)
      .send()
      .expect(200);

    expect(response.get('Set-Cookie')[0].split('; ')[0]).toEqual(
      'jwt=loggedOut'
    );

    const loggedOutUser = await User.findById(user!.id);
    expect(loggedOutUser!.tokens.length).toBe(0);
  });
});

describe('FORGOT PASSWORD', () => {
  let user: UserDoc | null;

  beforeEach(async () => {
    const { body } = await request(app)
      .post(ApiRoutes.SignUp)
      .send({ name, email, password, passwordConfirm });
    user = await User.findById(body.data.id);
  });

  it('Returns a 200 when an email with reset URL is sent out successfully', async () => {
    expect(user!.passwordResetToken).toBeUndefined();
    expect(user!.passwordResetExpires).toBeUndefined();

    await request(app)
      .post(ApiRoutes.ForgotPassword)
      .send({ email })
      .expect(200);
    expect(sendPasswordResetEmail).toHaveBeenCalled();

    const updatedUser = await User.findById(user!.id);
    expect(updatedUser!.passwordResetToken).toBeDefined();
    expect(updatedUser!.passwordResetExpires).toBeDefined();
  });

  it('Returns a 400 when providing an invalid email', async () => {
    await request(app)
      .post(ApiRoutes.ForgotPassword)
      .send({ email: 'e' })
      .expect(400);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('Returns a 404 when theres no user with that email', async () => {
    await request(app)
      .post(ApiRoutes.ForgotPassword)
      .send({ email: 'e@e.io' })
      .expect(404);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('Returns a 500 when the reset email is failed to be sent out', async () => {
    (sendPasswordResetEmail as jest.Mock).mockRejectedValueOnce({});
    await request(app)
      .post(ApiRoutes.ForgotPassword)
      .send({ email })
      .expect(500);
    expect(sendPasswordResetEmail).toHaveBeenCalled();

    const updatedUser = await User.findById(user!.id);
    expect(updatedUser!.passwordResetToken).toBeUndefined();
    expect(updatedUser!.passwordResetExpires).toBeUndefined();
  });
});

describe('RESET PASSWORD', () => {
  let user: UserDoc | null;
  let resetToken: string;
  const resetPasswordRoute = `${Base.Auth}/reset-password`;

  beforeEach(async () => {
    const response = await request(app)
      .post(ApiRoutes.SignUp)
      .send({ name, email, password, passwordConfirm });
    const userId = response.body.data.id;
    await request(app)
      .post(ApiRoutes.ForgotPassword)
      .send({ email })
      .expect(200);

    user = await User.findById(userId);
    const resetUrl = (sendPasswordResetEmail as jest.Mock).mock.calls[0][2];
    resetToken = resetUrl.split('/').pop();
  });

  it('Returns a 200 with valid reset url and valid passwords input', async () => {
    expect(user!.passwordResetToken).toBeDefined();
    expect(user!.passwordResetExpires).toBeDefined();
    expect(user!.tokens.length).toBe(1);

    const response = await request(app)
      .patch(`${resetPasswordRoute}/${resetToken}`)
      .send({ password, passwordConfirm })
      .expect(200);

    const updatedUser = await User.findById(user!.id);
    expect(updatedUser!.tokens.length).toBe(1);
    expect(updatedUser!.passwordResetToken).toBeUndefined();
    expect(updatedUser!.passwordResetExpires).toBeUndefined();
    expect(updatedUser!.password).not.toEqual(user!.password);
    expect(response.get('Set-Cookie')).toBeDefined();
  });

  it('Returns a 400 when reset token is expired', async () => {
    user!.passwordResetExpires = Date.now();
    await user!.save({ validateBeforeSave: false });

    const { body } = await request(app)
      .patch(`${resetPasswordRoute}/${resetToken}`)
      .send({ password, passwordConfirm })
      .expect(400);
    expect(body.message).toBe(ErrMsg.ResetTokenInvalidOrExpired);
  });

  it('Returns a 400 when reset token format is invalid', async () => {
    const { body } = await request(app)
      .patch(`${resetPasswordRoute}/someRandomToken`)
      .send({ password, passwordConfirm })
      .expect(400);
    expect(body.message).toBe(ErrMsg.ResetTokenInvalidOrExpired);
  });
});
