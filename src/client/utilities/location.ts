import { GeoLocation } from '../../common';

export const getLocationStr = (location: GeoLocation): string =>
  `${location.city}, ${location.state} ${location.zip}`;

export const isSameLocation = (
  value: string | Record<string, any>,
  location: GeoLocation
): boolean => typeof value === 'string' && value === getLocationStr(location);
