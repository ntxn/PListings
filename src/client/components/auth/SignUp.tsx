import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { SignUpForm } from '../forms';
import { signUp, logOut } from '../../actions';
import { StoreState, SignUpAttrs, formFieldValues } from '../../utilities';
import { UserDoc } from '../../../server/models';
import { Authenticated } from './Authenticated';

interface StateProps {
  user: UserDoc | null;
}

interface DispatchProps {
  signUp(formValues: SignUpAttrs): void;
  logOut(nextRoute?: string): void;
}

type SignUpProps = StateProps & DispatchProps;

const _SignUp = (props: SignUpProps): JSX.Element => {
  const onSubmit = (formValues: SignUpAttrs) => props.signUp(formValues);
  const { name, email, password, passwordConfirm } = formFieldValues;
  const formFields = [name, email, password, passwordConfirm];

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
            <h2 className="heading-primary">Create Your Account</h2>
          </div>
          <SignUpForm
            onSubmit={onSubmit}
            formFields={formFields}
            submitBtnText="Sign Up"
          />
          <div className="u-center-text u-margin-top-small">
            <Link
              to="/auth/forgot-password"
              className="btn-text btn-text--grey"
            >
              Forgot password?
            </Link>
          </div>
          <div className="u-center-text u-margin-bottom-medium">
            <Link to="/auth/login" className="btn-text btn-text--orange">
              Already have an account?
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

export const SignUp = connect(mapStateToProps, { signUp, logOut })(_SignUp);
