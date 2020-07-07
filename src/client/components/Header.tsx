import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { UserDoc } from '../../server/models';
import { StoreState } from '../utilities';
import { logOut } from '../actions';
import { ConfirmationModal } from './Modal';

interface HeaderProps {
  user: UserDoc | null;
  logOut(): void;
}

const _Header = (props: HeaderProps): JSX.Element => {
  const [logoutModalSwitch, setLogoutModalSwitch] = useState(false);

  const renderNav = props.user ? (
    <div className="header__nav">
      <Link to="/auth/login" className="btn btn--filled">
        Sell
      </Link>
      <button
        className="btn btn--outline"
        onClick={() => setLogoutModalSwitch(true)}
      >
        Log Out
      </button>
      {logoutModalSwitch && (
        <ConfirmationModal
          title="Log Out"
          content="Are you sure you want to log out?"
          confirmBtnText="Log Out"
          action={props.logOut}
          setModalSwitch={setLogoutModalSwitch}
        />
      )}
    </div>
  ) : (
    <div className="header__nav">
      <Link to="/auth/login" className="btn btn--outline">
        Log In
      </Link>
      <Link to="/auth/signup" className="btn btn--filled">
        Sign Up
      </Link>
    </div>
  );

  return (
    <header className="container__center-content-horizontally">
      <div className="header">
        <div className="header__logo">
          <Link to="/">
            <img
              src="/img/logo/logo-orange.png"
              alt="plistings logo in orange"
            />
          </Link>
        </div>
        <div className="header__search-bar">Search bar</div>
        {renderNav}
      </div>
    </header>
  );
};

const mapStateToProps = (state: StoreState): { user: UserDoc | null } => {
  return { user: state.user };
};

export const Header = connect(mapStateToProps, { logOut })(_Header);
