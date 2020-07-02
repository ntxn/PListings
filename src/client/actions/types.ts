import {
  FetchCurrentUserAction,
  SignUpAction,
  LogOutAction,
  LogInAction,
} from './auth';

export enum ActionTypes {
  fetchCurrentUser,
  signUp,
  logOut,
  logIn,
}

export type Action =
  | FetchCurrentUserAction
  | SignUpAction
  | LogOutAction
  | LogInAction;
