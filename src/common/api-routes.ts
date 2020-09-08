export enum Routes {
  // ------------------- USERS ---------------------
  // Sub-routes for USERS resource
  CurrentUser = '/current-user',

  SignUp = '/signup',
  LogIn = '/login',
  LogOut = '/logout',
  LogOutAll = '/logout-all',

  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password/:token',

  MyAccount = '/my-account',
  UpdateMyAccount = '/update-my-account',
  DeleteMyAccount = '/delete-my-account',
  UpdateMyPassword = '/update-my-password',
  MyListings = '/my-listings',

  // Public users data
  User = '/:id',

  // Admins only
  AllUsersProtected = '/admin',
  UserProtected = '/admin/:id',

  // ------------------- LISTING ---------------------
  // Listings routes
  Listings = '/',
  Listing = '/:id',
  ListingMarkedAsSold = '/mark-as-sold/:id',

  // Admin only
  ListingProtected = '/admin/:id',

  // ------------------- FAVORITE ---------------------
  Favorites = '/',
  Favorite = '/:id',
  FavoriteListingsByUser = '/user/:id',
  FilterListingsSavedByUser = '/filter-listings-saved-by-user',
}

// base route for each resource
export enum Base {
  Users = '/api/v1/users',
  Auth = '/api/v1/auth',

  Listings = '/api/v1/listings',
  Favorites = '/api/v1/favorites',
}

/** These routes are used for making API calls */
export enum ApiRoutes {
  // Authentication
  SignUp = '/api/v1/auth/signup',
  LogIn = '/api/v1/auth/login',
  LogOut = '/api/v1/auth/logout',
  LogOutAll = '/api/v1/auth/logout-all',
  ForgotPassword = '/api/v1/auth/forgot-password',
  CurrentUser = '/api/v1/auth/current-user',

  // Users
  Users = '/api/v1/users',
  UsersProtected = '/api/v1/users/admin',
  MyAccount = '/api/v1/users/my-account',
  UpdateMyAccount = '/api/v1/users/update-my-account',
  DeleteMyAccount = '/api/v1/users/delete-my-account',
  UpdateMyPassword = '/api/v1/users/update-my-password',
  MyListings = '/api/v1/users/my-listings',

  // Listings
  Listings = '/api/v1/listings',
  ListingProtected = '/api/v1/listings/admin',
  ListingMarkedAsSold = '/api/v1/listings/mark-as-sold',

  // Favorites
  Favorites = '/api/v1/favorites',
  FavoriteListingsByUser = '/api/v1/favorites/user',
  FilterListingsSavedByUser = '/api/v1/favorites/filter-listings-saved-by-user',
}
