import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = (): JSX.Element => {
  return (
    <footer className="container__center-content-horizontally">
      <div className="footer">
        <div className="footer__logo">
          <Link to="/">
            <img src="/img/logo/logo-white.png" alt="plistings logo in white" />
          </Link>
        </div>
        <div className="footer__navigation">
          <Link to="/about">About plistings</Link>
        </div>
      </div>
    </footer>
  );
};
