import { FilterAttrs, Action, ActionTypes } from '../utilities';
import { SortBy, PostedWithin, DEFAULT_LOCATION } from '../../common';

const DEFAULT_FILTERS: FilterAttrs = {
  sort: SortBy.NewestFirst,
  postedWithin: PostedWithin.AllListings,
  distance: '20',
  location: DEFAULT_LOCATION,
};

export const filtersReducer = (
  state: FilterAttrs = DEFAULT_FILTERS,
  action: Action
): FilterAttrs => {
  switch (action.type) {
    case ActionTypes.setDefaultFilters:
      return { ...state, location: action.payload };
    case ActionTypes.fetchCurrentUser:
      if (action.payload)
        return { ...state, location: action.payload.location };
      return state;
    case ActionTypes.signUp:
      return { ...state, location: action.payload.location };
    case ActionTypes.logIn:
      return { ...state, location: action.payload.location };
    case ActionTypes.updateProfile:
      return { ...state, location: action.payload.location };
    default:
      return state;
  }
};
