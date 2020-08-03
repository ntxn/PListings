import React from 'react';
import { WrappedFieldProps } from 'redux-form';

import { FieldProps } from './interfaces';

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
