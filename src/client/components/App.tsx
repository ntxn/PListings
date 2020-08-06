import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { history } from '../history';
import { fetchCurrentUser, getLocationByIP } from '../actions';
import { Header } from './Header';
import { Footer } from './Footer';
import { NotFound } from './NotFound';
import { SignUp, LogIn } from './auth';
import { AccountSettings } from './user';
import { NewListing, Listings, Listing, EditListing } from './listings';

interface AppProps {
  fetchCurrentUser(): Promise<void>;
  getLocationByIP(): Promise<void>;
}

const _App = (props: AppProps): JSX.Element => {
  useEffect(() => {
    props.fetchCurrentUser();
    props.getLocationByIP();
  }, []);

  return (
    <Router history={history}>
      <div className="container__fit-min-content-to-viewport-height">
        <Header />
        <main className="container__center-content-horizontally">
          <div className="main">
            <Switch>
              <Route path="/" exact component={Listings} />
              <Route path="/auth/SignUp" exact component={SignUp} />
              <Route path="/auth/LogIn" exact component={LogIn} />
              <Route
                path="/user/account-settings"
                exact
                component={AccountSettings}
              />
              <Route path="/listings" exact component={Listings} />
              <Route path="/listings/create" exact component={NewListing} />
              <Route path="/listings/edit/:id" exact component={EditListing} />
              <Route path="/listings/:id" exact component={Listing} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export const App = connect(null, {
  fetchCurrentUser,
  getLocationByIP,
})(_App);
