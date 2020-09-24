import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { SignUpForm } from '../forms';
import { signUp, logOut } from '../../actions';
import { SignUpAttrs, formFieldValues } from '../../utilities';

interface SignUpProps {
  signUp(formValues: SignUpAttrs, nextRoute?: string): void;
  logOut(nextRoute?: string): void;
  location: { state?: { from?: string } };
}

const _SignUp = (props: SignUpProps): JSX.Element => {
  const nextRoute = props.location.state
    ? props.location.state.from
    : undefined;
  const onSubmit = (formValues: SignUpAttrs) =>
    props.signUp(formValues, nextRoute);
  const { name, email, password, passwordConfirm } = formFieldValues;
  const formFields = [name, email, password, passwordConfirm];

  return (
    <div className="container__form">
      <div className="u-center-text u-margin-bottom-medium">
        <h2 className="heading-primary">Create Your Account</h2>
      </div>
      <SignUpForm
        onSubmit={onSubmit}
        formFields={formFields}
        submitBtnText="Sign Up"
      />
      <div className="u-center-text u-margin-top-small">
        <Link to="/auth/forgot-password" className="btn-text btn-text--grey">
          Forgot password?
        </Link>
      </div>
      <div className="u-center-text u-margin-bottom-medium">
        <Link to="/auth/login" className="btn-text btn-text--orange">
          Already have an account?
        </Link>
      </div>
    </div>
  );
};

export const SignUp = connect(null, { signUp, logOut })(_SignUp);
