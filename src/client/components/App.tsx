import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { history } from '../history';
import { fetchCurrentUser, getLocationByIP } from '../actions';
import { Header } from './Header';
import { Footer } from './Footer';
import { NotFound } from './NotFound';
import { About } from './About';
import { withAuth, SignUp, LogIn } from './auth';
import { AccountSettings, UserListings, Profile } from './user';
import {
  NewListing,
  EditListing,
  Listings,
  Listing,
  withLoadingListing,
} from './listings';
import { Messenger } from './messages';

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
              <Route
                path="/auth/SignUp"
                exact
                component={withAuth(SignUp, true)}
              />
              <Route
                path="/auth/LogIn"
                exact
                component={withAuth(LogIn, true)}
              />
              <Route path="/messages" exact component={withAuth(Messenger)} />
              <Route
                path="/messages/:id"
                exact
                component={withAuth(Messenger)}
              />
              <Route
                path="/user/listings"
                exact
                component={withAuth(UserListings)}
              />
              <Route
                path="/user/account-settings"
                exact
                component={withAuth(AccountSettings)}
              />
              <Route path="/user/profile/:id" exact component={Profile} />
              <Route path="/listings" exact component={Listings} />
              <Route
                path="/listings/create"
                exact
                component={withAuth(NewListing)}
              />
              <Route
                path="/listings/edit/:id"
                exact
                component={withLoadingListing(withAuth(EditListing))}
              />
              <Route
                path="/listings/:id"
                exact
                component={withLoadingListing(Listing)}
              />
              <Route path="/about" exact component={About} />
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
