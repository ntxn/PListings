import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { logIn, logOut } from '../../actions';
import { LogInForm } from '../forms';
import { LogInAttrs, formFieldValues } from '../../utilities';

interface LogInProps {
  logIn(formValue: LogInAttrs, nextRoute?: string): void;
  logOut(nextRoute?: string): void;
  location: { state?: { from?: string } };
}

const _LogIn = (props: LogInProps): JSX.Element => {
  const nextRoute = props.location.state
    ? props.location.state.from
    : undefined;
  const onSubmit = (formValue: LogInAttrs) => props.logIn(formValue, nextRoute);
  const formFields = [formFieldValues.email, formFieldValues.password];

  return (
    <div className="container__form">
      <div className="u-center-text u-margin-bottom-medium">
        <h2 className="heading-primary">Log In</h2>
      </div>
      <LogInForm
        onSubmit={onSubmit}
        formFields={formFields}
        submitBtnText="Log In"
      />
      <div className="u-center-text u-margin-top-small u-margin-bottom-medium">
        <Link to="/auth/signup" className="btn-text btn-text--orange">
          Don&apos;t have an account?
        </Link>
      </div>
    </div>
  );
};

export const LogIn = connect(null, { logIn, logOut })(_LogIn);
