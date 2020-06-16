import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { controller, defineBodyProps, GET, POST, PATCH } from '../decorators';
import { Routes, ResourceRoutes, ErrMsg } from '../../common';
import { User, UserDoc } from '../models';
import { catchAsync, AppError, BadRequestError } from '../utils';

/**
 * Create a JWT token with userId as payload
 * @param id userId from user document
 */
const createToken = (id: mongoose.Types.ObjectId): string => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN)
    throw new AppError('Not Found data needed for creating JWT', 500);

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
    throw new AppError('Not Found required data to generate cookie', 500);

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
const createSendCookieWithToken = async (
  res: Response,
  statusCode: number,
  user: UserDoc
) => {
  const token = createToken(user.id);
  user.tokens.push({ token });
  await user.save({ validateBeforeSave: false });

  res.cookie('jwt', token, createCookieOptions());

  res.status(statusCode).json({
    status: 'success',
    data: user,
  });
};

/**
 * Controller which create routes and handlers for app authentication related
 */
@controller(ResourceRoutes.Auth)
class AuthController {
  /** Route and Handler for signing user up */
  @POST(Routes.SignUp)
  signup(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      // Create new User
      const { name, email, password, passwordConfirm } = req.body;
      const user = User.build({
        name,
        email,
        password,
        passwordConfirm,
      });
      await user.save();

      await createSendCookieWithToken(res, 201, user);
    })(req, res, next);
  }

  /** Route and Handler to log user in */
  @POST(Routes.LogIn)
  @defineBodyProps(
    {
      prop: 'email',
      validator: validator.isEmail,
      message: ErrMsg.EmailInvalid,
    },
    {
      prop: 'password',
      validator: (pass: string) => pass.length >= 8,
      message: ErrMsg.PasswordMinLength,
    }
  )
  login(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      // Find existing user and compare password
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.correctPassword!(password)))
        return next(new BadRequestError('Invalid Credentials'));

      await createSendCookieWithToken(res, 201, user);
    })(req, res, next);
  }

  @POST(Routes.ForgotPassword)
  sendResetPasswordToken(req: Request, res: Response): void {
    res.send('Forgot password, Send reset password token');
  }

  @PATCH(Routes.ResetPassword)
  resetPassword(req: Request, res: Response): void {
    res.send('resetPassword');
  }

  // User-authorized Routes
  @GET(Routes.LogOut)
  logout(req: Request, res: Response): void {
    res.send('Log Out');
  }
}
