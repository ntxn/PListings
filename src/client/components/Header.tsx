import React from 'react';
import { Link } from 'react-router-dom';

export const Header = (): JSX.Element => {
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
        <div className="header__nav">
          <Link to="/users/login" className="btn">
            Log In
          </Link>
          <Link to="/users/signup" className="btn">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};
