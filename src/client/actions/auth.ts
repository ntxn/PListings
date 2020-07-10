import axios from 'axios';
import { history } from '../history';
import {
  ActionTypes,
  catchSubmissionError,
  FetchCurrentUserAction,
  SignUpAction,
  LogInAction,
  LogOutAction,
  UpdateProfileAction,
  UpdateProfileAttrs,
  UpdatePasswordAction,
  UpdatePasswordAttrs,
  FunctionalAction,
} from '../utilities';
import { UserAttrs } from '../../server/models';
import { ApiRoutes } from '../../common';

export const fetchCurrentUser = (): FunctionalAction<
  FetchCurrentUserAction
> => async dispatch => {
  const { data } = await axios.get(ApiRoutes.CurrentUser);

  dispatch({
    type: ActionTypes.fetchCurrentUser,
    payload: data.data,
  });
};

export const signUp = (formValues: UserAttrs): FunctionalAction<SignUpAction> =>
  catchSubmissionError(async (dispatch, getState) => {
    const { data } = await axios.post(ApiRoutes.SignUp, {
      ...formValues,
      location: getState!().location,
    });

    dispatch({
      type: ActionTypes.signUp,
      payload: data.data,
    });

    history.push('/');
  });

export const logIn = (formValue: {
  email: string;
  password: string;
}): FunctionalAction<LogInAction> =>
  catchSubmissionError(async dispatch => {
    const { data } = await axios.post(ApiRoutes.LogIn, formValue);

    dispatch({
      type: ActionTypes.logIn,
      payload: data.data,
    });

    history.push('/');
  });

export const logOut = (nextRoute = '/'): FunctionalAction<LogOutAction> => {
  return async dispatch => {
    await axios.get(ApiRoutes.LogOut);

    dispatch({
      type: ActionTypes.logOut,
      payload: null,
    });

    history.push(nextRoute);
  };
};

export const updatePassword = (
  formValue: UpdatePasswordAttrs
): FunctionalAction<UpdatePasswordAction> =>
  catchSubmissionError(async dispatch => {
    const { data } = await axios.post(ApiRoutes.UpdateMyPassword, formValue);

    dispatch({
      type: ActionTypes.updatePassword,
      payload: data.data,
    });
  });

export const updateProfile = (
  formValue: UpdateProfileAttrs
): FunctionalAction<UpdateProfileAction> =>
  catchSubmissionError(async dispatch => {
    const { data } = await axios.post(ApiRoutes.UpdateMyAccount, formValue);

    dispatch({
      type: ActionTypes.updateProfile,
      payload: data.data,
    });
  });
