import React from 'react';
import { Link } from 'react-router-dom';

interface AuthenticateProps {
  route: string;
}

export const AuthRequired = (props: AuthenticateProps): JSX.Element => {
  return (
    <div>
      <h3>{`Please log in to access ${props.route}`}</h3>
      <Link to="/auth/login" className="btn btn--filled">
        Log In
      </Link>
    </div>
  );
};
