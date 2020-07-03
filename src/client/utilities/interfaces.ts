import { ActionTypes } from './action-types';
import { UserDoc } from '../../server/models';
import { GeoLocation } from '../../common';
import { FormStateMap } from 'redux-form';

// Actions
export interface FetchCurrentUserAction {
  type: ActionTypes.fetchCurrentUser;
  payload: UserDoc | null;
}

export interface SignUpAction {
  type: ActionTypes.signUp;
  payload: UserDoc;
}

export interface LogInAction {
  type: ActionTypes.logIn;
  payload: UserDoc;
}

export interface LogOutAction {
  type: ActionTypes.logOut;
  payload: null;
}

export interface GetLocationWithPermissionAction {
  type: ActionTypes.getLocationWithPermission;
  payload: GeoLocation;
}

export interface GetLocationByIPAction {
  type: ActionTypes.getLocationByIP;
  payload: GeoLocation;
}

export type Action =
  | FetchCurrentUserAction
  | SignUpAction
  | LogOutAction
  | LogInAction
  | GetLocationWithPermissionAction
  | GetLocationByIPAction;

// Store State
export interface StoreState {
  user: UserDoc | null;
  form: FormStateMap;
  location: GeoLocation;
}
