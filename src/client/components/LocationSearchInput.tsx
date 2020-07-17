import React from 'react';
import { Dispatch } from 'redux';
import { WrappedFieldProps } from 'redux-form';
import {
  UpdateProfileAttrs as Attrs,
  SearchedLocation,
  StoreState,
  isSameLocation,
  getLocationStr,
  LocationInputFieldProps,
} from '../utilities';
import { ErrMsg, GeoLocation } from '../../common';

export const renderLocations = (
  locations: SearchedLocation[],
  select: (location: SearchedLocation) => void
): JSX.Element => {
  return (
    <ul>
      {locations.map(location => (
        <li key={location.recordid} onClick={() => select(location)}>
          {location.fields.city}, {location.fields.state},{location.fields.zip}
        </li>
      ))}
    </ul>
  );
};

/***
 * render a text input field with autocomplete when user enters city or zipcode
 */
export const renderLocationInputField: React.StatelessComponent<
  WrappedFieldProps & LocationInputFieldProps
> = ({
  input: { value, name, onChange, ...inputProps },
  meta,
  addTimeout,
  ...props
}): JSX.Element => {
  const err = meta.error && meta.touched;
  const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;

  return (
    <div className="form__group">
      <label className="form__label" htmlFor={name}>
        {props.label}
      </label>
      <input
        {...inputProps}
        {...props}
        autoComplete="off"
        placeholder="Enter city or zip code"
        className={inputClassName}
        id={name}
        onChange={addTimeout(onChange)}
        value={typeof value === 'object' ? getLocationStr(value) : value}
      />
      <div className="form__error">{err ? meta.error : null}</div>
    </div>
  );
};

/**
 * An async validator to check if the location input is valid.
 * Location input validator has to be asynchorous because we don't
 * query for locations on every keystroke, but waiting for the
 * user to stop typing before running a query.
 */
export const asyncValidatorDispatcher = (
  formValues: Attrs,
  selectedLocation: GeoLocation
): ((dispatch: Dispatch, getState: () => StoreState) => Promise<Attrs>) => (
  dispatch,
  getState
) => {
  // If the location input value is a string representation of the currently
  // chosen location object (which is store in this class state object),
  // then restore the location value to be that object because we submit an
  // object to the db, not a string.
  if (isSameLocation(formValues.location, selectedLocation))
    formValues.location = selectedLocation;

  if (typeof formValues.location === 'string') {
    const error = { location: ErrMsg.LocationDropdownListSelection };

    if (getState!().searchedLocations.length === 0)
      error.location = ErrMsg.LocationInvalid;

    return Promise.reject(error);
  }

  return Promise.resolve(formValues);
};
