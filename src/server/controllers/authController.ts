import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import {
  controller,
  defineBodyProps,
  use,
  GET,
  POST,
  PATCH,
} from '../decorators';
import { Routes, ResourceRoutes, ErrMsg } from '../../common';
import {
  catchAsync,
  CustomRequest,
  BadRequestError,
  createSendCookieWithToken,
  removeSendExpiredCookieToken,
} from '../utils';
import { User } from '../models';
import { authenticationChecker } from '../middlewares';

/**
 * Controller which create routes and handlers for app authentication related
 */
@controller(ResourceRoutes.Auth)
class AuthController {
  /**
   * Route and Handler for signing user up
   */
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

  /**
   * Route and Handler to log user in
   */
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

      user.removeExpiredTokens();
      await user.save({ validateBeforeSave: false });

      await createSendCookieWithToken(res, 200, user);
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

  /**
   * Log out from the current logged in device
   */
  @GET(Routes.LogOut)
  @use(authenticationChecker)
  logout(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      await removeSendExpiredCookieToken(
        res,
        req.user!,
        req.user!.tokens.filter(({ token }) => token !== req.token)
      );
    })(req, res, next);
  }

  /**
   * Log out from all devices
   */
  @GET(Routes.LogOutAll)
  @use(authenticationChecker)
  logoutAll(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      await removeSendExpiredCookieToken(res, req.user!, []);
    })(req, res, next);
  }
}
