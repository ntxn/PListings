import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { StoreState } from '../../utilities';
import { fetchListing } from '../../actions';
import { ListingDoc } from '../../../server/models';

interface ListingProps {
  listing: ListingDoc;
  fetchListing(id: string): void;
}

const _Listing = (props: ListingProps): JSX.Element => {
  useEffect(() => {
    const fetchData = async () =>
      //@ts-ignore
      await props.fetchListing(props.match.params.id);

    fetchData();
  }, []);

  return (
    <div>
      {props.listing &&
        props.listing.photos.map(filename => {
          return <img key={filename} src={`/img/listings/${filename}`} />;
        })}
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { listing: state.listing };
};

//@ts-ignore
export const Listing = connect(mapStateToProps, { fetchListing })(_Listing);
