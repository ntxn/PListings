import { Action, ActionTypes } from '../utilities';
import { ListingDoc } from '../../server/models';

export const listingReducer = (
  state: ListingDoc | null = null,
  action: Action
): ListingDoc | null => {
  switch (action.type) {
    case ActionTypes.createListing:
      return action.payload;
    case ActionTypes.fetchListing:
      return action.payload;
    case ActionTypes.clearListing:
      return null;
    case ActionTypes.editListing:
      return action.payload;
    case ActionTypes.saveListing:
      return action.payload;
    case ActionTypes.unsaveListing:
      return action.payload;
    default:
      return state;
  }
};

export const listingsReducer = (
  state: ListingDoc[] = [],
  action: Action
): ListingDoc[] => {
  switch (action.type) {
    case ActionTypes.fetchListings:
      return action.payload;
    default:
      return state;
  }
};

export const listingSavedReducer = (state = false, action: Action): boolean => {
  switch (action.type) {
    case ActionTypes.saveListing:
      return true;
    case ActionTypes.unsaveListing:
      return false;
    default:
      return state;
  }
};
