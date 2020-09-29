import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { StoreState } from './interfaces';
import { Loader } from '../components/Modal';
import { catchAsync } from './catch-async';
import { replaceListing, fetchListingFavStatusByUser } from '../actions';
import { ListingDoc, UserDoc, ApiRoutes } from '../../common';

export const DataType = {
  Listing: 'listing',
  User: 'user',
};

export const withLoadingData = (Component: any, dataType: string) => {
  interface LoadingData {
    listing: ListingDoc | null;
    user: UserDoc | null;

    replaceListing(listing: ListingDoc): void;
    fetchListingFavStatusByUser(listing: ListingDoc): void;

    match: { params: { id: string } };
  }

  const LoadingData = (props: LoadingData): JSX.Element => {
    const isListing = dataType === DataType.Listing;
    const [data, setData] = useState(isListing ? props.listing : props.user);
    const [loader, setLoader] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        setLoader(true);
        catchAsync(async () => {
          const { id } = props.match.params;
          const { data } = await axios.get(
            `${isListing ? ApiRoutes.Listings : ApiRoutes.Users}/${id}`
          );

          if (isListing) {
            props.fetchListingFavStatusByUser(data.data);
            props.replaceListing(data.data);
          }

          setData(data.data);
          setLoader(false);
        })({ clearLoader: () => setLoader(false) });
      };

      if (!data) fetchData();
    }, []);

    return (
      <>
        {data && <Component {...props} />}
        {loader && <Loader />}
      </>
    );
  };

  const mapStateToProps = (state: StoreState) => {
    return { listing: state.listing, user: state.user };
  };

  return connect(mapStateToProps, {
    replaceListing,
    fetchListingFavStatusByUser,
  })(LoadingData);
};
