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
    case ActionTypes.editListing:
      return action.payload;
    default:
      return state;
  }
};
