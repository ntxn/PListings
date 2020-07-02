import { combineReducers } from 'redux';
import { reducer as formReducer, FormStateMap } from 'redux-form';
import { authReducer } from './auth';
import { UserDoc } from '../../server/models';

export interface StoreState {
  user: UserDoc | null;
  form: FormStateMap;
}

export const reducers = combineReducers<StoreState>({
  user: authReducer,
  form: formReducer,
});
