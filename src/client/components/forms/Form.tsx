import React from 'react';
import { Field, WrappedFieldProps, InjectedFormProps } from 'redux-form';

import { FormProps, CustomFormProps } from '../../utilities';

/**
 * A generic Form to render input text.
 * It is used with reduxForm to store form values in Redux Store
 */
export class Form<Attrs> extends React.Component<
  InjectedFormProps<Attrs, FormProps<Attrs>> & FormProps<Attrs>
> {
  renderInput: React.StatelessComponent<
    WrappedFieldProps & CustomFormProps
  > = ({ input, meta, ...props }): JSX.Element => {
    const err = meta.error && meta.touched;
    const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;
    return (
      <div className="form__group">
        <label className="form__label" htmlFor={input.name}>
          {props.label}
        </label>
        <input
          className={inputClassName}
          id={input.name}
          {...input}
          {...props}
        />
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  onSubmit = (formValues: Attrs): void => this.props.onSubmit(formValues);

  render() {
    const { handleSubmit, formFields, invalid, submitting, error } = this.props;

    return (
      <form onSubmit={handleSubmit(this.onSubmit)} className="form">
        {formFields.map(field => (
          <Field key={field.name} component={this.renderInput} {...field} />
        ))}
        <div className="form__error form__error-general">
          {error ? error : null}
        </div>
        <div
          className={`form__btn ${
            this.props.submitBtnText === 'Update Password'
              ? 'form__btn--right'
              : ''
          }`}
        >
          <button
            type="submit"
            disabled={invalid || submitting}
            className="btn btn--filled"
          >
            {this.props.submitBtnText}
          </button>
        </div>
      </form>
    );
  }
}
