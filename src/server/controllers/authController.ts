import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import validator from 'validator';

import {
  controller,
  defineBodyProps,
  use,
  GET,
  POST,
  PATCH,
} from '../decorators';
import {
  Routes,
  ResourceRoutes,
  ErrMsg,
  AccountStatus,
  RequestStatus,
} from '../../common';
import {
  catchAsync,
  CustomRequest,
  AppError,
  BadRequestError,
  NotFoundError,
  createSendCookieWithToken,
  removeSendExpiredCookieToken,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  propLengthValidator,
  NotAuthorizedError,
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
      const { name, email, password, passwordConfirm } = req.body;

      // Check if there's a user with the provided email
      const existingUser = await User.findOne({ email });
      if (existingUser)
        switch (existingUser.status) {
          case AccountStatus.Active:
            return next(new BadRequestError(ErrMsg.EmailInUse));
          case AccountStatus.Inactive:
            return next(new BadRequestError(ErrMsg.InactiveAccount));
          case AccountStatus.Suspended:
            return next(new BadRequestError(ErrMsg.SuspendedAccount));
        }

      // Create new User
      const user = User.build({
        name,
        email,
        password,
        passwordConfirm,
      });
      await user.save();

      await sendWelcomeEmail(user.name, user.email);
      await createSendCookieWithToken(res, 201, user);
    })(req, res, next);
  }

  /**
   * Route and Handler to log user in
   */
  @defineBodyProps(
    {
      prop: 'email',
      validator: validator.isEmail,
      message: ErrMsg.EmailInvalid,
    },
    propLengthValidator('password', 8, ErrMsg.PasswordMinLength)
  )
  @POST(Routes.LogIn)
  login(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      // Find existing user and compare password
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.correctPassword!(password)))
        return next(new NotAuthorizedError(ErrMsg.InvalidCredentials));

      switch (user.status) {
        case AccountStatus.Suspended:
          return next(new BadRequestError(ErrMsg.SuspendedAccount));
        case AccountStatus.Inactive:
          user.status = AccountStatus.Active;
          break;
      }

      await createSendCookieWithToken(res, 200, user);
    })(req, res, next);
  }

  /**
   * Send user an email with a reset URL if user forgot their password
   */
  @defineBodyProps({
    prop: 'email',
    validator: validator.isEmail,
    message: ErrMsg.EmailInvalid,
  })
  @POST(Routes.ForgotPassword)
  sendResetPasswordToken(req: Request, res: Response, next: NextFunction) {
    catchAsync(async (req, res, next) => {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return next(new NotFoundError(ErrMsg.NoUserWithEmail));

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

      await user.save({ validateBeforeSave: false });

      const resetURL = `${req.protocol}://${req.get('host')}${
        ResourceRoutes.Auth
      }/reset-password/${resetToken}`;

      // Send reset url to user's email
      try {
        await sendPasswordResetEmail(user.name, user.email, resetURL);
        res.status(200).json({
          status: RequestStatus.Success,
          message: 'Password Reset Link is sent to your email',
        });
      } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError(ErrMsg.SendEmailIssue, 500));
      }
    })(req, res, next);
  }

  /**
   * Reset password by using reset token
   * After password being reset, clear all existing tokens
   * and generate a new one for current device
   */
  @PATCH(Routes.ResetPassword)
  resetPassword(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      // find user with the token in the params
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user)
        return next(new BadRequestError(ErrMsg.ResetTokenInvalidOrExpired));

      // Update user's new password
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetExpires = undefined;
      user.passwordResetToken = undefined;
      await user.save();

      // Log user in
      await createSendCookieWithToken(res, 200, user);
    })(req, res, next);
  }

  /**
   * Log out from the current logged in device
   */
  @use(authenticationChecker)
  @GET(Routes.LogOut)
  logout(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      await removeSendExpiredCookieToken(
        res,
        200,
        req.user!,
        req.user!.tokens.filter(({ token }) => token !== req.token)
      );
    })(req, res, next);
  }

  /**
   * Log out from all devices
   */
  @use(authenticationChecker)
  @GET(Routes.LogOutAll)
  logoutAll(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      await removeSendExpiredCookieToken(res, 200, req.user!, []);
    })(req, res, next);
  }
}
