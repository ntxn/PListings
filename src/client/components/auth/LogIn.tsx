import React from 'react';
import { connect } from 'react-redux';
import { logIn } from '../../actions';
import { UserForm } from '../forms';

interface LogInProps {
  logIn(formValue: { email: string; password: string }): void;
}

const _LogIn = (props: LogInProps): JSX.Element => {
  const onSubmit = (formValue: { email: string; password: string }) =>
    props.logIn(formValue);
  const formFields = [
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'password', type: 'password', label: 'Password' },
  ];

  return (
    <>
      <h1>Log In</h1>
      <UserForm onSubmit={onSubmit} formFields={formFields} />
    </>
  );
};

export const LogIn = connect(null, { logIn })(_LogIn);
