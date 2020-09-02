import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import { controller, use, POST, DELETE, GET } from '../decorators';
import { authenticationChecker } from '../middlewares';
import { Base, ErrMsg, Routes, RequestStatus } from '../../common';
import {
  catchAsync,
  CustomRequest,
  NotFoundError,
  BadRequestError,
  MiddlewareHandler,
} from '../utils';
import { Listing, Favorite } from '../models';

@controller(Base.Favorites)
class FavoriteController {
  /***
   * From the listingIds in the req.body, filter out any ids saved by the current user
   */
  @use(authenticationChecker)
  @POST(Routes.FilterListingsSavedByUser)
  filterProvidedListingsSavedByUser(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      const { listingIds } = req.body;
      const savedListings: Record<string, string> = {};

      await Promise.all(
        (listingIds as string[]).map(async id => {
          const favorite = await Favorite.findOne({
            listing: id,
            user: req.user!.id,
          });
          if (favorite) savedListings[id] = id;
        })
      );

      res
        .status(200)
        .json({ status: RequestStatus.Success, data: savedListings });
    })(req, res, next);
  }

  /**
   * Check if the current user saves a listing
   */
  @GET(Routes.Favorite)
  didUserSaveListing(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      const favorite = req.user
        ? await Favorite.findOne({
            listing: req.params.id,
            user: req.user.id,
          })
        : null;

      res
        .status(200)
        .json({ status: RequestStatus.Success, data: favorite ? true : false });
    })(req, res, next);
  }

  /**
   * Create a Favorite document that contains the listing id (from req.body.listingId)
   * and user id (from req.user).
   * Reject creating a favorite document if the user is the listing owner.
   * Increments number of listing's favorites
   *
   * TODO: write unit test
   */
  @use(authenticationChecker)
  @POST(Routes.Favorites)
  saveListing(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      const listing = await Listing.findById(req.body.listingId);
      if (!listing) return next(new NotFoundError(ErrMsg.NoDocWithId));

      if (listing.owner.id === req.user!.id)
        return next(new BadRequestError(ErrMsg.OwnerCannotFavoriteOwnListing));

      const favorite = Favorite.build({
        user: req.user!.id,
        listing: listing.id,
      });
      await favorite.save();

      listing.favorites = listing.favorites + 1;
      await listing.save();

      res.status(200).json({ status: RequestStatus.Success, data: listing });
    })(req, res, next);
  }

  /**
   * Delete a favorite document - i.e. the current user want to unsave the listing.
   * The current user can only remove the saved listing that they save before.
   * Decrements number of listing's favorites
   *
   * TODO: write unit test
   */
  @use(authenticationChecker)
  @DELETE(Routes.Favorite)
  unsaveListing(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return next(new NotFoundError(ErrMsg.NoDocWithId));

      const favorite = await Favorite.findOneAndDelete({
        user: req.user!.id,
        listing: req.params.id,
      });

      if (favorite) {
        listing.favorites = listing.favorites - 1;
        await listing.save();
      }

      res.status(200).json({ status: RequestStatus.Success, data: listing });
    })(req, res, next);
  }
}
