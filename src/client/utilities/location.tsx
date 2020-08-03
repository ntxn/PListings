import { BaseLocation } from '../../common';

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
