import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { StoreState } from '../../utilities/interfaces';
import { Loader } from '../Modal';
import { catchAsync } from '../../utilities/catch-async';
import { replaceListing, fetchListingFavStatusByUser } from '../../actions';
import { ListingDoc, ApiRoutes } from '../../../common';

export const withLoadingListing = (Component: any) => {
  interface LoadingData {
    listing: ListingDoc | null;

    replaceListing(listing: ListingDoc): void;

    match: { params: { id: string } };
  }

  const LoadingData = (props: LoadingData): JSX.Element => {
    const [listing, setListing] = useState(props.listing);
    const [loader, setLoader] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        setLoader(true);
        catchAsync(async () => {
          const { id } = props.match.params;
          const { data } = await axios.get(`${ApiRoutes.Listings}/${id}`);

          props.replaceListing(data.data);

          setListing(data.data);
          setLoader(false);
        })({ clearLoader: () => setLoader(false) });
      };

      if (!listing) fetchData();
    }, []);

    return (
      <>
        {listing && <Component {...props} />}
        {loader && <Loader />}
      </>
    );
  };

  const mapStateToProps = (state: StoreState) => {
    return { listing: state.listing };
  };

  return connect(mapStateToProps, {
    replaceListing,
    fetchListingFavStatusByUser,
  })(LoadingData);
};
