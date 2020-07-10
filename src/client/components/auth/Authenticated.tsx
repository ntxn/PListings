import React from 'react';

interface AuthenticatedProps {
  userName: string;
  logout(): void;
}

export const Authenticated = (props: AuthenticatedProps): JSX.Element => {
  return (
    <div>
      <div>{`You are logged in as ${props.userName}`}</div>
      <div>
        <span>Not you? Log out to sign up or log in as another user</span>
        <button className="btn btn--filled" onClick={props.logout}>
          Log Out
        </button>
      </div>
    </div>
  );
};
