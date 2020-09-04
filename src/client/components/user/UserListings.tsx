import React from 'react';
import { connect } from 'react-redux';

import { AuthRequired } from '../AuthRequired';
import { StoreState } from '../../utilities';
import { UserDoc } from '../../../server/models';

interface UserListingsProps {
  user: UserDoc | null;
}

const _UserListings = (props: UserListingsProps): JSX.Element => {
  const onClickNavItemWithId = (id: string): void => {
    const currentlyActive = document.querySelector(
      '.user-listings__nav__item--active'
    );
    currentlyActive!.classList.remove('user-listings__nav__item--active');

    const nextActive = document.getElementById(id);
    nextActive!.classList.add('user-listings__nav__item--active');
  };

  const renderContent = (): JSX.Element => {
    return (
      <div className="user-listings">
        <h2 className="user-listings__header heading-primary">My Listings</h2>
        <div className="user-listings__nav sub-heading-tertiary">
          <span
            className="user-listings__nav__item user-listings__nav__item--active"
            id="user-listings--selling"
            onClick={() => onClickNavItemWithId('user-listings--selling')}
          >
            Selling
          </span>
          <span
            className="user-listings__nav__item"
            id="user-listings--saved"
            onClick={() => onClickNavItemWithId('user-listings--saved')}
          >
            Saved
          </span>
          <span
            className="user-listings__nav__item"
            id="user-listings--expired"
            onClick={() => onClickNavItemWithId('user-listings--expired')}
          >
            Expired
          </span>
          <span
            className="user-listings__nav__item"
            id="user-listings--sold"
            onClick={() => onClickNavItemWithId('user-listings--sold')}
          >
            Sold
          </span>
        </div>
        <div className="user-listings__content listings"></div>
      </div>
    );
  };

  return (
    <>{props.user ? renderContent() : <AuthRequired route="Your listings" />}</>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user };
};

export const UserListings = connect(mapStateToProps)(_UserListings);
