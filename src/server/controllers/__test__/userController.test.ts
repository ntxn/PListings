import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { User, UserDoc, Listing, ListingDoc, ListingAttrs } from '../../models';
import { HTML_Methods } from '../../utils';
import {
  ApiRoutes,
  UserRole,
  RequestStatus,
  AccountStatus,
  ErrMsg,
  Categories,
  Subcategories,
  DEFAULT_LOCATION,
} from '../../../common';

const name = 'Jane Doe';
const email = 'jdoe@g.io';
const adminEmail = 'admin@g.io';
const password = 'password';
const passwordConfirm = 'password';

// Listing data
const title = 'Portable bench';
const price = 40;
const photos = ['itemPhoto.png'];
const category = Categories.SportsAndOutdoors;
const subcategory = Subcategories[category]['Camping Gear'];
const location = DEFAULT_LOCATION;

const createAListing = async (attrs: ListingAttrs) => {
  const listing = Listing.build(attrs);
  await listing.save();
  return listing;
};

let attrs: ListingAttrs;
let listing0: ListingDoc;
let listing1: ListingDoc;

const createListings = async (owner: mongoose.Types.ObjectId) => {
  attrs = { title, price, photos, category, subcategory, location, owner };

  // Create 4 listings for this owner, 2 is active, 1 created then deleted, 1 is expired
  listing0 = await createAListing(attrs);
  listing1 = await createAListing(attrs);

  const deletedListing = await createAListing(attrs);
  await Listing.findByIdAndDelete(deletedListing!.id);

  const expiredListing = await createAListing(attrs);
  expiredListing.active = false;
  await expiredListing.save({ validateBeforeSave: false });

  // create 2 listings for random users
  await createAListing({ ...attrs, owner: mongoose.Types.ObjectId() });
  await createAListing({ ...attrs, owner: mongoose.Types.ObjectId() });
};

const makeRequestToProtectedRouteWithoutAuthentication = async (
  method: HTML_Methods,
  route: string
) => {
  const { body } = await request(app)[method](route).send().expect(401);

  expect(body.status).toBe(RequestStatus.Fail);
  expect(body.message).toBe(ErrMsg.Unauthenticated);
};

describe('GET MY ACCOUNT', () => {
  it('Retrieves my account if I am logged in', async () => {
    const userCookie = await global.login(email);
    const response = await request(app)
      .get(ApiRoutes.MyAccount)
      .set('Cookie', userCookie)
      .send()
      .expect(200);

    expect(response.body.status).toBe(RequestStatus.Success);
    expect(response.body.data.email).toBe(email);
  });

  it('Returns a 401 when I am not logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.get,
      ApiRoutes.MyAccount
    );
  });
});

describe('UPDATE MY ACCOUNT', () => {
  let userCookie: string[];

  beforeEach(async () => {
    userCookie = await global.login(email);
  });

  it('Returns a 200 (account updated successfully) when I am logged in and provide valid request body input', async () => {
    const { body } = await request(app)
      .patch(ApiRoutes.UpdateMyAccount)
      .set('Cookie', userCookie)
      .send({ name: 'Test Name' })
      .expect(200);
    expect(body.status).toBe(RequestStatus.Success);

    const user = await User.findOne({ email });
    expect(user!.name).toBe('Test Name');
  });

  it('Returns a 401 when I am not logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.patch,
      ApiRoutes.UpdateMyAccount
    );
  });

  it('Returns a 400 when I try to update my password', async () => {
    const { body } = await request(app)
      .patch(ApiRoutes.UpdateMyAccount)
      .set('Cookie', userCookie)
      .send({ password: 'newPass1', passwordConfirm: 'newPass1' })
      .expect(400);
    expect(body.message).toBe(ErrMsg.NotPasswordChangeRoute);
  });

  it('Returns a 400 when request body input is invalid', async () => {
    const { body } = await request(app)
      .patch(ApiRoutes.UpdateMyAccount)
      .set('Cookie', userCookie)
      .send({ name: '' })
      .expect(400);
    expect(body.message).toBe(ErrMsg.ValidationError);
  });
});

