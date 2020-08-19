import { Response, NextFunction } from 'express';

import { controller, use, POST, DELETE } from '../decorators';
import { authenticationChecker } from '../middlewares';
import { Base, ErrMsg, Routes, RequestStatus } from '../../common';
import {
  catchAsync,
  CustomRequest,
  NotFoundError,
  BadRequestError,
} from '../utils';
import { Listing, Favorite } from '../models';

@controller(Base.Favorites)
class FavoriteController {
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

      listing.favorites = listing.favorites + 1;
      await listing.save();

      const favorite = Favorite.build({
        user: req.user!.id,
        listing: listing.id,
      });
      await favorite.save();

      res.status(200).json({ status: RequestStatus.Success, data: listing });
    })(req, res, next);
  }
}
