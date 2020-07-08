import React from 'react';
import { Link } from 'react-router-dom';
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
    {
      name: 'email',
      type: 'email',
      required: true,
      placeholder: 'steve@plistings.io',
      label: 'Email',
    },
    {
      name: 'password',
      type: 'password',
      required: true,
      placeholder: 'Password',
      label: 'Password',
    },
  ];

  return (
    <div className="container__form">
      <div className="u-center-text u-margin-bottom-medium">
        <h2 className="heading-primary">Log In</h2>
      </div>
      <UserForm onSubmit={onSubmit} formFields={formFields} />
      <div className="u-center-text u-margin-top-small u-margin-bottom-medium">
        <Link to="/auth/signup" className="btn-text btn-text--orange">
          Don&apos;t have an account?
        </Link>
      </div>
    </div>
  );
};

export const LogIn = connect(null, { logIn })(_LogIn);
