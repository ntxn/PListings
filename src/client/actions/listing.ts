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
  processCombinedLocationToGeoLocation,
  processFormValuesToFormData,
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
  } catch (err) {
    console.log(err);
    showAlert(AlertType.Error, 'Cannot load listing with this id');
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

    showAlert(AlertType.Success, 'Listing created successfully');

    dispatch({
      type: ActionTypes.createListing,
      payload: data.data,
    });

    history.push(`/listings/${data.data.id}`);
  });

export const editListing = (
  formValues: ListingAttrs,
  imagesParams: ListingImagesParams
): FunctionalAction<EditListingAction> =>
  catchSubmissionError(async dispatch => {
    const { newImages, existingImages, deletedImages } = imagesParams;
    processCombinedLocationToGeoLocation(formValues);

    let response;

    if (!newImages)
      response = await axios.post(ApiRoutes.Listings, {
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
      response = await axios.post(ApiRoutes.Listings, formData);
    }

    showAlert(AlertType.Success, 'Listing updated successfully');

    dispatch({
      type: ActionTypes.editListing,
      payload: response.data.data,
    });

    history.replace(`/listings/edit/${response.data.data.id}`);
  });