describe('DELETE MY ACCOUNT', () => {
  let userCookie: string[];

  beforeEach(async () => {
    userCookie = await global.login(email);
  });

  it('Returns a 200 (account deleted successfully) when I am logged in. All my listings will be removed', async () => {
    // Create listings for this user
    let user = await User.findOne({ email });
    await createListings(user!.id);

    // Expectations before delete user
    expect(user!.status).toBe(AccountStatus.Active);
    let listings = await Listing.find({ owner: user!.id });
    expect(listings.length).toBe(3); // get active and inactive listings

    // Make request to delete user
    const response = await request(app)
      .delete(ApiRoutes.DeleteMyAccount)
      .set('Cookie', userCookie)
      .send()
      .expect(200);

    // Final expectations
    expect(response.body.status).toBe(RequestStatus.Success);
    expect(response.get('Set-Cookie')[0].split(';')[0]).toBe('jwt=loggedOut');

    user = await User.findOne({ email });
    expect(user!.status).toBe(AccountStatus.Inactive);
    expect(user!.tokens.length).toBe(0);

    listings = await Listing.find({ owner: user!.id });
    expect(listings.length).toBe(0);
  });

  it('Returns a 401 when I am not logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.delete,
      ApiRoutes.DeleteMyAccount
    );
  });
});

describe('UPDATE MY PASSWORD', () => {
  let userCookie: string[];

  beforeEach(async () => {
    userCookie = await global.login(email);
  });

  it('Returns a 200 (password updated successfully) when I am logged in and provide valid input in request body', async () => {
    const user = await User.findOne({ email });

    const response = await request(app)
      .patch(ApiRoutes.UpdateMyPassword)
      .set('Cookie', userCookie)
      .send({
        currentPassword: password,
        password: 'pass1234',
        passwordConfirm: 'pass1234',
      })
      .expect(200);

    expect(response.body.status).toBe(RequestStatus.Success);

    const updatedUser = await User.findOne({ email });
    expect(updatedUser!.tokens.length).toBe(1);
    expect(user!.password).not.toBe(updatedUser!.password);
  });

  it('Returns a 401 when I am not logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.patch,
      ApiRoutes.UpdateMyPassword
    );
  });

  it('Returns a 400 when required inputs are missing', async () => {
    const { body } = await request(app)
      .patch(ApiRoutes.UpdateMyPassword)
      .set('Cookie', userCookie)
      .send({ currentPassword: '' })
      .expect(400);
    expect(body.message).toBe(ErrMsg.MissingProperties);
  });

  it('Returns a 400 when inputs are invalid', async () => {
    const { body } = await request(app)
      .patch(ApiRoutes.UpdateMyPassword)
      .set('Cookie', userCookie)
      .send({
        currentPassword: password,
        password: 'pass',
        passwordConfirm: 'pass1234',
      })
      .expect(400);

    expect(body.message).toBe(ErrMsg.ValidationError);
  });

  it('Returns a 401 when currentPassword does not match the password in the databse', async () => {
    const { body } = await request(app)
      .patch(ApiRoutes.UpdateMyPassword)
      .set('Cookie', userCookie)
      .send({
        currentPassword: 'differentPassword',
        password: 'pass1234',
        passwordConfirm: 'pass1234',
      })
      .expect(401);

    expect(body.message).toBe(ErrMsg.InvalidCredentials);
  });
});

describe('ADMIN: GET ALL USERS', () => {
  let userCookie: string[];
  let adminCookie: string[];

  beforeEach(async () => {
    userCookie = await global.login(email);

    adminCookie = await global.login(adminEmail);
    const admin = await User.findOne({ email: adminEmail });
    admin!.role = UserRole.Admin;
    await admin!.save({ validateBeforeSave: false });
  });

  it('Returns a 200 when an admin user is logged in', async () => {
    const { body } = await request(app)
      .get(ApiRoutes.UsersProtected)
      .set('Cookie', adminCookie)
      .send()
      .expect(200);

    expect(body.status).toBe(RequestStatus.Success);
    expect(body.length).toBe(2);
  });

  it('Returns a 401 when no user is logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.get,
      ApiRoutes.UsersProtected
    );
  });

  it('Returns a 403 when a non-admin user requests for a user list', async () => {
    const { body } = await request(app)
      .get(ApiRoutes.UsersProtected)
      .set('Cookie', userCookie)
      .send()
      .expect(403);

    expect(body.status).toBe(RequestStatus.Fail);
    expect(body.message).toBe(ErrMsg.AccessRestriction);
  });
});

