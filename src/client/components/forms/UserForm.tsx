import React from 'react';
import {
  Field,
  WrappedFieldProps,
  reduxForm,
  InjectedFormProps,
} from 'redux-form';
import { UserAttrs } from '../../../server/models';
import { ErrMsg } from '../../../common';

interface UserFormProps {
  onSubmit(formValues: UserAttrs): void;
  formFields: {
    name: string;
    type: string;
    required: boolean;
    placeholder?: string;
    label: string;
  }[];
}

interface FieldCustomProps {
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
}

class _UserForm extends React.Component<
  InjectedFormProps<UserAttrs, UserFormProps> & UserFormProps
> {
  renderInput: React.StatelessComponent<
    WrappedFieldProps & FieldCustomProps
  > = ({ input, type, meta, label, placeholder, required }): JSX.Element => {
    const err = meta.error && meta.touched;
    const inputClassName = `form__input ${err ? 'form__input--error' : ''}`;
    return (
      <div className="form__group">
        <label className="form__label" htmlFor={input.name}>
          {label}
        </label>
        <input
          className={inputClassName}
          type={type}
          id={input.name}
          placeholder={placeholder}
          required={required}
          {...input}
        />
        <div className="form__error">{err ? meta.error : null}</div>
      </div>
    );
  };

  onSubmit = (formValues: UserAttrs) => this.props.onSubmit(formValues);

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
        <div className="form__btn">
          <button
            type="submit"
            disabled={invalid || submitting}
            className="btn btn--filled"
          >
            Submit
          </button>
        </div>
      </form>
    );
  }
}

const validate = ({ name, email, password, passwordConfirm }: UserAttrs) => {
  const errors = {
    name: ErrMsg.NameRequired,
    email: ErrMsg.EmailRequired,
    password: ErrMsg.PasswordRequired,
    passwordConfirm: ErrMsg.PasswordConfirmRequired,
  };

  if (name) delete errors.name;
  if (email) delete errors.email;
  if (password) delete errors.password;
  if (passwordConfirm) delete errors.passwordConfirm;
  if (password && passwordConfirm && password !== passwordConfirm)
    errors.passwordConfirm = ErrMsg.PasswordConfirmNotMatch;

  return errors;
};

export const UserForm = reduxForm<UserAttrs, UserFormProps>({
  form: 'userForm',
  validate,
})(_UserForm);
