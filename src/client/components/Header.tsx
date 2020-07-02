import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { UserDoc } from '../../server/models';
import { StoreState } from '../reducers';
import { logOut } from '../actions';

interface HeaderProps {
  user: UserDoc | null;
  logOut(): void;
}

const _Header = (props: HeaderProps): JSX.Element => {
  const renderNav = props.user ? (
    <div className="header__nav">
      <Link to="/users/login" className="btn">
        Sell
      </Link>
      <button className="btn" onClick={props.logOut}>
        Log Out
      </button>
    </div>
  ) : (
    <div className="header__nav">
      <Link to="/users/login" className="btn btn--border">
        Log In
      </Link>
      <Link to="/users/signup" className="btn btn--filled">
        Sign Up
      </Link>
    </div>
  );

  return (
    <header>
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
