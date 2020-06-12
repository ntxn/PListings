export enum Routes {
  /********** Sub-routes for USERS resource **********/
  SignUp = '/signup',
  LogIn = '/login',
  LogOut = '/logout',
  ForgotPassword = '/forgot-password',
  ResetPassword = '/reset-password/:token',
  MyAccount = '/my-account',
  UpdateMyAccount = '/update-my-account',
  DeleteMyAccount = '/delete-my-account',

  // Admins only
  AllUsers = '/',
  User = '/:id',
}

// base route for each resource
export enum ResourceRoutes {
  Users = '/api/v1/users',
  Auth = '/api/v1/auth',
}
