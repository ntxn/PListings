import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { fetchListings } from '../../actions';
import { ListingCard } from './ListingCard';
import {
  StoreState,
  FilterAttrs,
  processFiltersToQueryString,
  calcDistanceBetweenTwoPoints,
} from '../../utilities';
import { ListingDoc } from '../../../server/models';

interface StateProps {
  defaultFilters: FilterAttrs;
  listings: ListingDoc[];
}

interface DispatchProps {
  fetchListings(queryStr: string): void;
}
type AllListingsProps = StateProps &
  DispatchProps & { location: { search: string } };

const AllListings = (props: AllListingsProps): JSX.Element => {
  const [center, setCenter] = useState([0, 0]);
  const [defaultFilterTimer, setDefaultFilterTimer] = useState(
    setTimeout(() => {}, 10000)
  );

  useEffect(() => {
    const { search } = props.location;

    if (search) {
      const queries = new URLSearchParams(search);
      setCenter(
        queries
          .get('location')!
          .split(',')
          .map(value => parseFloat(value))
      );
      props.fetchListings(search.substring(1));
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
          props.fetchListings(queryStr);
        }, 500)
      );
    }
  }, [props.defaultFilters, props.location.search]);

  return (
    <div>
      {props.listings.map(listing => {
        const [lng2, lat2] = listing.location.coordinates;
        return (
          <ListingCard
            key={listing.id}
            listing={listing}
            distanceDiff={calcDistanceBetweenTwoPoints(
              center[1],
              center[0],
              lat2,
              lng2
            )}
          />
        );
      })}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { defaultFilters: state.defaultFilters, listings: state.listings };
};

export const Listings = connect(mapStateToProps, { fetchListings })(
  AllListings
);
