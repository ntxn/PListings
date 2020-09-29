import { SubmissionError } from 'redux-form';

import { AlertType, showAlert } from '../components/alert';
import { FunctionalAction } from './interfaces';

interface Params {
  msg?: string;
  clearLoader?(): void;
}

type AsyncFunction = (params?: Params) => Promise<void>;

/**
 * A util function to catch errors from an async/await function (usually for fetching data).
 * If there's an error, it'll show alert.
 * An optional message or clearLoader function can be included.
 */
export const catchAsync = (callback: AsyncFunction): AsyncFunction => (
  params?: Params
) =>
  callback().catch(err => {
    console.log(err.response.data);

    showAlert(
      AlertType.Error,
      params && params.msg ? params.msg : 'Issue with fetching data'
    );

    if (params && params.clearLoader) params.clearLoader();
  });

/***
 * A util function to catch errors for an async/await Action creator function that receives dispatch, getState as parameters
 */
export const catchAsyncAction = (
  callback: FunctionalAction
): FunctionalAction => (dispatch, getState) =>
  callback(dispatch, getState).catch(err => {
    const { data } = err.response;
    console.log(data);

    showAlert(AlertType.Error, data.message);
  });

/***
 * A util function to catch errors from Redux-Form submission for redux-form to pass these errors to the appropriate forms & fields
 */
export const catchSubmissionError = (
  callback: FunctionalAction
): FunctionalAction => (dispatch, getState) =>
  callback(dispatch, getState).catch(err => {
    const { errors } = err.response.data;
    if (errors) throw new SubmissionError(errors);

    throw new SubmissionError({ _error: err.response.data.message });
  });
