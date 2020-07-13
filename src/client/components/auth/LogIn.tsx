import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logIn, logOut } from '../../actions';
import { LogInForm } from '../forms';
import { StoreState, LogInAttrs, formFieldValues } from '../../utilities';
import { UserDoc } from '../../../server/models';
import { Authenticated } from './Authenticated';

interface StateProps {
  user: UserDoc | null;
}

interface DispatchProps {
  logIn(formValue: LogInAttrs): void;
  logOut(nextRoute?: string): void;
}

type LogInProps = StateProps & DispatchProps;

const _LogIn = (props: LogInProps): JSX.Element => {
  const onSubmit = (formValue: LogInAttrs) => props.logIn(formValue);
  const { email, password } = formFieldValues;
  const formFields = [email, password];

  return (
    <>
      {props.user ? (
        <Authenticated
          userName={props.user.name}
          logout={() => props.logOut('/auth/login')}
        />
      ) : (
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
      )}
    </>
  );
};

const mapStateToProps = (state: StoreState): StateProps => {
  return { user: state.user };
};

export const LogIn = connect(mapStateToProps, { logIn, logOut })(_LogIn);
