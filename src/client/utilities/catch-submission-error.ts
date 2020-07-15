import { SubmissionError } from 'redux-form';
import { Action } from 'redux';
import { FunctionalAction } from './interfaces';

export const catchSubmissionError = <A extends Action>(
  callback: FunctionalAction<A>
): FunctionalAction<A> => (dispatch, getState): Promise<void> =>
  callback(dispatch, getState).catch(err => {
    const errors = err.errors || err.response.data.errors;
    if (errors) throw new SubmissionError(errors);

    throw new SubmissionError({ _error: err.response.data.message });
  });
