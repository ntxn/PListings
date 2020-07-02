import React from 'react';
import { connect } from 'react-redux';
import { UserForm } from '../forms';
import { UserAttrs } from '../../../server/models';
import { signUp } from '../../actions';

interface SignUpProps {
  signUp(formValues: UserAttrs): void;
}

const _SignUp = (props: SignUpProps): JSX.Element => {
  const onSubmit = (formValues: UserAttrs) => props.signUp(formValues);
  const formFields = [
    { name: 'name', label: 'Full name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'passwordConfirm', label: 'Confirm Password', type: 'password' },
  ];

  return (
    <>
      <h1>Create an Account</h1>
      <UserForm onSubmit={onSubmit} formFields={formFields} />
    </>
  );
};

export const SignUp = connect(null, { signUp })(_SignUp);
