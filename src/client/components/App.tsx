import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';

import { history } from '../history';
import { Header } from './Header';
import { Footer } from './Footer';
import { Listings } from './Listings';
import { UserCreate } from './UserCreate';

export const App = (): JSX.Element => {
  return (
    <Router history={history}>
      <div className="wrapper">
        <Header />
        <main>
          <div className="main">
            <Switch>
              <Route path="/" exact component={Listings} />
              <Route path="/users/signup" exact component={UserCreate} />
            </Switch>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
};
