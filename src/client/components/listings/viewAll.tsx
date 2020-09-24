import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { fetchListings, clearListings, replaceListing } from '../../actions';
import { ListingCardPublic } from '../ListingCard';
import { Loader } from '../Modal';
import {
  StoreState,
  FilterAttrs,
  processFiltersToQueryString,
  calcDistanceBetweenTwoPoints,
} from '../../utilities';
import { ListingDoc, UserDoc } from '../../../common';

// TODO: remove clearListings once it is sure there's no need for it

interface StateProps {
  defaultFilters: FilterAttrs;
  listings: ListingDoc[];
  user: UserDoc | null;
  savedListingIds: Record<string, string>;
  replaceListing(listing: ListingDoc): void;
}

interface DispatchProps {
  fetchListings(queryStr: string, user: UserDoc | null): void;
  clearListings(): void;
}
type AllListingsProps = StateProps &
  DispatchProps & { location: { search: string } };

const AllListings = (props: AllListingsProps): JSX.Element => {
  const [center, setCenter] = useState([0, 0]);
  const [showLoader, setshowLoader] = useState(false);
  const [defaultFilterTimer, setDefaultFilterTimer] = useState(
    setTimeout(() => {}, 10000)
  );

  useEffect(() => {
    setshowLoader(true);

    const { search } = props.location;

    if (search) {
      const queries = new URLSearchParams(search);
      setCenter(
        queries
          .get('location')!
          .split(',')
          .map(value => parseFloat(value))
      );
      props.fetchListings(search.substring(1), props.user);
      setshowLoader(false);
    } else {
      clearTimeout(defaultFilterTimer);
      setDefaultFilterTimer(
        setTimeout(() => {
          const {
            coordinates,
            latitude,
            longitude,
          } = props.defaultFilters.location;
          setCenter(coordinates ? coordinates : [longitude!, latitude!]);

          const queryStr = processFiltersToQueryString(props.defaultFilters);
          props.fetchListings(queryStr, props.user);
          setshowLoader(false);
        }, 800)
      );
    }

    return () => {
      clearTimeout(defaultFilterTimer);
    };
  }, [props.defaultFilters, props.location.search]);

  return (
    <>
      <div className="listings">
        {props.listings.map(listing => {
          const [lng2, lat2] = listing.location.coordinates;
          return (
            <ListingCardPublic
              key={listing.id}
              listing={listing}
              saved={props.savedListingIds[listing.id] ? true : false}
              clickable
              distanceDiff={calcDistanceBetweenTwoPoints(
                center[1],
                center[0],
                lat2,
                lng2
              )}
              replaceListing={() => props.replaceListing(listing)}
            />
          );
        })}
      </div>
      {showLoader && <Loader />}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    defaultFilters: state.defaultFilters,
    listings: state.listings,
    savedListingIds: state.savedListingIds,
    user: state.user,
  };
};

export const Listings = connect(mapStateToProps, {
  fetchListings,
  clearListings,
  replaceListing,
})(AllListings);
