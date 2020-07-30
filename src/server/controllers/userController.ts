import fs from 'fs';
import path from 'path';

import { Request, Response, NextFunction } from 'express';
import {
  controller,
  use,
  GET,
  PATCH,
  DELETE,
  defineBodyProps,
} from '../decorators';
import {
  Routes,
  Base,
  AccountStatus,
  RequestStatus,
  ErrMsg,
  UserRole,
} from '../../common';
import {
  catchAsync,
  CustomRequest,
  MiddlewareHandler,
  AppError,
  NotFoundError,
  BadRequestError,
  NotAuthorizedError,
  multerUpload,
  resizeImage,
  propLengthValidator,
  createSendCookieWithToken,
  removeSendExpiredCookieToken,
} from '../utils';
import {
  getOne,
  getAll,
  updateOne,
  accessRestrictor,
  authenticationChecker,
} from '../middlewares';
import { User, Listing } from '../models';

const addIdToReqParams: MiddlewareHandler = (req: CustomRequest, res, next) => {
  req.params.id = req.user!.id;
  next();
};

const updatePasswordRestrictor: MiddlewareHandler = (
  req: CustomRequest,
  res,
  next
) => {
  if ('password' in req.body || 'passwordConfirm' in req.body) {
    if (req.user!.id === req.params.id)
      return next(new BadRequestError(ErrMsg.NotPasswordChangeRoute));

    return next(
      new AppError(ErrMsg.PasswordChangeRestrictedToAccountOwner, 403)
    );
  }

  next();
};

const resizeUserPhoto = catchAsync(async (req: CustomRequest, res, next) => {
  if (!req.file) return next();

  req.body.location = JSON.parse(req.body.location);

  req.body.photo = `user-${req.user!.id}-${Date.now()}.jpeg`;
  await resizeImage(req.file.buffer, 300, 300, 'users', req.body.photo);

  fs.unlink(path.join('public/img/users', req.user!.photo!), err => {
    console.log(`Issue with deleting user's previous photo`, err);
  });

  next();
});

/**
 * Controller for User resource routes
 */
@controller(Base.Users)
class UserController {
  /**
   * Get the current logged in user's account
   */
  @use(getOne(User))
  @use(addIdToReqParams)
  @use(authenticationChecker)
  @GET(Routes.MyAccount)
  getMyAccount(req: Request, res: Response): void {}

  /**
   * Update the current logged in user's password.
   * Request body needs to include currentPassword, password, passwordConfirm.
   * After successfully updated the password, all their tokens will be deleted,
   * and a new one will be created for the current logging device/session
   */
  @defineBodyProps(
    propLengthValidator('currentPassword', 8, ErrMsg.PasswordMinLength),
    propLengthValidator('password', 8, ErrMsg.PasswordMinLength),
    propLengthValidator('passwordConfirm', 8, ErrMsg.PasswordMinLength)
  )
  @use(authenticationChecker)
  @PATCH(Routes.UpdateMyPassword)
  updateMyPassword(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      const { currentPassword, password, passwordConfirm } = req.body;
      if (!(await req.user!.correctPassword(currentPassword)))
        return next(new NotAuthorizedError(ErrMsg.InvalidCredentials));

      req.user!.password = password;
      req.user!.passwordConfirm = passwordConfirm;
      await req.user!.save();

      await createSendCookieWithToken(res, 200, req.user!);
    })(req, res, next);
  }

  /**
   * Update the current logged in user's account except password
   */
  @use(updateOne(User))
  @use(resizeUserPhoto)
  @use(multerUpload.single('photo'))
  @use(updatePasswordRestrictor)
  @use(addIdToReqParams)
  @use(authenticationChecker)
  @PATCH(Routes.UpdateMyAccount)
  updateMyAccount(req: Request, res: Response): void {}

  /**
   * Delete the current logged in user's account
   * by switching their account status to inactive.
   * All user's listing will be deleted.
   */
  @use(authenticationChecker)
  @DELETE(Routes.DeleteMyAccount)
  deleteMyAccount(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      req.user!.status = AccountStatus.Inactive;
      req.user!.tokens = [];
      req.user!.save({ validateBeforeSave: false });
      await Listing.deleteMany({ owner: req.user!.id });

      await removeSendExpiredCookieToken(res, 200);
    })(req, res, next);
  }

  /**
   * Get all users.
   * Admin access only
   */
  @use(getAll(User))
  @use(accessRestrictor(UserRole.Admin))
  @use(authenticationChecker)
  @GET(Routes.AllUsersProtected)
  getAllUsers(req: Request, res: Response): void {}

  /**
   * Get a User document based on the provided request params id.
   * Only Admin-users can get user doc of other users
   */
  @use(getOne(User))
  @use(accessRestrictor(UserRole.Admin))
  @use(authenticationChecker)
  @GET(Routes.UserProtected)
  getUser(req: Request, res: Response): void {}

  /**
   * Update a User account based on the provided request params id.
   * Only Admin-users can update other users. However, admin-users
   * cannot update other users' passwords. Only the account owner
   * can update their password.
   */
  @use(updateOne(User))
  @use(updatePasswordRestrictor)
  @use(accessRestrictor(UserRole.Admin))
  @use(authenticationChecker)
  @PATCH(Routes.UserProtected)
  updateUser(req: Request, res: Response): void {}

  /**
   * Delete a User account by switching their account status to Inactive.
   * All user's listing will be deleted.
   * Only Admin-users can deactivate other users's accounts
   */
  @use(accessRestrictor(UserRole.Admin))
  @use(authenticationChecker)
  @DELETE(Routes.UserProtected)
  deleteUser(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      const user = await User.findById(req.params.id);
      if (!user) return next(new NotFoundError(ErrMsg.NoUserWithId));

      user.status = AccountStatus.Inactive;
      user.tokens = [];
      await user.save({ validateBeforeSave: false });

      await Listing.deleteMany({ owner: user.id });

      res.status(200).json({ status: RequestStatus.Success, data: null });
    })(req, res, next);
  }

  /***
   * Get user's public data: name, location, photo, items selling/sold
   */
  @GET(Routes.User)
  getUserPublicProfile(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      const user = await User.findById(req.params.id)
        .populate({
          path: 'listings',
          select: 'title photos sold -owner',
          match: { active: true },
        })
        .select('name location photo listings');

      if (!user) return next(new NotFoundError(ErrMsg.NoUserWithId));

      res.status(200).json({ status: RequestStatus.Success, data: user });
    })(req, res, next);
  }
}
