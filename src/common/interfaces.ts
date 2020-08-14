export interface BaseLocation {
  zip: string;
  city: string;
  state: string;
}

export interface GeoLocation extends BaseLocation {
  coordinates: [number, number];
  country: string;
}
