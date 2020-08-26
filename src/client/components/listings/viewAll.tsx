import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { fetchListings } from '../../actions';
import {
  StoreState,
  FilterAttrs,
  processFiltersToQueryString,
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
  const [defaultFilterTimer, setDefaultFilterTimer] = useState(
    setTimeout(() => {}, 10000)
  );

  useEffect(() => {
    const { search } = props.location;

    if (search) props.fetchListings(search.substring(1));
    else {
      clearTimeout(defaultFilterTimer);
      setDefaultFilterTimer(
        setTimeout(() => {
          const queryStr = processFiltersToQueryString(props.defaultFilters);
          props.fetchListings(queryStr);
        }, 500)
      );
    }
  }, [props.defaultFilters, props.location.search]);

  return (
    <div>
      {props.listings.map(listing => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { defaultFilters: state.defaultFilters, listings: state.listings };
};

export const Listings = connect(mapStateToProps, { fetchListings })(
  AllListings
);
