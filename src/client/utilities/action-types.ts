export enum ActionTypes {
  // auth
  fetchCurrentUser,
  signUp,
  logOut,
  logIn,
  updateProfile,
  updatePassword,

  // location
  getLocationWithPermission,
  getLocationByIP,

  // search for matching locations from opendata soft - US Zip Code Latitude and Longitude
  searchLocation,

  // loader
  setBtnLoader,

  // listings
  createListing,
  fetchListing,
  editListing,
  saveListing,
  unsaveListing,
}
