import { Action, ActionTypes } from '../utilities';
import { UserDoc } from '../../server/models';

export const authReducer = (
  state: UserDoc | null = null,
  action: Action
): UserDoc | null => {
  switch (action.type) {
    case ActionTypes.fetchCurrentUser:
      return action.payload;
    case ActionTypes.signUp:
      return action.payload;
    case ActionTypes.logIn:
      return action.payload;
    case ActionTypes.logOut:
      return action.payload;
    case ActionTypes.updatePassword:
      return action.payload;
    case ActionTypes.updateProfile:
      return action.payload;
    default:
      return state;
  }
};
