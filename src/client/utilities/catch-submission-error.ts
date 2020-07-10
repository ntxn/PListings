import { SubmissionError } from 'redux-form';
import { Action } from 'redux';
import { FunctionalAction } from './interfaces';

export const catchSubmissionError = <A extends Action>(
  callback: FunctionalAction<A>
): FunctionalAction<A> => (dispatch, getState): Promise<void> =>
  callback(dispatch, getState).catch(err => {
    const { data } = err.response;
    if (data.errors) throw new SubmissionError(data.errors);

    throw new SubmissionError({ _error: data.message });
  });
