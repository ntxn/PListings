import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { StoreState, ListingImagesParams } from '../../utilities';
import { fetchListing, editListing } from '../../actions';
import { ListingDoc, UserDoc, ListingAttrs } from '../../../common';
import { Unauthorized } from '../Unauthorized';
import { ListingForm } from '../forms';

interface EditListingProps {
  user: UserDoc;

  listing: ListingDoc | null;

  fetchListing(id: string): void;
  editListing(
    formValues: ListingAttrs,
    imagesParams: ListingImagesParams,
    listingId: string
  ): void;

  match: { params: { id: string } };
}

const _EditListing = (props: EditListingProps): JSX.Element => {
  useEffect(() => {
    const fetchData = async () =>
      await props.fetchListing(props.match.params.id);

    fetchData();
  }, []);

  const renderEditListingForm = (): JSX.Element => {
    return (
      <ListingForm
        sendRequest={props.editListing}
        submitBtnText="Save"
        formTitle="Edit listing"
        //@ts-ignore
        initialValues={props.listing}
        listingId={props.listing!.id}
      />
    );
  };

  return (
    <>
      {props.listing && props.user.id === props.listing.owner.id ? (
        renderEditListingForm()
      ) : (
        <Unauthorized />
      )}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { listing: state.listing };
};

export const EditListing = connect(mapStateToProps, {
  fetchListing,
  editListing,
})(_EditListing);
