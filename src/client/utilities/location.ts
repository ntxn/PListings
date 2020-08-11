import { BaseLocation } from '../../common';
import { CombinedLocation } from './interfaces';

/**
 * Create a string representation of a location object
 * @param location Location object that has 3 fields: city, state, zip
 */
export const getLocationStr = (location: BaseLocation): string =>
  `${location.city}, ${location.state} ${location.zip}`;

/**
 * Compares if value is the string representation of the location object
 */
export const isSameLocation = (
  value: string,
  location: BaseLocation
): boolean => value === getLocationStr(location);

/**
 *
 */
export const processCombinedLocationToGeoLocation = (formValues: {
  location: CombinedLocation;
}): void => {
  const { location } = formValues;

  formValues.location = {
    coordinates: location.coordinates || [
      location.longitude!,
      location.latitude!,
    ],
    zip: location.zip,
    city: location.city,
    state: location.state,
    country: 'United States',
  };
};
