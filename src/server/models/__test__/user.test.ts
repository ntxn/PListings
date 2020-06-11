import { User, UserDoc } from '../user';
import { errMsg } from '../../../common';

const name = 'Will Smith';
const email = 'wsmith@g.io';
const password = 'password';
const bio = 'biobiobiob'.repeat(16);

describe('Creating User instance with invalid inputs', () => {
  it('Throws error when any of the required inputs are empty', async () => {
    let user = User.build({ name: '', email: '', password: '' });
    await expect(user.save()).rejects.toThrow();

    user = User.build({ name: '', email, password });
    await expect(user.save()).rejects.toThrowError(errMsg.NameRequired);

    user = User.build({ name, email: '', password });
    await expect(user.save()).rejects.toThrowError(errMsg.EmailRequired);

    user = User.build({ name, email, password: '' });
    await expect(user.save()).rejects.toThrowError(errMsg.PasswordRequired);
  });

  it('Throws min/max length error message when inputs exceed length constraint', async () => {
    let user = User.build({ name, email, password: 'pass' });
    await expect(user.save()).rejects.toThrowError(errMsg.PasswordMinLength);

    user = User.build({ name, email, password, bio });
    await expect(user.save()).rejects.toThrowError(errMsg.BioMaxLength);
  });
});

let user: UserDoc;

describe('Creating/Updating User instance with valid inputs', () => {
  beforeEach(async () => {
    user = User.build({ name, email, password });
    await user.save();
  });

  it('Only hashed password are stored', () => {
    expect(user.password).not.toEqual(password);
  });

  it('Returns an error if trying to create a new user with an existing email', async () => {
    const newUser = User.build({ name, email, password });
    await expect(newUser.save()).rejects.toThrow();
  });

  it('Compares hashed password and input password correctly', async () => {
    if (user.correctPassword) {
      let result = await user.correctPassword(password);
      expect(result).toBe(true);

      result = await user.correctPassword('notProvidedPassword');
      expect(result).toBe(false);
    }
  });

  it('Updates passwordChangedAt field when user changes password', async () => {
    // newly created users won't have passwordChangedAt field
    expect(user.passwordChangedAt).toBeUndefined();

    // change password
    user.password = 'newPassword';
    await user.save();
    expect(user.passwordChangedAt).toBeDefined();
  });

  it('Updates updatedAt field when user makes changes to user document', async () => {
    expect(user.updatedAt).toBeUndefined();

    // change name
    user.name = 'Taylor Swift';
    await user.save();
    expect(user.updatedAt).toBeDefined();
  });
});
