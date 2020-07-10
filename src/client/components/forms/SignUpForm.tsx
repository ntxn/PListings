import { reduxForm } from 'redux-form';

import { Form } from './Form';
import { ErrMsg } from '../../../common';
import { FormProps, SignUpAttrs } from '../../utilities';

export const SignUpForm = reduxForm<SignUpAttrs, FormProps<SignUpAttrs>>({
  form: 'signUpForm',
  validate: ({ name, email, password, passwordConfirm }: SignUpAttrs) => {
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
  },
})(Form);
