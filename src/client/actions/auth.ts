import axios from 'axios';
import { Dispatch } from 'redux';
import { SubmissionError } from 'redux-form';
import { history } from '../history';
import {
  ActionTypes,
  FetchCurrentUserAction,
  SignUpAction,
  LogInAction,
  LogOutAction,
  StoreState,
} from '../utilities';
import { UserAttrs } from '../../server/models';
import { ApiRoutes } from '../../common';

export const fetchCurrentUser = () => {
  return async (dispatch: Dispatch): Promise<void> => {
    const { data } = await axios.get(ApiRoutes.CurrentUser);

    dispatch<FetchCurrentUserAction>({
      type: ActionTypes.fetchCurrentUser,
      payload: data.data,
    });
  };
};

export const signUp = (formValues: UserAttrs) => {
  return async (
    dispatch: Dispatch,
    getState: () => StoreState
  ): Promise<void> => {
    try {
      const { data } = await axios.post(ApiRoutes.SignUp, {
        ...formValues,
        location: getState().location,
      });

      dispatch<SignUpAction>({
        type: ActionTypes.signUp,
        payload: data.data,
      });

      history.push('/');
    } catch (err) {
      const { data } = err.response;
      if (data.errors) throw new SubmissionError(data.errors);

      throw new SubmissionError({ _error: data.message });
    }
  };
};

export const logIn = (formValue: { email: string; password: string }) => {
  return async (dispatch: Dispatch): Promise<void> => {
    try {
      const { data } = await axios.post(ApiRoutes.LogIn, formValue);

      dispatch<LogInAction>({
        type: ActionTypes.logIn,
        payload: data.data,
      });

      history.push('/');
    } catch (err) {
      const { data } = err.response;
      if (data.errors) throw new SubmissionError(data.errors);

      throw new SubmissionError({ _error: data.message });
    }
  };
};

export const logOut = () => {
  return async (dispatch: Dispatch): Promise<void> => {
    await axios.get(ApiRoutes.LogOut);

    dispatch<LogOutAction>({
      type: ActionTypes.logOut,
      payload: null,
    });

    history.push('/');
  };
};
