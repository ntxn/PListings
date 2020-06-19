import { Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { UserDoc } from '../models';
import { AppError } from '../utils';
import { ErrMsg, RequestStatus } from '../../common';

/**
 * Create a JWT token with userId as payload
 * @param id userId from user document
 */
const createToken = (id: mongoose.Types.ObjectId): string => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN)
    throw new AppError(ErrMsg.MissingDataForJWT, 500);

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Create cookie options with an expiring date
 */
const createCookieOptions = () => {
  if (
    !process.env.JWT_COOKIE_EXPIRES_IN ||
    typeof parseInt(process.env.JWT_COOKIE_EXPIRES_IN) !== 'number'
  )
    throw new AppError(ErrMsg.MissingDataForCookie, 500);

  return {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
};

/**
 * Get token from helper method createToken, save newly created token to user's token list.
 * Attach token to cookie and send it back to User
 */
export const createSendCookieWithToken = async (
  res: Response,
  statusCode: number,
  user: UserDoc
): Promise<void> => {
  const token = createToken(user.id);
  if (user.tokens.length > 0) user.removeExpiredTokens();
  user.tokens.push({ token });
  await user.save({ validateBeforeSave: false });

  res.cookie('jwt', token, createCookieOptions());

  res.status(statusCode).json({ status: RequestStatus.Success, data: user });
};

export const removeSendExpiredCookieToken = async (
  res: Response,
  statusCode: number,
  user: UserDoc,
  newTokens: { token: string }[]
): Promise<void> => {
  user.tokens = newTokens;
  if (user.tokens.length > 0) user.removeExpiredTokens();
  await user.save({ validateBeforeSave: false });

  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(statusCode).json({ status: RequestStatus.Success, data: null });
};
