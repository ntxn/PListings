import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { authReducer } from './auth';
import { locationReducer } from './location';
import { StoreState } from '../utilities';

export const reducers = combineReducers<StoreState>({
  user: authReducer,
  form: formReducer,
  location: locationReducer,
});
