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
    const reduxStore = getState();
    setupDefaultSocket(dispatch, user, reduxStore.sockets);
    await fetchChatrooms(dispatch, reduxStore, user);
  }
};

export const signUp = (
  formValues: UserAttrs,
  nextRoute = '/'
): FunctionalAction<SignUpAction> =>
  catchSubmissionError(async (dispatch, getState) => {
    const { data } = await axios.post(ApiRoutes.SignUp, {
      ...formValues,
      location: getState!().currentLocation,
    });

    history.push(nextRoute);

    dispatch({
      type: ActionTypes.signUp,
      payload: data.data,
    });
  });

export const logIn = (
  formValue: {
    email: string;
    password: string;
  },
  nextRoute = '/'
): ((dispatch: Dispatch, getState: () => StoreState) => Promise<void>) =>
  catchSubmissionError(async (dispatch, getState) => {
    const { data } = await axios.post(ApiRoutes.LogIn, formValue);

    history.push(nextRoute);

    dispatch<LogInAction>({
      type: ActionTypes.logIn,
      payload: data.data,
    });

    const reduxStore = getState!();
    setupDefaultSocket(dispatch, data.data, reduxStore.sockets);
    await fetchChatrooms(dispatch, reduxStore, data.data);

    showAlert(AlertType.Success, 'Logged in successfully');
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
