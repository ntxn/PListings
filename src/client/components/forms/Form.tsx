import React from 'react';
import { Field, InjectedFormProps } from 'redux-form';

import { FormProps, renderTextInput } from '../../utilities';

/**
 * A generic Form to render input text.
 * It is used with reduxForm to store form values in Redux Store
 */
export class Form<Attrs> extends React.Component<
  InjectedFormProps<Attrs, FormProps<Attrs>> & FormProps<Attrs>
> {
  onSubmit = (formValues: Attrs): void => this.props.onSubmit(formValues);

  render() {
    const { handleSubmit, formFields, invalid, submitting, error } = this.props;

    return (
      <form onSubmit={handleSubmit(this.onSubmit)} className="form">
        <input type="submit" disabled style={{ display: 'none' }} />
        {formFields.map(field => (
          <Field key={field.name} component={renderTextInput} {...field} />
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
