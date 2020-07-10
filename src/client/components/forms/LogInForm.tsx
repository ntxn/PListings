import { reduxForm } from 'redux-form';

import { Form } from './Form';
import { ErrMsg } from '../../../common';
import { FormProps, LogInAttrs } from '../../utilities';

export const LogInForm = reduxForm<LogInAttrs, FormProps<LogInAttrs>>({
  form: 'logInForm',
  validate: ({ email, password }: LogInAttrs) => {
    const errors = {
      email: ErrMsg.EmailRequired,
      password: ErrMsg.PasswordRequired,
    };

    if (email) delete errors.email;
    if (password) delete errors.password;

    return errors;
  },
})(Form);
