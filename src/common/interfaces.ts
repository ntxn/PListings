import { ListingDoc, ListingAttrs, UserDoc, UserAttrs } from '../server/models';

export interface BaseLocation {
  zip: string;
  city: string;
  state: string;
}

export interface GeoLocation extends BaseLocation {
  coordinates: [number, number];
  country: string;
}

export enum MessageStatus {
  Sent,
  Delivered,
  Seen,
}

export enum MyListingsTypes {
  Selling,
  Expired,
  Sold,
  Saved,
}

export interface MyListings {
  [MyListingsTypes.Selling]: ListingDoc[];
  [MyListingsTypes.Expired]: ListingDoc[];
  [MyListingsTypes.Sold]: ListingDoc[];
  [MyListingsTypes.Saved]: ListingDoc[];
}

export { ListingDoc, ListingAttrs, UserDoc, UserAttrs };
