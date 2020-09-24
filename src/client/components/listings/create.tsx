import React from 'react';
import { connect } from 'react-redux';

import { ListingImagesParams } from '../../utilities';
import { UserDoc, ListingAttrs } from '../../../common';
import { ListingForm } from '../forms';
import { createListing } from '../../actions';

interface NewListingProps {
  user: UserDoc;
  createListing(
    formValues: ListingAttrs,
    imagesParams: ListingImagesParams
  ): void;
}

const _NewListing = (props: NewListingProps): JSX.Element => {
  return (
    <ListingForm
      sendRequest={props.createListing}
      submitBtnText="Create"
      formTitle="Create listing"
      //@ts-ignore
      initialValues={{ location: props.user.location }}
    />
  );
};

export const NewListing = connect(null, { createListing })(_NewListing);
