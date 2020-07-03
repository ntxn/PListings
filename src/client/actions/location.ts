import axios from 'axios';
import { Dispatch } from 'redux';
import { ActionTypes } from '../utilities/action-types';
import { GeoLocation } from '../../common';
import {
  GetLocationWithPermissionAction,
  GetLocationByIPAction,
} from '../utilities';

export const getLocationWithPermission = (): GetLocationWithPermissionAction => {
  const location: GeoLocation = {
    coordinates: [-122.437598, 37.757591], // [longitude, latitude]
    postal: 94114,
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

    const { longitude, latitude, postal, city, state, country_name } = data;
    dispatch<GetLocationByIPAction>({
      type: ActionTypes.getLocationByIP,
      payload: {
        coordinates: [longitude, latitude], // [longitude, latitude]
        postal: parseInt(postal),
        city,
        state,
        country: country_name,
      },
    });
  };
};
