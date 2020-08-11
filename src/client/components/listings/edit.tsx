import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { StoreState, ListingImagesParams } from '../../utilities';
import { fetchListing, editListing } from '../../actions';
import { ListingDoc, UserDoc, ListingAttrs } from '../../../server/models';
import { AuthRequired } from '../AuthRequired';
import { ListingForm } from '../forms';

interface EditListingProps {
  user: UserDoc | null;
  editListing(
    formValues: ListingAttrs,
    imagesParams: ListingImagesParams
  ): void;
  listing: ListingDoc;
  fetchListing(id: string): void;
}

const _EditListing = (props: EditListingProps): JSX.Element => {
  useEffect(() => {
    const fetchData = async () =>
      //@ts-ignore
      await props.fetchListing(props.match.params.id);

    fetchData();
  }, []);

  const renderEditListingForm = (): JSX.Element => {
    return (
      <ListingForm
        sendRequest={props.editListing}
        submitBtnText="Save"
        formTitle="Edit listing"
        images={props.listing.photos}
      />
    );
  };

  return (
    <>
      {props.user && props.listing ? (
        renderEditListingForm()
      ) : (
        <AuthRequired route="Edit your listings" />
      )}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user, listing: state.listing };
};

export const EditListing = connect(mapStateToProps, {
  fetchListing,
  editListing,
})(
  //@ts-ignore
  _EditListing
);
