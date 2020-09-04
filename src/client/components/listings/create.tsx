import React from 'react';
import { connect } from 'react-redux';

import { StoreState, ListingImagesParams } from '../../utilities';
import { UserDoc, ListingAttrs } from '../../../common';
import { AuthRequired } from '../AuthRequired';
import { ListingForm } from '../forms';
import { createListing } from '../../actions';

interface NewListingProps {
  user: UserDoc | null;
  createListing(
    formValues: ListingAttrs,
    imagesParams: ListingImagesParams
  ): void;
}

const _NewListing = (props: NewListingProps): JSX.Element => {
  const renderCreateListingForm = (): JSX.Element => {
    return (
      <ListingForm
        sendRequest={props.createListing}
        submitBtnText="Create"
        formTitle="Create listing"
        //@ts-ignore
        initialValues={{ location: props.user!.location }}
      />
    );
  };

  return (
    <>
      {props.user ? (
        renderCreateListingForm()
      ) : (
        <AuthRequired route="Sell items" />
      )}
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return { user: state.user };
};

export const NewListing = connect(mapStateToProps, {
  createListing,
})(_NewListing);
