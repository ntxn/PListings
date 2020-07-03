import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { history } from '../history';
import { fetchCurrentUser } from '../actions';
import { Header } from './Header';
import { Footer } from './Footer';
import { Listings } from './Listings';
import { SignUp, LogIn } from './auth';

interface AppProps {
  fetchCurrentUser(): Promise<void>;
}

const _App = (props: AppProps): JSX.Element => {
  useEffect(() => {
    props.fetchCurrentUser();
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
            </Switch>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export const App = connect(null, { fetchCurrentUser })(_App);
