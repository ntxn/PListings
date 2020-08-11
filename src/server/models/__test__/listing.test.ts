import mongoose from 'mongoose';
import { Listing, ListingAttrs, ListingDoc } from '../listing';
import { User, UserDoc } from '../user';
import {
  Categories,
  Subcategories,
  ErrMsg,
  DEFAULT_LOCATION,
} from '../../../common';

// Create a user
const name = 'Will Smith';
const email = 'wsmith@g.io';
const password = 'password';
const passwordConfirm = 'password';
let user: UserDoc | null;

const title = 'Portable bench';
const price = 40;
const photos = ['itemPhoto.png'];
const category = Categories.SportsAndOutdoors;
const subcategory = Subcategories[category]['Camping Gear']!;
const location = DEFAULT_LOCATION;
let attrs: ListingAttrs;
let listing: ListingDoc;

describe('LISTING MODEL', () => {
  beforeEach(async () => {
    user = User.build({ name, email, password, passwordConfirm, location });
    await user!.save();

    const owner = user!.id;
    attrs = { title, price, photos, category, subcategory, location, owner };
  });

  describe('Create a Listing instance with valid inputs', () => {
    it('Saves all required values and added other properties to the newly created listing', async () => {
      listing = Listing.build(attrs);
      await listing.save();

      expect(listing.id).toBeDefined();
      expect(listing.title).toBe(title);
      expect(listing.createdAt).toBeDefined();
      expect(listing.active).toBe(true);
      expect(listing.sold).toBe(false);
      expect(listing.visits).toBe(0);
      expect(listing.favorites).toBe(0);

      const newListing = await Listing.findById(listing.id);
      expect(newListing!.owner.name).toBe(name);
      expect(newListing!.owner.id).toBe(user!.id);
    });
  });

  describe('Create a Listing instance with invalid inputs', () => {
    it('Throws an error when all required fields are empty', async () => {
      // @ts-ignore
      listing = Listing.build({});
      await expect(listing.save()).rejects.toThrow();
    });

    it('Throws an error when provide empty arrays to the required fields', async () => {
      listing = Listing.build({ ...attrs, photos: [] });
      await expect(listing.save()).rejects.toThrowError(ErrMsg.PhotosLength);

      listing = Listing.build({
        ...attrs,
        location: { ...location, coordinates: [] },
      });
      await expect(listing.save()).rejects.toThrowError(
        ErrMsg.LocationCoorsLength
      );
    });

    it('Throws an error when provide over the maximum number of elements in an array for required fields', async () => {
      listing = Listing.build({
        ...attrs,
        photos: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
      });
      await expect(listing.save()).rejects.toThrowError(ErrMsg.PhotosLength);

      listing = Listing.build({
        ...attrs,
        location: { ...location, coordinates: [1, 2, 3] },
      });
      await expect(listing.save()).rejects.toThrowError(
        ErrMsg.LocationCoorsLength
      );
    });

    it('Throws an error when subcategory value is not a member of the main category', async () => {
      listing = Listing.build({ ...attrs, subcategory: 'does not exist' });
      await expect(listing.save()).rejects.toThrowError(
        ErrMsg.SubcategoryNotInCategory
      );

      listing = Listing.build({ ...attrs, category: Categories.Garden });
      await expect(listing.save()).rejects.toThrowError(
        ErrMsg.SubcategoryNotInCategory
      );
    });

    it('Throws an error when providing invalid userID format for mongoose ObjectId', async () => {
      // @ts-ignore
      listing = Listing.build({ ...attrs, owner: 'invalidIdFormat' });
      await expect(listing.save()).rejects.toThrowError(
        'Cast to ObjectId failed for value "invalidIdFormat" at path "owner"'
      );
    });

    it('Populates a listing with owner value is null when user with the provided ID does not exist', async () => {
      listing = Listing.build({ ...attrs, owner: mongoose.Types.ObjectId() });
      await listing.save();

      const newListing = await Listing.findById(listing.id);
      expect(newListing!.owner).toBeNull();
    });
  });
});
