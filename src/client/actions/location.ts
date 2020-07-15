import axios from 'axios';
import { Dispatch } from 'redux';
import { SubmissionError } from 'redux-form';
import { ActionTypes } from '../utilities/action-types';
import { GeoLocation, ErrMsg } from '../../common';
import {
  GetLocationWithPermissionAction,
  GetLocationByIPAction,
  SearchLocationAction,
  SearchedLocation,
  catchSubmissionError,
  FunctionalAction,
} from '../utilities';

export const getLocationWithPermission = (): GetLocationWithPermissionAction => {
  const location: GeoLocation = {
    coordinates: [-122.437598, 37.757591], // [longitude, latitude]
    zip: 94114,
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
  };

  window.navigator.geolocation.getCurrentPosition(position => {
    location.coordinates[0] = position.coords.longitude;
    location.coordinates[1] = position.coords.latitude;
  });

  return {
    type: ActionTypes.getLocationWithPermission,
    payload: location,
  };
};

export const getLocationByIP = () => {
  return async (dispatch: Dispatch): Promise<void> => {
    const { data } = await axios.get(
      `https://geolocation-db.com/json/${process.env.GEOLOCATION_DB_KEY}`
    );

    const { longitude, latitude, zip, city, state, country_name } = data;
    dispatch<GetLocationByIPAction>({
      type: ActionTypes.getLocationByIP,
      payload: {
        coordinates: [longitude, latitude], // [longitude, latitude]
        zip: parseInt(zip),
        city,
        state,
        country: country_name,
      },
    });
  };
};

export const searchLocation = (searchTerm = '') => {
  return async (dispatch: Dispatch): Promise<void> => {
    try {
      let payload: SearchedLocation[] = [];

      if (searchTerm !== '') {
        const response = await axios.get(
          `https://public.opendatasoft.com/api/records/1.0/search/?dataset=us-zip-code-latitude-and-longitude&q=${encodeURI(
            searchTerm
          )}`,
          { headers: { Authorization: process.env.OPEN_DATA_SOFT_KEY } }
        );
        payload = response.data.records;
      }

      dispatch<SearchLocationAction>({
        type: ActionTypes.searchLocation,
        payload,
      });
    } catch (err) {}
  };
};
