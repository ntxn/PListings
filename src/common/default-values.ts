import { GeoLocation, MyListings, MyListingsTypes } from './interfaces';

export const DEFAULT_LOCATION: GeoLocation = {
  coordinates: [-122.437598, 37.757591], // [longitude, latitude]
  zip: '94114',
  city: 'San Francisco',
  state: 'CA',
  country: 'United States',
};

export const DEFAULT_MY_LISTINGS: MyListings = {
  [MyListingsTypes.Selling]: [],
  [MyListingsTypes.Expired]: [],
  [MyListingsTypes.Sold]: [],
  [MyListingsTypes.Saved]: [],
};
