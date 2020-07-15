import { GeoLocation, DEFAULT_LOCATION } from '../../common';
import { Action, ActionTypes, SearchedLocation } from '../utilities';

export const currentLocationReducer = (
  state: GeoLocation = DEFAULT_LOCATION,
  action: Action
): GeoLocation => {
  switch (action.type) {
    case ActionTypes.getLocationWithPermission:
      return action.payload;
    case ActionTypes.getLocationByIP:
      return action.payload;
    default:
      return state;
  }
};

export const searchLocationReducer = (
  state: SearchedLocation[] = [],
  action: Action
): SearchedLocation[] => {
  switch (action.type) {
    case ActionTypes.searchLocation:
      return [...action.payload];
    default:
      return state;
  }
};
