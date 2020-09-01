import axios from 'axios';
import { history } from '../history';
import {
  ActionTypes,
  catchSubmissionError,
  CreateListingAction,
  EditListingAction,
  FunctionalAction,
  ListingImagesParams,
  FetchListingAction,
  ClearListingAction,
  FetchListingsAction,
  processCombinedLocationToGeoLocation,
  processFormValuesToFormData,
  SaveListingAction,
  UnsaveListingAction,
} from '../utilities';
import { ListingAttrs } from '../../server/models';
import { ApiRoutes } from '../../common';
import { AlertType, showAlert } from '.././components/alert';

export const fetchListing = (
  id: string
): FunctionalAction<FetchListingAction> => async dispatch => {
  try {
    const { data } = await axios.get(`${ApiRoutes.Listings}/${id}`);
    dispatch({
      type: ActionTypes.fetchListing,
      payload: data.data,
    });

    const response = await axios.get(`${ApiRoutes.Favorites}/${id}`);
    dispatch({
      //@ts-ignore
      type: response.data.data
        ? ActionTypes.saveListing
        : ActionTypes.unsaveListing,
      payload: data.data,
    });
  } catch (err) {
    console.log(err);
    showAlert(AlertType.Error, 'Cannot load listing with this id');
  }
};

export const clearListing = (): ClearListingAction => {
  return { type: ActionTypes.clearListing };
};

export const fetchListings = (
  queryStr: string
): FunctionalAction<FetchListingsAction> => async dispatch => {
  try {
    const { data } = await axios.get(`${ApiRoutes.Listings}/?${queryStr}`);
    dispatch({
      type: ActionTypes.fetchListings,
      payload: data.data,
    });
  } catch (err) {
    console.log(err);
    showAlert(AlertType.Error, `There's an issue loading listings`);
  }
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

export const saveListing = (
  listingId: string
): FunctionalAction<SaveListingAction> => async dispatch => {
  try {
    const { data } = await axios.post(ApiRoutes.Favorites, { listingId });
    dispatch({
      type: ActionTypes.saveListing,
      payload: data.data,
    });

    showAlert(AlertType.Success, 'Listing saved successfully');
  } catch (err) {
    showAlert(AlertType.Error, err.message);
  }
};

export const unsaveListing = (
  listingId: string
): FunctionalAction<UnsaveListingAction> => async dispatch => {
  try {
    const { data } = await axios.delete(`${ApiRoutes.Favorites}/${listingId}`);
    dispatch({
      type: ActionTypes.unsaveListing,
      payload: data.data,
    });
    showAlert(AlertType.Success, 'Listing unsaved successfully');
  } catch (err) {
    showAlert(AlertType.Error, err.message);
  }
};
