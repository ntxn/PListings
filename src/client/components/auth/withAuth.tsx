import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { history } from '../../history';
import { UserDoc } from '../../../common';
import { StoreState } from '../../utilities';

export const withAuth = (Component: any, noAuthRequired?: boolean) => {
  interface AuthenticateProps {
    user: UserDoc | null;
    location: { pathname: string };
  }

  const Authenticate = (props: AuthenticateProps): JSX.Element => {
    const [showContent, setShowContent] = useState(false);
    const [authenticationTimer, setAuthenticationTimer] = useState<
      NodeJS.Timeout
    >();

    useEffect(() => {
      if (authenticationTimer) clearTimeout(authenticationTimer);
      setAuthenticationTimer(
        setTimeout(() => {
          if (noAuthRequired) {
            if (props.user) history.push('/');
            else setShowContent(true);
          } else {
            const location = {
              pathname: '/auth/login',
              state: { from: props.location.pathname },
            };
            if (props.user) setShowContent(true);
            else history.push(location);
          }
        }, 500)
      );

      return () => {
        if (authenticationTimer) clearTimeout(authenticationTimer);
      };
    }, [props.user]);

    return <>{showContent && <Component {...props} />}</>;
  };

  const mapStateToProps = (state: StoreState) => {
    return { user: state.user };
  };

  return connect(mapStateToProps)(Authenticate);
};
