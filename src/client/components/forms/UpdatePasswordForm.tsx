import { reduxForm } from 'redux-form';

import { Form } from './Form';
import { ErrMsg } from '../../../common';
import { FormProps, UpdatePasswordAttrs } from '../../utilities';

export const UpdatePasswordForm = reduxForm<
  UpdatePasswordAttrs,
  FormProps<UpdatePasswordAttrs>
>({
  form: 'updatePasswordForm',
  validate: ({
    currentPassword,
    password,
    passwordConfirm,
  }: UpdatePasswordAttrs) => {
    const errors = {
      currentPassword: ErrMsg.PasswordCurrentRequired,
      password: ErrMsg.PasswordNewRequired,
      passwordConfirm: ErrMsg.PasswordNewConfirmRequired,
    };

    if (currentPassword) delete errors.currentPassword;
    if (password) delete errors.password;
    if (passwordConfirm) delete errors.passwordConfirm;
    if (password && passwordConfirm && password !== passwordConfirm)
      errors.passwordConfirm = ErrMsg.PasswordConfirmNotMatch;

    return errors;
  },
})(Form);
