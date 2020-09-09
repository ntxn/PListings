import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import { UserPageLayout, NavItem } from './UserPageLayout';
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

  const renewListing = async (
    index: number,
    listingType: MyListingsTypes
  ): Promise<void> => {
    try {
      const { data } = await axios.patch(
        `${ApiRoutes.ListingRenew}/${listings[listingType][index].id}`
      );

      setListings({
        ...listings,
        [listingType]: listings[listingType].filter((l, i) => i !== index),
        [MyListingsTypes.Selling]: [
          data.data,
          ...listings[MyListingsTypes.Selling],
        ],
      });
    } catch (err) {
      showAlert(
        AlertType.Error,
        'Having issue with renewing your listing. Please try again later.'
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
              clickable
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
              btnAction={() => renewListing(i, MyListingsTypes.Expired)}
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
              btnAction={() => renewListing(i, MyListingsTypes.Sold)}
            />
          );
        });
        break;
    }

    return <div className="listings">{element}</div>;
  };

  const renderHeader = (): JSX.Element => (
    <h2 className="heading-primary">My Listings</h2>
  );

  const navList: Record<MyListingsTypes, NavItem> = {
    [MyListingsTypes.Selling]: {
      name: 'Selling',
      onClick: () => setActiveListingType(MyListingsTypes.Selling),
    },
    [MyListingsTypes.Saved]: {
      name: 'Saved',
      onClick: () => setActiveListingType(MyListingsTypes.Saved),
    },
    [MyListingsTypes.Expired]: {
      name: 'Expired',
      onClick: () => setActiveListingType(MyListingsTypes.Expired),
    },
    [MyListingsTypes.Sold]: {
      name: 'Sold',
      onClick: () => setActiveListingType(MyListingsTypes.Sold),
    },
  };

  return (
    <>
      {props.user ? (
        <UserPageLayout
          header={renderHeader()}
          body={renderListings()}
          navList={navList}
          active={MyListingsTypes.Selling}
        />
      ) : (
        <AuthRequired route="Your listings" />
      )}
      {showLoader && <Loader />}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user };
};

export const UserListings = connect(mapStateToProps)(_UserListings);
