import { Dispatch, Action as ReduxAction } from 'redux';
import { FormStateMap } from 'redux-form';

import { ActionTypes } from './action-types';
import { UserDoc } from '../../server/models';
import { GeoLocation } from '../../common';

// ACTIONS

// auth
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

export interface UpdateProfileAction {
  type: ActionTypes.updateProfile;
  payload: UserDoc;
}

export interface UpdatePasswordAction {
  type: ActionTypes.updatePassword;
  payload: UserDoc;
}

// Location
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
  | UpdateProfileAction
  | UpdatePasswordAction
  | GetLocationWithPermissionAction
  | GetLocationByIPAction;

// Store State
export interface StoreState {
  user: UserDoc | null;
  form: FormStateMap;
  location: GeoLocation;
}

//
export type FunctionalAction<A extends ReduxAction> = (
  dispatch: Dispatch<A>,
  getState?: () => StoreState
) => Promise<void>;

// FORM
export interface CustomFormProps {
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}

interface FormFields extends CustomFormProps {
  name: string;
}

export interface FormProps<Attrs> {
  onSubmit(formValues: Attrs): void;
  formFields: FormFields[];
}

export interface LogInAttrs {
  email: string;
  password: string;
}

export interface SignUpAttrs {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface UpdatePasswordAttrs {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

export interface UpdateProfileAttrs {
  name: string;
  email: string;
  location: string;
  photo?: string;
  bio?: string;
}

// HTML ELEMENT
export interface EventWithTarget {
  target: HTMLInputElement;
}
