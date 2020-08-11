import mongoose from 'mongoose';
import { QueryFeatures } from '../query-features';
import { Listing, ListingDoc } from '../../models';
import { Categories, GeoLocation, DEFAULT_LOCATION } from '../../../common';

// Create 10 listings to Listing collection

const createListing = async (
  price: number,
  category: string,
  subcategory: string,
  location: GeoLocation
) => {
  const listing = Listing.build({
    title: 'Portable bench',
    photos: ['itemPhoto.png'],
    owner: mongoose.Types.ObjectId(),
    price,
    category,
    subcategory,
    location,
  });
  await listing.save();
};

const create8Listings = async () => {
  // Categories: 3 Electronics, 2 entertainments, 2 tools, 1 baby
  // Subcategory: 2 phones, 1 of everything else
  // Price: 4 < $20, 2 > $200,
  // Phone and price: 1 < $200

  await createListing(35, Categories.Tools, 'Power Tools', DEFAULT_LOCATION);
  await createListing(14, Categories.Tools, 'Hand Tools', DEFAULT_LOCATION);
  await createListing(4, Categories.BabyAndKids, 'Toys', DEFAULT_LOCATION);
  await createListing(120, Categories.Electronics, 'Phones', DEFAULT_LOCATION);
  await createListing(15, Categories.Entertainment, 'Movies', DEFAULT_LOCATION);
  await createListing(3, Categories.Entertainment, 'Books', DEFAULT_LOCATION);
  await createListing(354, Categories.Electronics, 'Cameras', DEFAULT_LOCATION);
  await createListing(279, Categories.Electronics, 'Phones', DEFAULT_LOCATION);
};

describe('TEST QUERY FEATURES ON LISTING COLLECTION', () => {
  describe('FILTERING', () => {
    let filter: (
      reqQueryObj: any,
      expectedResultLength: number
    ) => Promise<void>;

    beforeEach(async () => {
      await create8Listings();
      filter = async (reqQueryObj, expectedResultLength) => {
        const query = new QueryFeatures(Listing.find({}), reqQueryObj).filter();
        const docs = await query.query;
        expect(docs.length).toBe(expectedResultLength);
      };
    });

    it('Returns the right number of items for each category', async () => {
      await filter({ category: 'Electronics' }, 3);
      await filter({ category: 'Entertainment' }, 2);
      await filter({ category: 'Baby & Kids' }, 1);
    });

    it('Returns 2 items for phones, and 1 for other subcategories', async () => {
      await filter({ subcategory: 'Phones' }, 2);
      await filter({ subcategory: 'Cameras' }, 1);
      await filter({ subcategory: 'Hand Tools' }, 1);
    });

    it('Returns 4 items for price less than $20 and 2 items for price greater than $200', async () => {
      await filter({ price: { lt: '20' } }, 4);
      await filter({ price: { gte: '200' } }, 2);
    });

    it('Returns 1 item for a phone under $200', async () => {
      await filter({ price: { lt: '200' }, subcategory: 'Phones' }, 1);
    });

    it.todo('Filter by location');
  });

  describe('SORTING', () => {
    let sort: (
      reqQueryObj: { sort: string },
      expectedResultValue: number
    ) => Promise<void>;

    beforeEach(async () => {
      await create8Listings();
      sort = async (reqQueryObj, expectedResultValue) => {
        const query = new QueryFeatures(Listing.find({}), reqQueryObj).sort();
        const docs = await query.query;
        expect(docs[0].price).toBe(expectedResultValue);
      };
    });

    it('Returns the lowest price first when sorting by price ascendingly', async () => {
      await sort({ sort: 'price' }, 3);
    });

    it('Returns the highest price first when sorting by price descendingly', async () => {
      await sort({ sort: '-price' }, 354);
    });

    it.todo('Sort by location');

    it.todo('Sort by price and location');
  });

  describe('FIELDS SELECTING', () => {
    let select: (
      reqQueryObj: { fields: string },
      presentFields: string[],
      absentFields: string[]
    ) => Promise<void>;

    beforeEach(async () => {
      await create8Listings();
      select = async (reqQueryObj, presentFields, absentFields) => {
        const query = new QueryFeatures(
          Listing.find({}),
          reqQueryObj
        ).selectFields();
        const docs = await query.query;

        presentFields.forEach(field => expect(docs[0][field]).toBeDefined());
        absentFields.forEach(field => expect(docs[0][field]).toBeUndefined());
      };
    });

    it('Returns results with only title and price (for listing, owner is default to be selected)', async () => {
      await select(
        { fields: 'title,price' },
        ['title', 'price'],
        ['photos', 'category']
      );
    });

    it('Returns only title, price, and specifically exclude owner', async () => {
      await select(
        { fields: 'title,price,-owner' },
        ['title', 'price'],
        ['photos', 'category', 'owner']
      );
    });

    it('Returns all but category, subcategory', async () => {
      await select(
        { fields: '-category,-subcategory' },
        ['title', 'price', 'photos', 'owner'],
        ['category', 'subcategory']
      );
    });
  });

  describe('PAGINATION', () => {
    let paginate: (
      reqQueryObj: { limit: string; page: string },
      expectedResultLength: number
    ) => Promise<ListingDoc[]>;
    let listings: ListingDoc[];

    beforeEach(async () => {
      await create8Listings();
      listings = await Listing.find({});

      paginate = async (reqQueryObj, expectedResultLength) => {
        const query = new QueryFeatures(
          Listing.find({}),
          reqQueryObj
        ).paginate();
        const docs = await query.query;

        expect(docs.length).toBe(expectedResultLength);
        return docs;
      };
    });

    it('Returns 3 items which would be from index 3 to 5 of listings array', async () => {
      const docs = await paginate({ limit: '3', page: '2' }, 3);
      expect(listings[3].id).toBe(docs[0].id);
    });

    it('Returns 2 items from the last page, listings index 6, 7', async () => {
      const docs = await paginate({ limit: '3', page: '3' }, 2);
      expect(listings[6].id).toBe(docs[0].id);
      expect(listings[7].id).toBe(docs[1].id);
    });
  });
});