describe('ADMIN: GET A USER', () => {
  let userCookie: string[];
  let adminCookie: string[];
  let user: UserDoc | null;
  let singleUserRoute: string;

  beforeEach(async () => {
    userCookie = await global.login(email);
    user = await User.findOne({ email });

    adminCookie = await global.login(adminEmail);
    const admin = await User.findOne({ email: adminEmail });
    admin!.role = UserRole.Admin;
    await admin!.save({ validateBeforeSave: false });

    singleUserRoute = `${ApiRoutes.UsersProtected}/${user!.id}`;
  });

  it('Returns a 200 when an admin user make the request with a valid user ID', async () => {
    const { body } = await request(app)
      .get(singleUserRoute)
      .set('Cookie', adminCookie)
      .send()
      .expect(200);

    expect(body.status).toBe(RequestStatus.Success);
    expect(body.data.email).toBe(user!.email);
  });

  it('Returns a 401 when no user is logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.get,
      singleUserRoute
    );
  });

  it('Returns a 403 when a non-admin user requests other users data', async () => {
    const { body } = await request(app)
      .get(singleUserRoute)
      .set('Cookie', userCookie)
      .send()
      .expect(403);

    expect(body.status).toBe(RequestStatus.Fail);
    expect(body.message).toBe(ErrMsg.AccessRestriction);
  });

  it('Returns a 400 when request is made with an invalid mongoose ID format', async () => {
    await request(app)
      .get(`${ApiRoutes.UsersProtected}/someInvalidUserId`)
      .set('Cookie', adminCookie)
      .send()
      .expect(400);
  });

  it('Returns a 404 when request is made with a non-existing user ID', async () => {
    const { body } = await request(app)
      .get(
        `${ApiRoutes.UsersProtected}/${mongoose.Types.ObjectId().toHexString()}`
      )
      .set('Cookie', adminCookie)
      .send()
      .expect(404);
    expect(body.message).toBe(ErrMsg.NoDocWithId);
  });
});

describe('ADMIN: UPDATE A USER', () => {
  let userCookie: string[];
  let adminCookie: string[];
  let user: UserDoc | null;
  let singleUserRoute: string;

  beforeEach(async () => {
    userCookie = await global.login(email);
    user = await User.findOne({ email });

    adminCookie = await global.login(adminEmail);
    const admin = await User.findOne({ email: adminEmail });
    admin!.role = UserRole.Admin;
    await admin!.save({ validateBeforeSave: false });

    singleUserRoute = `${ApiRoutes.UsersProtected}/${user!.id}`;
  });

  it('Returns a 200 when an admin user make the request with a valid user ID and input', async () => {
    const { body } = await request(app)
      .patch(singleUserRoute)
      .set('Cookie', adminCookie)
      .send({ name: 'Test Name' })
      .expect(200);

    expect(body.status).toBe(RequestStatus.Success);

    const updatedUser = await User.findOne({ email });
    expect(updatedUser!.name).toBe('Test Name');
    expect(updatedUser!.email).toBe(user!.email);
    expect(updatedUser!.updatedAt.getTime()).toBeGreaterThan(
      user!.updatedAt.getTime()
    );
  });

  it('Returns a 401 when no user is logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.patch,
      singleUserRoute
    );
  });

  it('Returns a 403 when a non-admin user wants to update other users data', async () => {
    const { body } = await request(app)
      .patch(singleUserRoute)
      .set('Cookie', userCookie)
      .send({ name: 'Test Name' })
      .expect(403);

    expect(body.status).toBe(RequestStatus.Fail);
    expect(body.message).toBe(ErrMsg.AccessRestriction);
  });

  it('Returns a 400 when user ID is invalid mongoose ObjectId format', async () => {
    await request(app)
      .patch(`${ApiRoutes.UsersProtected}/someInvalidUserId`)
      .set('Cookie', adminCookie)
      .send({ name: 'Test Name' })
      .expect(400);
  });

  it('Returns a 404 when user ID does not exist', async () => {
    const { body } = await request(app)
      .patch(
        `${ApiRoutes.UsersProtected}/${mongoose.Types.ObjectId().toHexString()}`
      )
      .set('Cookie', adminCookie)
      .send({ name: 'Test Name' })
      .expect(404);
    expect(body.message).toBe(ErrMsg.NoDocWithId);
  });

  it('Returns a 403 when admin tries to update users password', async () => {
    const { body } = await request(app)
      .patch(singleUserRoute)
      .set('Cookie', adminCookie)
      .send({ password: 'pass1234', passwordConfirm: 'pass1234' })
      .expect(403);
    expect(body.message).toBe(ErrMsg.PasswordChangeRestrictedToAccountOwner);
  });

  it('Returns a validation error when request body input is invalid', async () => {
    const { body } = await request(app)
      .patch(singleUserRoute)
      .set('Cookie', adminCookie)
      .send({ name: '' });
    expect(body.message).toBe(ErrMsg.ValidationError);
  });
});

