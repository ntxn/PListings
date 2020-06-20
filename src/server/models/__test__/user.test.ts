import { User, UserDoc } from '../user';
import { createToken } from '../../utils';
import { ErrMsg, AccountStatus, UserRole } from '../../../common';

const name = 'Will Smith';
const email = 'wsmith@g.io';
const password = 'password';
const passwordConfirm = 'password';
const bio = 'biobiobiob'.repeat(16);

let user: UserDoc;

describe('Creating User instance with invalid inputs', () => {
  it('Throws error when any of the required inputs are empty', async () => {
    user = User.build({
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    });
    await expect(user.save()).rejects.toThrow();

    user = User.build({ name: '', email, password, passwordConfirm });
    await expect(user.save()).rejects.toThrowError(ErrMsg.NameRequired);

    user = User.build({ name, email: '', password, passwordConfirm });
    await expect(user.save()).rejects.toThrowError(ErrMsg.EmailRequired);

    user = User.build({ name, email, password: '', passwordConfirm });
    await expect(user.save()).rejects.toThrowError(ErrMsg.PasswordRequired);

    user = User.build({ name, email, password, passwordConfirm: '' });
    await expect(user.save()).rejects.toThrowError(
      ErrMsg.PasswordConfirmRequired
    );
  });

  it('Throws min/max length error message when inputs does not meet length constraint', async () => {
    let user = User.build({ name, email, password: 'pass', passwordConfirm });
    await expect(user.save()).rejects.toThrowError(ErrMsg.PasswordMinLength);

    user = User.build({ name, email, password, passwordConfirm, bio });
    await expect(user.save()).rejects.toThrowError(ErrMsg.BioMaxLength);
  });

  it('Return an invalid email error if the email format is invalid', async () => {
    user = User.build({ name, email: 'just text', password, passwordConfirm });
    await expect(user.save()).rejects.toThrowError(ErrMsg.EmailInvalid);

    user = User.build({ name, email: 'g@i', password, passwordConfirm });
    await expect(user.save()).rejects.toThrowError(ErrMsg.EmailInvalid);
  });

  it('Returns a duplicate key MongoError if the provided email is already in use', async () => {
    // Create a user with email
    user = User.build({ name, email, password, passwordConfirm });
    await user.save();

    // Creating another user with the same email
    const newUser = User.build({ name, email, password, passwordConfirm });
    await expect(newUser.save()).rejects.toThrowError(
      `E11000 duplicate key error dup key: { : \"${email}\" }`
    );
  });

  it('Returns passwordConfirmNotMatch error message when providing different password and passwordConfirm', async () => {
    user = User.build({ name, email, password, passwordConfirm: 'pass1234' });
    await expect(user.save()).rejects.toThrowError(
      ErrMsg.PasswordConfirmNotMatch
    );
  });
});

describe('New User instance created with valid inputs', () => {
  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm });
    await user.save();
  });

  it('Deletes passwordConfirm, stores hashed password only', () => {
    expect(user.password).not.toEqual(password);
    expect(user.passwordConfirm).toBeUndefined();
  });

  it('Does not insert a date to passwordChangedAt', async () => {
    expect(user.passwordChangedAt).toBeUndefined();
  });

  it('Has an empty token array', async () => {
    expect(user.tokens.length).toEqual(0);
  });

  it('Has createdAt and updatedAt fields', async () => {
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('Has a role of UserRole.User and status of AccountStatus.Active', async () => {
    expect(user.role).toEqual(UserRole.User);
    expect(user.status).toEqual(AccountStatus.Active);
  });
});

describe('User updates password', () => {
  let oldHashedPassword: string;
  let oldUpdatedAt: Date;

  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm });
    await user.save();

    oldHashedPassword = user.password;
    oldUpdatedAt = user.updatedAt;

    user.password = 'pass1234';
    user.passwordConfirm = 'pass1234';
    await user.save();
  });

  it('Replaces password with a new hashed password', async () => {
    expect(oldHashedPassword).not.toEqual(user.password);
  });

  it('Updates passwordChangedAt field', async () => {
    expect(user.passwordChangedAt).toBeDefined();
  });

  it('Updates updatedAt field with a newer time', async () => {
    expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
  });
});

describe('User instance methods', () => {
  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm });
    await user.save();
  });

  it('Compares hashed password and input password correctly', async () => {
    let result = await user.correctPassword(password);
    expect(result).toBe(true);

    result = await user.correctPassword('notProvidedPassword');
    expect(result).toBe(false);
  });

  it('Removes all expired tokens', async () => {
    user.tokens.push({ token: createToken(user.id, '0') }); // 0 milliseconds
    user.tokens.push({ token: createToken(user.id, '1') }); // 1 milliseconds
    user.tokens.push({ token: createToken(user.id, '1d') }); // 1 day

    user.removeExpiredTokens();
    expect(user.tokens.length).toEqual(1);
  });
});

describe('User class static methods', () => {
  let token: string;

  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm });
    await user.save();

    token = createToken(user.id, '1d');
    user.tokens.push({ token });
    await user.save({ validateBeforeSave: false });
  });

  it('Finds user by ID and token correctly', async () => {
    const foundUser = await User.findOneByIdAndToken(user.id, token);
    expect(foundUser.id).toEqual(user.id);
    expect(foundUser.tokens.length).toEqual(user.tokens.length);
    expect(foundUser.tokens[0].token).toEqual(user.tokens[0].token);
  });
});
