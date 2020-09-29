import axios from 'axios';
import { Dispatch } from 'redux';

import { history } from '../history';
import {
  ActionTypes,
  catchSubmissionError,
  CreateListingAction,
  EditListingAction,
  FunctionalAction,
  ListingImagesParams,
  ReplaceListingAction,
  ClearListingAction,
  FetchListingsAction,
  ClearListingsAction,
  FetchSavedListingIdsAction,
  ClearSavedListingIdsAction,
  processCombinedLocationToGeoLocation,
  processFormValuesToFormData,
  SaveListingAction,
  UnsaveListingAction,
  catchAsync,
  catchAsyncAction,
} from '../utilities';
import { ApiRoutes, ListingAttrs, UserDoc, ListingDoc } from '../../common';
import { AlertType, showAlert } from '.././components/alert';

export const fetchListings = (
  queryStr: string,
  user: UserDoc | null
): FunctionalAction =>
  catchAsyncAction(async dispatch => {
    const response = await axios.get(`${ApiRoutes.Listings}/?${queryStr}`);
    const listings = response.data.data as ListingDoc[];

    dispatch<FetchListingsAction>({
      type: ActionTypes.fetchListings,
      payload: listings,
    });

    if (user) {
      const { data } = await axios.post(ApiRoutes.FilterListingsSavedByUser, {
        listingIds: listings.map(listing => listing.id),
      });
      dispatch<FetchSavedListingIdsAction>({
        type: ActionTypes.fetchSavedListingIds,
        payload: data.data,
      });
    }
  });

export const fetchSavedListingIds = (listingIds: string[]): FunctionalAction =>
  catchAsyncAction(async dispatch => {
    const { data } = await axios.post(ApiRoutes.FilterListingsSavedByUser, {
      listingIds,
    });
    dispatch<FetchSavedListingIdsAction>({
      type: ActionTypes.fetchSavedListingIds,
      payload: data.data,
    });
  });

export const fetchListingFavStatusByUser = (
  listing: ListingDoc
): FunctionalAction =>
  catchAsyncAction(async dispatch => {
    const response = await axios.get(`${ApiRoutes.Favorites}/${listing.id}`);
    dispatch({
      type: response.data.data
        ? ActionTypes.saveListing
        : ActionTypes.unsaveListing,
      payload: listing,
    });
  });

export const createListing = (
  formValues: ListingAttrs,
  imagesParams: ListingImagesParams
): FunctionalAction =>
  catchSubmissionError(async dispatch => {
    const { newImages } = imagesParams;

    const formData = new FormData();
    Object.values(newImages).forEach(file =>
      formData.append('newImages', file)
    );

    processCombinedLocationToGeoLocation(formValues);
    processFormValuesToFormData(formValues, formData);

    const { data } = await axios.post(ApiRoutes.Listings, formData);

    dispatch<CreateListingAction>({
      type: ActionTypes.createListing,
      payload: data.data,
    });

    setTimeout(() => {
      showAlert(AlertType.Success, 'Listing created successfully');
      history.push(`/listings/${data.data.id}`);
    }, 500);
  });

export const editListing = (
  formValues: ListingAttrs,
  imagesParams: ListingImagesParams,
  listingId: string
): FunctionalAction =>
  catchSubmissionError(async dispatch => {
    const url = `${ApiRoutes.Listings}/${listingId}`;
    const { newImages, existingImages, deletedImages } = imagesParams;
    processCombinedLocationToGeoLocation(formValues);

    let response;

    if (!newImages)
      response = await axios.patch(url, {
        ...formValues,
        photos: existingImages,
        deletedImages,
      });
    else {
      const formData = new FormData();
      Object.values(newImages).forEach(file =>
        formData.append('newImages', file)
      );
      if (existingImages)
        formData.append('photos', JSON.stringify(existingImages));
      if (deletedImages)
        formData.append('deletedImages', JSON.stringify(deletedImages));

      processFormValuesToFormData(formValues, formData);
      response = await axios.patch(url, formData);
    }

    showAlert(AlertType.Success, 'Listing updated successfully');

    dispatch<EditListingAction>({
      type: ActionTypes.editListing,
      payload: response.data.data,
    });

    history.replace(`/listings/edit/${response.data.data.id}`);
  });

export const replaceListing = (listing: ListingDoc): ReplaceListingAction => {
  return {
    type: ActionTypes.replaceListing,
    payload: listing,
  };
};

export const saveListing = (listingId: string): FunctionalAction =>
  catchAsyncAction(async dispatch => {
    const { data } = await axios.post(ApiRoutes.Favorites, { listingId });
    dispatch<SaveListingAction>({
      type: ActionTypes.saveListing,
      payload: data.data,
    });

    showAlert(AlertType.Success, 'Listing saved successfully');
  });

export const unsaveListing = (listingId: string): FunctionalAction =>
  catchAsyncAction(async dispatch => {
    const { data } = await axios.delete(`${ApiRoutes.Favorites}/${listingId}`);
    dispatch<UnsaveListingAction>({
      type: ActionTypes.unsaveListing,
      payload: data.data,
    });
    showAlert(AlertType.Success, 'Listing unsaved successfully');
  });

export const clearListing = (): ClearListingAction => {
  return { type: ActionTypes.clearListing };
};

export const clearListings = (): ClearListingsAction => {
  return { type: ActionTypes.clearListings };
};

export const clearSavedListingIds = (): ClearSavedListingIdsAction => {
  return { type: ActionTypes.clearSavedListingIds };
};
