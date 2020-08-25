import { Dispatch } from 'redux';

import { isSameLocation } from './location';
import { StoreState, CombinedLocation } from './interfaces';
import { ErrMsg } from '../../common';

/**
 * An async validator to check if the location input is valid.
 * Location input validator has to be asynchorous because we don't
 * query for locations on every keystroke, but waiting for the
 * user to stop typing before running a query.
 */
export const asyncValidatorDispatcher = (
  formValues: any,
  selectedLocation: CombinedLocation
): ((dispatch: Dispatch, getState: () => StoreState) => Promise<any>) => (
  dispatch,
  getState
) => {
  // If the location input value is a string representation of the currently
  // chosen location object (which is store in this class state object),
  // then restore the location value to be that object because we submit an
  // object to the db, not a string.
  if (
    typeof formValues.location === 'string' &&
    isSameLocation(formValues.location, selectedLocation)
  )
    formValues.location = selectedLocation;

  if (typeof formValues.location === 'object')
    return Promise.resolve(formValues);

  const error = { location: ErrMsg.LocationDropdownListSelection };

  if (getState!().searchedLocations.length === 0)
    error.location = ErrMsg.LocationInvalid;

  return Promise.reject(error);
};
