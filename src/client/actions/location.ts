import axios from 'axios';
import { Dispatch } from 'redux';
import { ActionTypes } from '../utilities/action-types';
import { GeoLocation } from '../../common';
import {
  GetLocationWithPermissionAction,
  GetLocationByIPAction,
  SearchLocationAction,
  SearchedLocation,
  StoreState,
  SetDefaultFiltersAction,
} from '../utilities';

export const getLocationWithPermission = (): GetLocationWithPermissionAction => {
  const location: GeoLocation = {
    coordinates: [-122.437598, 37.757591], // [longitude, latitude]
    zip: '94114',
    city: 'San Francisco',
    state: 'CA',
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
  return async (
    dispatch: Dispatch,
    getState: () => StoreState
  ): Promise<void> => {
    const { data } = await axios.get(
      `https://geolocation-db.com/json/${process.env.GEOLOCATION_DB_KEY}`
    );

    const location: GeoLocation = {
      coordinates: [data.longitude, data.latitude], // [longitude, latitude]
      zip: data.postal,
      city: data.city,
      state: data.state.slice(0, 2).toUpperCase(),
      country: data.country_name,
    };

    dispatch<GetLocationByIPAction>({
      type: ActionTypes.getLocationByIP,
      payload: location,
    });

    if (!getState().user)
      dispatch<SetDefaultFiltersAction>({
        type: ActionTypes.setDefaultFilters,
        payload: location,
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
          )}&rows=6`,
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