describe('ADMIN: DELETE A USER', () => {
  let userCookie: string[];
  let adminCookie: string[];
  let user: UserDoc | null;
  let singleUserRoute: string;

  beforeEach(async () => {
    userCookie = await global.login(email);
    user = await User.findOne({ email });

    adminCookie = await global.login(adminEmail);
    const admin = await User.findOne({ email: adminEmail });
    admin!.role = UserRole.Admin;
    await admin!.save({ validateBeforeSave: false });

    singleUserRoute = `${ApiRoutes.UsersProtected}/${user!.id}`;
  });

  it('Returns a 200 when an admin user make the request with a valid user ID. User lisings are deleted', async () => {
    // Create listings for this user
    await createListings(user!.id);

    // Expectations before request to delete user
    expect(user!.status).toBe(AccountStatus.Active);
    let listings = await Listing.find({ owner: user!.id });
    expect(listings.length).toBe(3); // get active and inactive listings

    // Make request to delete user
    const { body } = await request(app)
      .delete(singleUserRoute)
      .set('Cookie', adminCookie)
      .send()
      .expect(200);

    // Expectations
    expect(body.status).toBe(RequestStatus.Success);

    const updatedUser = await User.findOne({ email });
    expect(updatedUser!.status).toBe(AccountStatus.Inactive);
    expect(updatedUser!.tokens.length).toBe(0);
    expect(updatedUser!.updatedAt.getTime()).toBeGreaterThan(
      user!.updatedAt.getTime()
    );

    listings = await Listing.find({ owner: user!.id });
    expect(listings.length).toBe(0);
  });

  it('Returns a 401 when no user is logged in', async () => {
    makeRequestToProtectedRouteWithoutAuthentication(
      HTML_Methods.delete,
      singleUserRoute
    );
  });

  it('Returns a 403 when a non-admin user wants to delete other users data', async () => {
    const { body } = await request(app)
      .delete(singleUserRoute)
      .set('Cookie', userCookie)
      .send()
      .expect(403);

    expect(body.status).toBe(RequestStatus.Fail);
    expect(body.message).toBe(ErrMsg.AccessRestriction);
  });

  it('Returns a 400 when request is made with an invalid mongoose ID format', async () => {
    await request(app)
      .delete(`${ApiRoutes.UsersProtected}/someInvalidUserId`)
      .set('Cookie', adminCookie)
      .send()
      .expect(400);
  });

  it('Returns a 404 when request is made with a non-existing user ID', async () => {
    const { body } = await request(app)
      .delete(
        `${ApiRoutes.UsersProtected}/${mongoose.Types.ObjectId().toHexString()}`
      )
      .set('Cookie', adminCookie)
      .send()
      .expect(404);
    expect(body.message).toBe(ErrMsg.NoUserWithId);
  });
});

describe('PUBLIC: GET USER PROFILE', () => {
  it('Returns a 200 with user data only consists of name, location, photo, selling/sold items', async () => {
    const user = User.build({
      name,
      email,
      password,
      passwordConfirm,
      location,
    });
    await user.save();

    await createListings(user.id);

    const { body } = await request(app)
      .get(`${ApiRoutes.Users}/${user.id}`)
      .send()
      .expect(200);

    // User data should only consist of name, location
    expect(body.data.email).toBeUndefined();
    expect(body.data.role).toBeUndefined();
    expect(body.data.status).toBeUndefined();
    expect(body.data.name).toBe(name);
    expect(body.data.photo).toBeDefined();
    expect(body.data.location).toBeDefined();

    // Public user's listings should only show the active, and sold items
    expect(body.data.listings.length).toBe(2);
    expect(body.data.listings[0].id).toBe(listing0.id);
    expect(body.data.listings[1].id).toBe(listing1.id);
  });

  it('Returns a 400 when user ID is invalid mongoose ObjectId format', async () => {
    const { body } = await request(app)
      .get(`${ApiRoutes.Users}/someId`)
      .send()
      .expect(400);
    expect(body.message).toBe('Invalid _id: someId');
  });

  it('Returns a 404 when user ID does not exist', async () => {
    const { body } = await request(app)
      .get(`${ApiRoutes.Users}/${mongoose.Types.ObjectId().toHexString()}`)
      .send()
      .expect(404);
    expect(body.message).toBe(ErrMsg.NoUserWithId);
  });
});
