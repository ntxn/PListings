import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { AuthRequired } from '../AuthRequired';
import { StoreState } from '../../utilities';
import { Loader } from '../Modal';
import { ListingCardPublic, ListingCardPrivate } from '../ListingCard';
import {
  MyListingsTypes,
  DEFAULT_MY_LISTINGS,
  UserDoc,
  ApiRoutes,
} from '../../../common';

interface UserListingsProps {
  user: UserDoc | null;
}

const _UserListings = (props: UserListingsProps): JSX.Element => {
  useEffect(() => {
    setShowLoader(true);
    const fetchListings = async () => {
      const { data } = await axios.get(ApiRoutes.MyListings);
      if (data) setListings(data.data);
      setShowLoader(false);
    };

    fetchListings();
  }, []);

  const [activeListingType, setActiveListingType] = useState(
    MyListingsTypes.Selling
  );
  const [listings, setListings] = useState(DEFAULT_MY_LISTINGS);
  const [showLoader, setShowLoader] = useState(false);

  const onClickNavItemWithId = (id: string): void => {
    const currentlyActive = document.querySelector(
      '.user-listings__nav__item--active'
    );
    currentlyActive!.classList.remove('user-listings__nav__item--active');

    const nextActive = document.getElementById(id);
    nextActive!.classList.add('user-listings__nav__item--active');
  };

  const renderListings = (): JSX.Element => {
    return (
      <>
        {listings[activeListingType].map(listing => {
          return (
            <ListingCardPrivate
              key={listing.id}
              listing={listing}
              btnText="hello"
              btnAction={() => console.log(listing.id)}
            />
          );
        })}
      </>
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <div className="user-listings">
        <h2 className="user-listings__header heading-primary">My Listings</h2>
        <div className="user-listings__nav sub-heading-tertiary">
          <span
            className="user-listings__nav__item user-listings__nav__item--active"
            id="user-listings--selling"
            onClick={() => {
              onClickNavItemWithId('user-listings--selling');
              setActiveListingType(MyListingsTypes.Selling);
            }}
          >
            Selling
          </span>
          <span
            className="user-listings__nav__item"
            id="user-listings--saved"
            onClick={() => {
              onClickNavItemWithId('user-listings--saved');
              setActiveListingType(MyListingsTypes.Saved);
            }}
          >
            Saved
          </span>
          <span
            className="user-listings__nav__item"
            id="user-listings--expired"
            onClick={() => {
              onClickNavItemWithId('user-listings--expired');
              setActiveListingType(MyListingsTypes.Expired);
            }}
          >
            Expired
          </span>
          <span
            className="user-listings__nav__item"
            id="user-listings--sold"
            onClick={() => {
              onClickNavItemWithId('user-listings--sold');
              setActiveListingType(MyListingsTypes.Sold);
            }}
          >
            Sold
          </span>
        </div>
        <div className="user-listings__content listings">
          {renderListings()}
        </div>
      </div>
    );
  };

  return (
    <>
      {props.user ? renderContent() : <AuthRequired route="Your listings" />}
      {showLoader && <Loader />}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user };
};

export const UserListings = connect(mapStateToProps)(_UserListings);
