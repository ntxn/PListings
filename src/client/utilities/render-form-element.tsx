import React from 'react';
import { WrappedFieldProps, InitializeAction } from 'redux-form';

import { FieldProps, CombinedLocation, FilterAttrs } from './interfaces';
import { isSameLocation } from './location';
import { BtnLoader } from '../components/Loader';

export const renderTextInput: React.StatelessComponent<
  WrappedFieldProps & FieldProps
> = ({ input, meta, ...props }): JSX.Element => {
  const err = meta.error && meta.touched;
  const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;
  return (
    <div className="form__group">
      <label className="form__label" htmlFor={input.name}>
        {props.label}
      </label>
      <input className={inputClassName} id={input.name} {...input} {...props} />
      <div className="form__error">{err ? meta.error : null}</div>
    </div>
  );
};

export const renderTextarea: React.StatelessComponent<
  WrappedFieldProps & FieldProps
> = ({ input, meta, ...props }): JSX.Element => {
  const err = meta.error && meta.touched;
  const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;
  const maxChars = 150;

  return (
    <div className="form__group">
      <label className="form__label" htmlFor={input.name}>
        {props.label}
      </label>
      <textarea
        {...input}
        maxLength={maxChars}
        className={inputClassName}
        id={input.name}
        placeholder={props.placeholder}
      />
      <div className="form__length">{`${input.value.length} / ${maxChars}`}</div>
      <div className="form__error">{err ? meta.error : null}</div>
    </div>
  );
};

/**
 * Render submit & reset buttons for forms that has a location input field
 */
export const renderBtns = (
  props: {
    invalid: boolean;
    submitting: boolean;
    pristine: boolean;
    locationValue: string | CombinedLocation;
    initialValues: { location?: CombinedLocation };
    btnLoading: boolean;
    reset(): void;
    searchLocation(term?: string): void;
  },
  submitBtnText: string,
  selectedLocation: CombinedLocation,
  resetToDefaultValues?: () => void
): JSX.Element => {
  const { invalid, submitting, pristine, locationValue } = props;

  const isInitialLocation =
    typeof locationValue === 'string' &&
    isSameLocation(locationValue, props.initialValues.location!);

  const validLocation =
    typeof locationValue === 'object' ||
    isSameLocation(locationValue, selectedLocation);

  return (
    <div className="form__btn form__btn--right">
      <button
        type="button"
        disabled={
          resetToDefaultValues
            ? false
            : pristine || submitting || isInitialLocation
        }
        className="btn btn--outline"
        onClick={() => {
          if (resetToDefaultValues) resetToDefaultValues();
          else props.reset();
          props.searchLocation();
        }}
      >
        Reset
      </button>

      {props.btnLoading ? (
        <BtnLoader />
      ) : (
        <button
          type="submit"
          className="btn btn--filled"
          disabled={
            pristine ||
            invalid ||
            submitting ||
            isInitialLocation ||
            !validLocation
          }
        >
          {submitBtnText}
        </button>
      )}
    </div>
  );
};

interface DropdownFieldProps {
  fieldName: string;
  options: string[];
  onChange?: () => void;
  emptyOptionAllowed?: boolean;
}

/**
 * Render dropdown list like category or subcategory
 */
export const renderDropdown: React.StatelessComponent<
  WrappedFieldProps & DropdownFieldProps
> = ({
  input,
  meta,
  fieldName,
  options,
  onChange,
  emptyOptionAllowed,
}): JSX.Element => {
  const err = meta.error && meta.touched;
  const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;

  const change = onChange
    ? () => {
        onChange();
        return input.onChange;
      }
    : input.onChange;

  return (
    <div className="form__group">
      <label htmlFor={fieldName} className="form__label">
        {`${fieldName[0].toUpperCase()}${fieldName.substring(1)}`}
      </label>
      <select
        {...input}
        name={fieldName}
        id={fieldName}
        onChange={change}
        className={inputClassName}
      >
        {emptyOptionAllowed && <option></option>}
        {options.map((value, index) => (
          <option value={value} key={index}>
            {value}
          </option>
        ))}
      </select>
      <div className="form__error">{err ? meta.error : null}</div>
    </div>
  );
};
