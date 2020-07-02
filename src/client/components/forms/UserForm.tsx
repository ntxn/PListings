import React from 'react';
import {
  Field,
  WrappedFieldProps,
  WrappedFieldMetaProps,
  reduxForm,
  InjectedFormProps,
} from 'redux-form';
import { UserAttrs } from '../../../server/models';
import { ErrMsg } from '../../../common';

interface UserFormProps {
  onSubmit(formValues: UserAttrs): void;
  formFields: { name: string; label: string; type: string }[];
}

interface FieldCustomProps {
  label: string;
  type: string;
}

class _UserForm extends React.Component<
  InjectedFormProps<UserAttrs, UserFormProps> & UserFormProps
> {
  renderError = ({ error, touched }: WrappedFieldMetaProps) => {
    if (error && touched) return <div style={{ color: 'red' }}>{error}</div>;
  };

  renderInput: React.StatelessComponent<
    WrappedFieldProps & FieldCustomProps
  > = ({ input, meta, label, type }): JSX.Element => {
    return (
      <div>
        <label>{label}</label>
        <input autoComplete="off" type={type} {...input} />
        {this.renderError(meta)}
      </div>
    );
  };

  onSubmit = (formValues: UserAttrs) => this.props.onSubmit(formValues);

  render() {
    const {
      handleSubmit,
      formFields,
      pristine,
      submitting,
      error,
    } = this.props;

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        {formFields.map(field => (
          <Field key={field.name} component={this.renderInput} {...field} />
        ))}
        <div>{error ? error : null}</div>
        <button type="submit" disabled={pristine || submitting}>
          Submit
        </button>
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
