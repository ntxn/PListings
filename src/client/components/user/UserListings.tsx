import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { AuthRequired } from '../AuthRequired';
import { StoreState, calcDistanceBetweenTwoPoints } from '../../utilities';
import { Loader } from '../Modal';
import { ListingCardPublic, ListingCardPrivate } from '../ListingCard';
import {
  MyListingsTypes,
  DEFAULT_MY_LISTINGS,
  UserDoc,
  ApiRoutes,
} from '../../../common';
import { showAlert, AlertType } from '../alert';

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

  const removeListing = (index: number, listingType: MyListingsTypes): void => {
    setListings({
      ...listings,
      [listingType]: listings[listingType].filter((l, i) => i !== index),
    });
  };

  const markAsSold = async (index: number): Promise<void> => {
    try {
      const selling = listings[MyListingsTypes.Selling];

      const { data } = await axios.patch(
        `${ApiRoutes.ListingMarkedAsSold}/${selling[index].id}`
      );

      setListings({
        ...listings,
        [MyListingsTypes.Selling]: selling.filter((l, i) => i !== index),
        [MyListingsTypes.Sold]: [data.data, ...listings[MyListingsTypes.Sold]],
      });
    } catch (err) {
      showAlert(
        AlertType.Error,
        'Having issue with marking this listing as sold. Please try again later.'
      );
      console.log(err);
    }
  };

  const renderListings = (): JSX.Element => {
    let element: JSX.Element[] = [];

    switch (activeListingType) {
      case MyListingsTypes.Saved:
        element = listings[MyListingsTypes.Saved].map(listing => {
          const [lng2, lat2] = listing.location.coordinates;
          const [lng1, lat1] = props.user!.location.coordinates;
          return (
            <ListingCardPublic
              key={listing.id}
              listing={listing}
              saved
              distanceDiff={calcDistanceBetweenTwoPoints(
                lat1,
                lng1,
                lat2,
                lng2
              )}
            />
          );
        });
        break;
      case MyListingsTypes.Selling:
        element = listings[MyListingsTypes.Selling].map((listing, i) => {
          return (
            <ListingCardPrivate
              key={listing.id}
              listing={listing}
              onDelete={() => removeListing(i, MyListingsTypes.Selling)}
              btnText="Mark as Sold"
              btnAction={() => markAsSold(i)}
              showEditBtn
            />
          );
        });
        break;
      case MyListingsTypes.Expired:
        element = listings[MyListingsTypes.Expired].map((listing, i) => {
          return (
            <ListingCardPrivate
              key={listing.id}
              listing={listing}
              onDelete={() => removeListing(i, MyListingsTypes.Expired)}
              btnText="Renew Listing"
              btnAction={() => console.log('renewed')}
            />
          );
        });
        break;
      case MyListingsTypes.Sold:
        element = listings[MyListingsTypes.Sold].map((listing, i) => {
          return (
            <ListingCardPrivate
              key={listing.id}
              listing={listing}
              onDelete={() => removeListing(i, MyListingsTypes.Sold)}
              btnText="Sell Item Again"
              btnAction={() => console.log('sell again')}
            />
          );
        });
        break;
    }

    return <>{element}</>;
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
