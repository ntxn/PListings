import { GeoLocation, DEFAULT_LOCATION } from '../../common';
import { Action, ActionTypes } from '../utilities';

export const locationReducer = (
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
