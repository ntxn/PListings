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
      <div className="wrapper">
        <Header />
        <main>
          <div className="main">
            <Switch>
              <Route path="/" exact component={Listings} />
              <Route path="/users/SignUp" exact component={SignUp} />
              <Route path="/users/LogIn" exact component={LogIn} />
            </Switch>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export const App = connect(null, { fetchCurrentUser })(_App);
