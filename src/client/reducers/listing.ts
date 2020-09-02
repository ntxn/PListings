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
    case ActionTypes.clearListings:
      return [];
    default:
      return state;
  }
};

export const savedListingsReducer = (
  state: Record<string, string> = {},
  action: Action
): Record<string, string> => {
  switch (action.type) {
    case ActionTypes.saveListing:
      return { ...state, [action.payload.id]: action.payload.id };
    case ActionTypes.unsaveListing:
      return { ...state, [action.payload.id]: undefined };
    case ActionTypes.fetchSavedListings:
      return { ...state, ...action.payload };
    case ActionTypes.clearSavedListings:
      return {};
    default:
      return state;
  }
};
