import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FaBell } from 'react-icons/fa';
import { UserDoc } from '../../server/models';
import { StoreState, UserAvatar } from '../utilities';
import { logOut } from '../actions';
import { UserMenuModal } from './Modal';

interface HeaderProps {
  user: UserDoc | null;
  logOut(): void;
}

const renderNavigationAuthenticated = (
  props: HeaderProps,
  userMenuModal: boolean,
  setUserMenuModal: (status: boolean) => void
) => {
  return (
    <>
      <Link to="/listings/create" className="btn btn--filled">
        Sell
      </Link>
      <div className="icon">
        <FaBell title="Notifications" />
      </div>
      <UserAvatar
        onClick={() => setUserMenuModal(true)}
        user={props.user!}
        className="icon"
      />
      {userMenuModal && (
        <UserMenuModal
          user={props.user!}
          closeUserMenu={() => setUserMenuModal(false)}
          logout={props.logOut}
        />
      )}
    </>
  );
};

const renderNavigationUnauthenticated = () => {
  return (
    <>
      <Link to="/auth/login" className="btn btn--filled">
        Sell
      </Link>
      <Link to="/auth/login" className="btn btn--outline">
        Log In
      </Link>
    </>
  );
};

const _Header = (props: HeaderProps): JSX.Element => {
  const [userMenuModal, setUserMenuModal] = useState(false);

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
        <div className="header__nav">
          {props.user
            ? renderNavigationAuthenticated(
                props,
                userMenuModal,
                setUserMenuModal
              )
            : renderNavigationUnauthenticated()}
        </div>
      </div>
    </header>
  );
};

const mapStateToProps = (state: StoreState): { user: UserDoc | null } => {
  return { user: state.user };
};

export const Header = connect(mapStateToProps, { logOut })(_Header);
