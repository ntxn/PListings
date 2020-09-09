import React, { useState, useEffect } from 'react';
import { BsPersonFill } from 'react-icons/bs';
import { connect } from 'react-redux';
import axios from 'axios';

import { UserPageLayout, NavItem } from './UserPageLayout';
import { ListingCardPublic } from '../ListingCard';
import { Loader } from '../Modal';
import { calcDistanceBetweenTwoPoints, StoreState } from '../../utilities';
import { ApiRoutes, UserDoc, ListingDoc, GeoLocation } from '../../../common';
import { fetchSavedListingIds, clearSavedListingIds } from '../../actions';

interface ProfileProps {
  user: UserDoc | null;
  currentLocation: GeoLocation;
  savedListingIds: Record<string, string>;
  match: {
    params: { id: string };
  };

  fetchSavedListingIds(listingIds: string[]): void;
  clearSavedListingIds(): void;
}

const _Profile = (props: ProfileProps): JSX.Element => {
  const [user, setUser] = useState<UserDoc>();
  const [selling, setSelling] = useState<ListingDoc[]>([]);
  const [sold, setSold] = useState<ListingDoc[]>([]);
  const [loader, setLoader] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [active, setActive] = useState('selling');
  const [center, setCenter] = useState<[number, number]>();

  useEffect(() => {
    setLoader(true);

    const fetchData = async () => {
      const response = await axios.get(
        `${ApiRoutes.Users}/${props.match.params.id}`
      );
      const user = response.data.data as UserDoc;
      setUser(user);

      // spliting listings into selling & sold
      const { listings } = user;

      const sellingItems: ListingDoc[] = [];
      const soldItems: ListingDoc[] = [];
      listings.forEach(listing => {
        if (listing.sold) soldItems.push(listing);
        else sellingItems.push(listing);
      });
      setSold(soldItems);
      setSelling(sellingItems);

      // find the center
      if (props.user) setCenter(props.user.location.coordinates);
      else setCenter(props.currentLocation.coordinates);

      // fetch saved listing ids
      if (props.user)
        props.fetchSavedListingIds(listings.map(listing => listing.id));

      setLoader(false);
      setShowContent(true);
    };

    if (props.user || props.currentLocation) fetchData();

    return () => props.clearSavedListingIds();
  }, [props.user, props.currentLocation]);

  const renderHeader = (): JSX.Element => {
    const { name, photo, location, createdAt } = user!;
    const joined = new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });

    return (
      <div className="profile__header">
        <div className="profile__header__left">
          {photo ? (
            <img src={`/img/users/${photo}`} alt={`${name}'s photo`} />
          ) : (
            <BsPersonFill title="Default Avatar" />
          )}
        </div>
        <div className="profile__header__right">
          <h3 className="heading-secondary">{name}</h3>
          <p className="sub-heading-quaternary">{`${location.city}, ${location.state}`}</p>
          <p className="sub-heading-quaternary u-margin-top-xxsmall">
            Member since {joined}
          </p>
        </div>
      </div>
    );
  };
  const renderBody = (): JSX.Element => {
    if (active === 'reviews') return <div>Coming soon</div>;

    const listings = active === 'selling' ? selling : sold;
    const clickable = active === 'selling';

    return (
      <div className="listings">
        {listings.map(listing => {
          const [lng2, lat2] = listing.location.coordinates;
          return (
            <ListingCardPublic
              key={listing.id}
              listing={listing}
              clickable={clickable}
              saved={props.savedListingIds[listing.id] ? true : false}
              distanceDiff={calcDistanceBetweenTwoPoints(
                center![1],
                center![0],
                lat2,
                lng2
              )}
            />
          );
        })}
      </div>
    );
  };

  const navList: Record<string, NavItem> = {
    selling: {
      name: 'Selling',
      onClick: () => setActive('selling'),
    },
    sold: {
      name: 'Sold',
      onClick: () => setActive('sold'),
    },
    reviews: {
      name: 'Reviews',
      onClick: () => setActive('reviews'),
    },
  };

  return (
    <>
      {showContent && (
        <UserPageLayout
          header={renderHeader()}
          body={renderBody()}
          navList={navList}
          active="selling"
        />
      )}
      {loader && <Loader />}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    user: state.user,
    currentLocation: state.currentLocation,
    savedListingIds: state.savedListingIds,
  };
};

export const Profile = connect(mapStateToProps, {
  fetchSavedListingIds,
  clearSavedListingIds,
})(_Profile);
