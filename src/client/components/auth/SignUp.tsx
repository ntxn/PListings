import React from 'react';
import { Link } from 'react-router-dom';
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
    {
      name: 'name',
      type: 'text',
      required: true,
      placeholder: 'Steve Johnson',
      label: 'Full name',
    },
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
    {
      name: 'passwordConfirm',
      type: 'password',
      required: true,
      placeholder: 'Confirm Password',
      label: 'Confirm Password',
    },
  ];

  return (
    <div className="container__form">
      <div className="u-center-text u-margin-bottom-medium">
        <h2 className="heading-secondary">Create Your Account</h2>
      </div>
      <UserForm onSubmit={onSubmit} formFields={formFields} />
      <div className="u-center-text u-margin-top-small">
        <Link to="/auth/forgot-password" className="btn-text btn-text--grey">
          Forgot password?
        </Link>
      </div>
      <div className="u-center-text u-margin-bottom-medium">
        <Link to="/auth/signup" className="btn-text btn-text--orange">
          Don&apos;t have an account?
        </Link>
      </div>
    </div>
  );
};

export const SignUp = connect(null, { signUp })(_SignUp);
