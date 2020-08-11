import mongoose from 'mongoose';
import { Listing, ListingAttrs, ListingDoc } from '../listing';
import { User, UserDoc } from '../user';
import { createToken } from '../../utils';
import {
  ErrMsg,
  AccountStatus,
  UserRole,
  Categories,
  Subcategories,
  DEFAULT_LOCATION,
} from '../../../common';

// User Data
const name = 'Will Smith';
const email = 'wsmith@g.io';
const password = 'password';
const passwordConfirm = 'password';
const bio = 'biobiobiob'.repeat(16);

// Listing data
const title = 'Portable bench';
const price = 40;
const photos = ['itemPhoto.png'];
const category = Categories.SportsAndOutdoors;
const subcategory = Subcategories[category]['Camping Gear']!;
const location = DEFAULT_LOCATION;

const createListing = async (attrs: ListingAttrs) => {
  const listing = Listing.build(attrs);
  await listing.save();
  return listing;
};

let attrs: ListingAttrs;
let user: UserDoc;

describe('Creating User instance with invalid inputs', () => {
  it('Throws error when any of the required inputs are empty', async () => {
    user = User.build({
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      location: DEFAULT_LOCATION,
    });
    await expect(user.save()).rejects.toThrow();

    user = User.build({ name: '', email, password, passwordConfirm, location });
    await expect(user.save()).rejects.toThrowError(ErrMsg.NameRequired);

    user = User.build({ name, email: '', password, passwordConfirm, location });
    await expect(user.save()).rejects.toThrowError(ErrMsg.EmailRequired);

    user = User.build({ name, email, password: '', passwordConfirm, location });
    await expect(user.save()).rejects.toThrowError(ErrMsg.PasswordRequired);

    user = User.build({ name, email, password, passwordConfirm: '', location });
    await expect(user.save()).rejects.toThrowError(
      ErrMsg.PasswordConfirmRequired
    );
  });

  it('Throws min/max length error message when inputs does not meet length constraint', async () => {
    let user = User.build({
      name,
      email,
      password: 'pass',
      passwordConfirm,
      location,
    });
    await expect(user.save()).rejects.toThrowError(ErrMsg.PasswordMinLength);

    user = User.build({
      name,
      email,
      password,
      passwordConfirm,
      location,
      bio,
    });
    await expect(user.save()).rejects.toThrowError(ErrMsg.BioMaxLength);
  });

  it('Return an invalid email error if the email format is invalid', async () => {
    user = User.build({
      name,
      email: 'just text',
      password,
      passwordConfirm,
      location,
    });
    await expect(user.save()).rejects.toThrowError(ErrMsg.EmailInvalid);

    user = User.build({
      name,
      email: 'g@i',
      password,
      passwordConfirm,
      location,
    });
    await expect(user.save()).rejects.toThrowError(ErrMsg.EmailInvalid);
  });

  it('Returns a duplicate key MongoError if the provided email is already in use', async () => {
    // Create a user with email
    user = User.build({ name, email, password, passwordConfirm, location });
    await user.save();

    // Creating another user with the same email
    const newUser = User.build({
      name,
      email,
      password,
      passwordConfirm,
      location,
    });
    await expect(newUser.save()).rejects.toThrowError(
      `E11000 duplicate key error dup key: { : \"${email}\" }`
    );
  });

  it('Returns passwordConfirmNotMatch error message when providing different password and passwordConfirm', async () => {
    user = User.build({
      name,
      email,
      password,
      passwordConfirm: 'pass1234',
      location,
    });
    await expect(user.save()).rejects.toThrowError(
      ErrMsg.PasswordConfirmNotMatch
    );
  });
});

describe('New User instance created with valid inputs', () => {
  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm, location });
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
    user = User.build({ name, email, password, passwordConfirm, location });
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
    user = User.build({ name, email, password, passwordConfirm, location });
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
    user = User.build({ name, email, password, passwordConfirm, location });
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

describe('Listings belonged to user', () => {
  let listing1: ListingDoc, listing2: ListingDoc, listing3: ListingDoc;
  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm, location });
    await user!.save();

    const owner = user!.id;
    attrs = { title, price, photos, category, subcategory, location, owner };

    // Create 3 listings for this user
    listing1 = await createListing(attrs);
    listing2 = await createListing(attrs);
    listing3 = await createListing(attrs);

    // create 2 listings for random users
    await createListing({ ...attrs, owner: mongoose.Types.ObjectId() });
    await createListing({ ...attrs, owner: mongoose.Types.ObjectId() });
  });

  it('Retrieves listings when populate virtual listings and only includes listings that belong to this user', async () => {
    const updatedUser = await User.findById(user.id).populate(
      'listings',
      'title photos -owner'
    );

    expect(updatedUser!.listings!.length).toBe(3);
  });

  it('Returns an empty array of listings when there is no listings belonged to this user', async () => {
    // Delete all listing belonged to this user
    await Listing.findByIdAndDelete(listing1.id);
    await Listing.findByIdAndDelete(listing2.id);
    await Listing.findByIdAndDelete(listing3.id);

    const updatedUser = await User.findById(user.id).populate('listings');

    expect(updatedUser!.listings!.length).toBe(0);
  });
});
