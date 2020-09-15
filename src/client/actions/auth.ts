import axios from 'axios';
import { Dispatch } from 'redux';
import { reset } from 'redux-form';

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
  SetDefaultFiltersAction,
  FunctionalAction,
  processCombinedLocationToGeoLocation,
  processFormValuesToFormData,
  StoreState,
  setupDefaultSocket,
} from '../utilities';
import { ApiRoutes, UserAttrs, UserDoc } from '../../common';
import { AlertType, showAlert } from '.././components/alert';
import { fetchChatrooms, clearChatrooms } from './chatroom';
import { clearListings, clearSavedListingIds } from './listing';

export const fetchCurrentUser = () => async (
  dispatch: Dispatch,
  getState: () => StoreState
): Promise<void> => {
  const response = await axios.get(ApiRoutes.CurrentUser);
  const user = response.data.data as UserDoc;

  dispatch<FetchCurrentUserAction>({
    type: ActionTypes.fetchCurrentUser,
    payload: user,
  });

  if (user) {
    setupDefaultSocket(dispatch, user, getState().sockets);
    await fetchChatrooms(dispatch, user);
  }
};

export const signUp = (formValues: UserAttrs): FunctionalAction<SignUpAction> =>
  catchSubmissionError(async (dispatch, getState) => {
    const { data } = await axios.post(ApiRoutes.SignUp, {
      ...formValues,
      location: getState!().currentLocation,
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
}): ((dispatch: Dispatch, getState: () => StoreState) => Promise<void>) =>
  catchSubmissionError(async (dispatch, getState) => {
    const { data } = await axios.post(ApiRoutes.LogIn, formValue);

    dispatch<LogInAction>({
      type: ActionTypes.logIn,
      payload: data.data,
    });

    setupDefaultSocket(dispatch, data.data, getState!().sockets);
    await fetchChatrooms(dispatch, data.data);

    showAlert(AlertType.Success, 'Logged in successfully');
    history.push('/');
  });

export const logOut = (nextRoute = '/') => async (
  dispatch: Dispatch,
  getState: () => StoreState
): Promise<void> => {
  await axios.get(ApiRoutes.LogOut);

  dispatch<LogOutAction>({
    type: ActionTypes.logOut,
    payload: null,
  });

  dispatch<SetDefaultFiltersAction>({
    type: ActionTypes.setDefaultFilters,
    payload: getState!().currentLocation,
  });

  dispatch(clearChatrooms());
  dispatch(clearSavedListingIds());
  dispatch(clearListings());
};

export const updatePassword = (
  formValue: UpdatePasswordAttrs
): FunctionalAction<UpdatePasswordAction> =>
  catchSubmissionError(async dispatch => {
    const { data } = await axios.patch(ApiRoutes.UpdateMyPassword, formValue);

    dispatch({
      type: ActionTypes.updatePassword,
      payload: data.data,
    });

    showAlert(AlertType.Success, 'Password updated successfully');
    //@ts-ignore
    dispatch(reset('updatePasswordForm'));
  });

export const updateProfile = (
  formValues: UpdateProfileAttrs
): FunctionalAction<UpdateProfileAction> =>
  catchSubmissionError(async dispatch => {
    processCombinedLocationToGeoLocation(formValues);

    let response;

    if (!formValues.photo)
      response = await axios.patch(ApiRoutes.UpdateMyAccount, formValues);
    else {
      formValues.photo = formValues.photo[0];

      const formData = new FormData();
      processFormValuesToFormData(formValues, formData);

      response = await axios.patch(ApiRoutes.UpdateMyAccount, formData);
    }

    dispatch({
      type: ActionTypes.updateProfile,
      payload: response!.data.data,
    });

    history.replace('/user/account-settings');
    showAlert(AlertType.Success, 'Account updated successfully');
  });
