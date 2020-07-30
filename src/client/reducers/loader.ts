import { Action, ActionTypes } from '../utilities';

export const btnLoaderReducer = (state = false, action: Action): boolean => {
  switch (action.type) {
    case ActionTypes.setBtnLoader:
      return action.payload;
    default:
      return state;
  }
};
