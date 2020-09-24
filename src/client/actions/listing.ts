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
} from '../utilities';
import { ApiRoutes, ListingAttrs, UserDoc, ListingDoc } from '../../common';
import { AlertType, showAlert } from '.././components/alert';

export const fetchListings = (queryStr: string, user: UserDoc | null) => async (
  dispatch: Dispatch
): Promise<void> => {
  try {
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
  } catch (err) {
    console.log(err);
    showAlert(AlertType.Error, `There's an issue loading listings`);
  }
};

export const fetchSavedListingIds = (listingIds: string[]) => async (
  dispatch: Dispatch
): Promise<void> => {
  try {
    const { data } = await axios.post(ApiRoutes.FilterListingsSavedByUser, {
      listingIds,
    });
    dispatch<FetchSavedListingIdsAction>({
      type: ActionTypes.fetchSavedListingIds,
      payload: data.data,
    });
  } catch (err) {
    console.log(err);
    showAlert(AlertType.Error, `Issue with fetching saved listing IDs`);
  }
};

export const fetchListingFavStatusByUser = (listing: ListingDoc) => async (
  dispatch: Dispatch
): Promise<void> => {
  catchAsync(async () => {
    const response = await axios.get(`${ApiRoutes.Favorites}/${listing.id}`);
    dispatch({
      type: response.data.data
        ? ActionTypes.saveListing
        : ActionTypes.unsaveListing,
      payload: listing,
    });
  })();
};

export const createListing = (
  formValues: ListingAttrs,
  imagesParams: ListingImagesParams
): FunctionalAction<CreateListingAction> =>
  catchSubmissionError(async dispatch => {
    const { newImages } = imagesParams;

    const formData = new FormData();
    Object.values(newImages).forEach(file =>
      formData.append('newImages', file)
    );

    processCombinedLocationToGeoLocation(formValues);
    processFormValuesToFormData(formValues, formData);

    const { data } = await axios.post(ApiRoutes.Listings, formData);

    dispatch({
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
): FunctionalAction<EditListingAction> =>
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

    dispatch({
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

export const saveListing = (
  listingId: string
): FunctionalAction<SaveListingAction> => async dispatch => {
  catchAsync(async () => {
    const { data } = await axios.post(ApiRoutes.Favorites, { listingId });
    dispatch({
      type: ActionTypes.saveListing,
      payload: data.data,
    });

    showAlert(AlertType.Success, 'Listing saved successfully');
  })();
};

export const unsaveListing = (
  listingId: string
): FunctionalAction<UnsaveListingAction> => async dispatch => {
  catchAsync(async () => {
    const { data } = await axios.delete(`${ApiRoutes.Favorites}/${listingId}`);
    dispatch({
      type: ActionTypes.unsaveListing,
      payload: data.data,
    });
    showAlert(AlertType.Success, 'Listing unsaved successfully');
  })();
};

export const clearListing = (): ClearListingAction => {
  return { type: ActionTypes.clearListing };
};

export const clearListings = (): ClearListingsAction => {
  return { type: ActionTypes.clearListings };
};

export const clearSavedListingIds = (): ClearSavedListingIdsAction => {
  return { type: ActionTypes.clearSavedListingIds };
};
