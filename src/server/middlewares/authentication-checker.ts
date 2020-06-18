import jwt from 'jsonwebtoken';
import { ErrMsg } from '../../common';
import {
  catchAsync,
  CustomRequest,
  MiddlewareHandler,
  AppError,
  NotAuthorizedError,
} from '../utils';
import { User } from '../models';

/**
 * Check if the user is authenticated to access protected route.
 * If the user is authenticated successfully, the request object will
 * have user data and jwt token (req.user, req.token)
 */
export const authenticationChecker: MiddlewareHandler = catchAsync(
  async (req: CustomRequest, res, next) => {
    // Get token and check if it exists
    let token;
    const auth = req.headers.authorization;

    if (auth && auth.startsWith('Bearer')) token = auth.split(' ')[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;
    if (!token) return next(new NotAuthorizedError(ErrMsg.Unauthenticated));

    // Verify token
    if (!process.env.JWT_SECRET)
      return next(new AppError(ErrMsg.MissingDataForJWT, 500));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findOneByIdAndToken(decoded.id, token);
    if (!user)
      return next(new NotAuthorizedError(ErrMsg.JwtNotFoundUserWithToken));

    // User is authenticated
    req.user = user;
    req.token = token;
    next();
  }
);
