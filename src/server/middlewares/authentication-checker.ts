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
 * Helper method: process user's token to check if they're logged in
 */
const getloggingStatus = (...errors: NotAuthorizedError[]): MiddlewareHandler =>
  catchAsync(async (req: CustomRequest, res, next) => {
    // If user is already authenticated, then move to the next middlewares
    if (req.user && req.token) return next();

    // Get token and check if it exists
    let token;
    const auth = req.headers.authorization;

    if (auth && auth.startsWith('Bearer')) token = auth.split(' ')[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;
    if (!token) return errors.length > 1 ? next(errors[0]) : next();

    // Verify token
    if (!process.env.JWT_SECRET)
      return next(new AppError(ErrMsg.MissingDataForJWT, 500));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    // @ts-ignore
    const user = await User.findOneByIdAndToken(decoded.id, token);
    if (!user) return errors.length > 1 ? next(errors[1]) : next();

    // User is authenticated
    req.user = user;
    req.token = token;
    next();
  });

/**
 * Check if the user is currently logged in.
 * If they are logged in, attach their user data to req object.
 * If not, move to the next middleware, req.user will be null, no errors
 */
export const getCurrentUser: MiddlewareHandler = getloggingStatus();

/**
 * Check if the user is authenticated to access protected route.
 * If the user is authenticated successfully, the request object will
 * have user data and jwt token (req.user, req.token)
 */
export const authenticationChecker: MiddlewareHandler = getloggingStatus(
  new NotAuthorizedError(ErrMsg.Unauthenticated),
  new NotAuthorizedError(ErrMsg.JwtNotFoundUserWithToken)
);
