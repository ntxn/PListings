import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Listing, ListingDoc, User, UserDoc } from '../../models';
import {
  ApiRoutes,
  Categories,
  Subcategories,
  RequestStatus,
  ErrMsg,
  UserRole,
} from '../../../common';

const email = 'jdoe@g.io';
const adminEmail = 'admin@g.io';

const title = 'Portable bench';
const price = 40;
const photos = ['itemPhoto.png'];
const category = Categories.SportsAndOutdoors;
const subcategory = Subcategories[category]['Camping Gear'];
const coordinates = [-118.404188, 37.737706];
const listingProps = {
  title,
  price,
  photos,
  category,
  subcategory,
  coordinates,
};

const createListingRequest = async (
  cookie: string[],
  reqBody: { [field: string]: any },
  statusCode: number
) => {
  const { body } = await request(app)
    .post(ApiRoutes.Listings)
    .set('Cookie', cookie)
    .send(reqBody)
    .expect(statusCode);
  return body;
};

describe('LISTING CONTROLLER', () => {
  let userCookie: string[];
  let adminCookie: string[];
  let user: UserDoc | null;

  describe('CREATE A LISTING', () => {
    beforeEach(async () => {
      userCookie = await global.login(email);
      user = await User.findOne({ email });
    });

    it('Returns a 201 when the user is logged in and provide valid listing inputs', async () => {
      const body = await createListingRequest(userCookie, listingProps, 201);

      expect(body.status).toBe(RequestStatus.Success);
      expect(body.data.title).toBe(title);
      expect(body.data.price).toBe(price);
      expect(body.data.category).toBe(category);
      expect(body.data.location.coordinates).toEqual(coordinates);
      expect(body.data.location.type).toBe('Point');
      expect(body.data.owner).toBe(user!.id);
    });

    it('Returns a 401 when the user is not logged in', async () => {
      const { body } = await request(app)
        .post(ApiRoutes.Listings)
        .send(listingProps)
        .expect(401);

      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe(ErrMsg.Unauthenticated);
    });

    it('Returns a 400 ValidationError when the user does not provide all required inputs', async () => {
      let props = { ...listingProps };
      delete props.price;

      let body = await createListingRequest(userCookie, props, 400);
      expect(body.message).toBe(ErrMsg.ValidationError);
      expect(body.errors.price).toBe(ErrMsg.PriceRequired);

      props = { ...listingProps };
      delete props.photos;

      body = await createListingRequest(userCookie, props, 400);
      // expect(body.errors[0].message).toBe(ErrMsg.PhotosRequired);
    });

    it('Returns a 400 ValidationError when the user provide invalid inputs', async () => {
      let body = await createListingRequest(
        userCookie,
        { ...listingProps, category: Categories.Entertainment },
        400
      );

      expect(body.errors.subcategory).toBe(ErrMsg.SubcategoryNotInCategory);

      body = await createListingRequest(
        userCookie,
        { ...listingProps, subcategory: 'non-existing subcategory' },
        400
      );
      expect(body.errors.subcategory).toBe(ErrMsg.SubcategoryNotInCategory);
    });
  });

  describe('GET ONE LISTING', () => {
    it('Returns a 200 when providing an existing Listing ID, number of visits increments by 1 when request does not come from owner', async () => {
      // Users logs in
      userCookie = await global.login(email);
      user = await User.findOne({ email });

      // Create a listing with the current user
      const body = await createListingRequest(userCookie, listingProps, 201);

      expect(body.data.visits).toBe(0);

      // Make request to view listing (no user is logged in)
      let response = await request(app)
        .get(`${ApiRoutes.Listings}/${body.data.id}`)
        .send()
        .expect(200);

      expect(response.body.status).toBe(RequestStatus.Success);
      expect(response.body.data.id).toBe(body.data.id);
      expect(response.body.data.title).toBe(title);
      expect(response.body.data.owner.id).toBe(user!.id);
      expect(response.body.data.visits).toBe(1);

      // Get listing while logged in as the listing's owner, number of visits does not change
      response = await request(app)
        .get(`${ApiRoutes.Listings}/${body.data.id}`)
        .set('Cookie', userCookie)
        .send()
        .expect(200);
      expect(response.body.data.visits).toBe(1);

      // Get listing while logged in as another user, number of visits increments by 1
      adminCookie = await global.login(adminEmail);
      response = await request(app)
        .get(`${ApiRoutes.Listings}/${body.data.id}`)
        .set('Cookie', adminCookie)
        .send()
        .expect(200);
      expect(response.body.data.visits).toBe(2);
    });

    it('Returns a 404 when providing a non-existing listing ID', async () => {
      const { body } = await request(app)
        .get(`${ApiRoutes.Listings}/${mongoose.Types.ObjectId().toHexString()}`)
        .send()
        .expect(404);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe(ErrMsg.NoDocWithId);
    });

    it('Returns a 400 when providing an invalid mongoose objectId for listing ID', async () => {
      const { body } = await request(app)
        .get(`${ApiRoutes.Listings}/invalidId`)
        .send()
        .expect(400);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe('Invalid _id: invalidId');
    });
  });

  describe('DELETE ONE LISTING', () => {
    let userListing: ListingDoc, adminListing: ListingDoc;

    beforeEach(async () => {
      userCookie = await global.login(email);
      adminCookie = await global.login(adminEmail);

      const userReq = await createListingRequest(userCookie, listingProps, 201);
      const adReq = await createListingRequest(adminCookie, listingProps, 201);
      userListing = userReq.data;
      adminListing = adReq.data;
    });

    it('Returns a 200 when the current logged in user delete their own listing', async () => {
      const { body } = await request(app)
        .delete(`${ApiRoutes.Listings}/${userListing.id}`)
        .set('Cookie', userCookie)
        .send()
        .expect(200);
      expect(body.status).toBe(RequestStatus.Success);
    });

    it('Returns a 401 when user is not logged in', async () => {
      const { body } = await request(app)
        .delete(`${ApiRoutes.Listings}/${userListing.id}`)
        .send()
        .expect(401);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe(ErrMsg.Unauthenticated);
    });

    it('Returns a 404 when the listing ID does not exist', async () => {
      const { body } = await request(app)
        .delete(
          `${ApiRoutes.Listings}/${mongoose.Types.ObjectId().toHexString()}`
        )
        .set('Cookie', userCookie)
        .send()
        .expect(404);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe(ErrMsg.NoDocWithId);
    });

    it('Returns a 400 when the listing ID is in invalid format of mongoose ObjectId', async () => {
      const { body } = await request(app)
        .delete(`${ApiRoutes.Listings}/invalidId`)
        .set('Cookie', userCookie)
        .send()
        .expect(400);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe('Invalid _id: invalidId');
    });

    it('Returns a 401 when the user deletes a listing of another user', async () => {
      const { body } = await request(app)
        .delete(`${ApiRoutes.Listings}/${adminListing.id}`)
        .set('Cookie', userCookie)
        .send()
        .expect(401);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe(
        ErrMsg.UnauthorizedToMadeChangesToOtherUsersListings
      );
    });
  });

  describe('UPDATE A LISTING', () => {
    let userListing: ListingDoc;

    beforeEach(async () => {
      userCookie = await global.login(email);
      adminCookie = await global.login(adminEmail);

      const userReq = await createListingRequest(userCookie, listingProps, 201);
      userListing = userReq.data;
    });

    it('Returns 200 when user is logged in and provide valid input', async () => {
      await request(app)
        .patch(`${ApiRoutes.Listings}/${userListing.id}`)
        .set('Cookie', userCookie)
        .send({ title: 'Laptop', price: 21 })
        .expect(200);

      const listing = await Listing.findById(userListing.id);
      expect(listing!.title).toBe('Laptop');
      expect(listing!.price).toBe(21);
    });

    it('Returns a 400 when user provides invalid input', async () => {
      let response = await request(app)
        .patch(`${ApiRoutes.Listings}/${userListing.id}`)
        .set('Cookie', userCookie)
        .send({ category: Categories.Garden })
        .expect(400);
      expect(response.body.message).toBe(ErrMsg.ValidationError);
      expect(response.body.errors.subcategory).toBe(
        ErrMsg.SubcategoryNotInCategory
      );

      let listing = await Listing.findById(userListing.id);
      expect(listing!.category).toBe(category);

      response = await request(app)
        .patch(`${ApiRoutes.Listings}/${userListing.id}`)
        .set('Cookie', userCookie)
        .send({ subcategory: Subcategories.Tools['Hand Tools'] })
        .expect(400);

      expect(response.body.errors.subcategory).toBe(
        ErrMsg.SubcategoryNotInCategory
      );

      listing = await Listing.findById(userListing.id);
      expect(listing!.subcategory).toBe(subcategory);
    });

    it('Returns a 401 when user is not logged in', async () => {
      const { body } = await request(app)
        .patch(`${ApiRoutes.Listings}/${userListing.id}`)
        .send({ title: 'Laptop', price: 21 })
        .expect(401);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe(ErrMsg.Unauthenticated);
    });

    it('Returns a 404 when listing ID does not exist', async () => {
      const { body } = await request(app)
        .patch(
          `${ApiRoutes.Listings}/${mongoose.Types.ObjectId().toHexString()}`
        )
        .set('Cookie', userCookie)
        .send({ title: 'Laptop', price: 21 })
        .expect(404);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe(ErrMsg.NoDocWithId);
    });

    it('Returns a 400 when listing ID is invalid format of mongoose ObjectId', async () => {
      const { body } = await request(app)
        .patch(`${ApiRoutes.Listings}/invalidId`)
        .set('Cookie', userCookie)
        .send()
        .expect(400);
      expect(body.status).toBe(RequestStatus.Fail);
      expect(body.message).toBe('Invalid _id: invalidId');
    });

    it('Returns a 401 when user updates a listing belonged to another user', async () => {
      const { body } = await request(app)
        .patch(`${ApiRoutes.Listings}/${userListing.id}`)
        .set('Cookie', adminCookie)
        .send({ title: 'Laptop', price: 21 })
        .expect(401);
      expect(body.message).toBe(
        ErrMsg.UnauthorizedToMadeChangesToOtherUsersListings
      );
    });
  });

  describe('GET ALL LISTINGS', () => {
    let firstListing: ListingDoc;

    beforeEach(async () => {
      userCookie = await global.login(email);
      adminCookie = await global.login(adminEmail);

      // create 3 listings for userCookie
      await createListingRequest(userCookie, listingProps, 201);
      await createListingRequest(
        userCookie,
        { ...listingProps, price: 4 },
        201
      );
      await createListingRequest(
        userCookie,
        { ...listingProps, price: 35 },
        201
      );

      // create 3 listings for adminCookie, 1 will be inactive
      let body = await createListingRequest(userCookie, listingProps, 201);
      const inactiveListing = await Listing.findById(body.data.id);
      inactiveListing!.active = false;
      await inactiveListing!.save();

      await createListingRequest(
        adminCookie,
        { ...listingProps, category: Categories.Vehicles, subcategory: 'Car' },
        201
      );

      body = await createListingRequest(
        adminCookie,
        { ...listingProps, category: Categories.Vehicles, subcategory: 'Boat' },
        201
      );
      firstListing = body.data;
    });

    it('Returns a 200 with 5 active listings, and most recent listing first (default sorting)', async () => {
      const { body } = await request(app)
        .get(ApiRoutes.Listings)
        .send()
        .expect(200);
      expect(body.length).toBe(5);
      expect(body.data[0].id).toBe(firstListing.id);
    });

    it('Returns a 200 with 2 listings when filtering by price less then $40 and order by price ascendingly', async () => {
      const { body } = await request(app)
        .get(`${ApiRoutes.Listings}?price[lt]=40&sort=price`)
        .send()
        .expect(200);
      expect(body.length).toBe(2);
      expect(body.data[0].price).toBe(4);
      expect(body.data[1].price).toBe(35);
    });

    it('Returns a 200 with 2 listings when filtering by category vehicles', async () => {
      const { body } = await request(app)
        .get(`${ApiRoutes.Listings}?category=Vehicles`)
        .send()
        .expect(200);
      expect(body.length).toBe(2);
      expect(body.data[0].id).toBe(firstListing.id);
      expect(body.data[1].subcategory).toBe('Car');
    });
  });

  describe('ADMIN: DELETE ONE LISTING', () => {
    let listing: ListingDoc | null;

    beforeEach(async () => {
      userCookie = await global.login(email);
      adminCookie = await global.login(adminEmail);
      const admin = await User.findOne({ email: adminEmail });
      admin!.role = UserRole.Admin;
      await admin!.save({ validateBeforeSave: false });

      const body = await createListingRequest(userCookie, listingProps, 201);
      listing = body.data;
    });

    it('Returns a 200 when logged in as an admin and listing ID exists', async () => {
      const { body } = await request(app)
        .delete(`${ApiRoutes.ListingProtected}/${listing!.id}`)
        .set('Cookie', adminCookie)
        .send()
        .expect(200);
      expect(body.status).toBe(RequestStatus.Success);

      listing = await Listing.findById(listing!.id);
      expect(listing).toBeNull();
    });

    it('Returns a 403 when the current user is not an admin', async () => {
      const { body } = await request(app)
        .delete(`${ApiRoutes.ListingProtected}/${listing!.id}`)
        .set('Cookie', userCookie)
        .send()
        .expect(403);
      expect(body.message).toBe(ErrMsg.AccessRestriction);
    });

    it('Returns a 404 when the listing ID does not exist', async () => {
      const { body } = await request(app)
        .delete(
          `${
            ApiRoutes.ListingProtected
          }/${mongoose.Types.ObjectId().toHexString()}`
        )
        .set('Cookie', adminCookie)
        .send()
        .expect(404);
      expect(body.message).toBe(ErrMsg.NoDocWithId);
    });

    it('Returns a 400 when listing ID is invalid format of mongoose ObjectId', async () => {
      const { body } = await request(app)
        .delete(`${ApiRoutes.ListingProtected}/invalidId`)
        .set('Cookie', adminCookie)
        .send()
        .expect(400);
      expect(body.message).toBe('Invalid _id: invalidId');
    });
  });
});
