export enum Routes {
  // Sub-routes for USERS resource
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

  // Admins only
  AllUsers = '/',
  User = '/:id',
}

// base route for each resource
export enum Base {
  Users = '/api/v1/users',
  Auth = '/api/v1/auth',
}

/** These routes are used for making API calls */
export enum ApiRoutes {
  // Authentication
  SignUp = '/api/v1/auth/signup',
  LogIn = '/api/v1/auth/login',
  LogOut = '/api/v1/auth/logout',
  LogOutAll = '/api/v1/auth/logout-all',
  ForgotPassword = '/api/v1/auth/forgot-password',

  // Users
  Users = '/api/v1/users',
  MyAccount = '/api/v1/users/my-account',
  UpdateMyAccount = '/api/v1/users/update-my-account',
  DeleteMyAccount = '/api/v1/users/delete-my-account',
  UpdateMyPassword = '/api/v1/users/update-my-password',
}
