import fs from 'fs';
import path from 'path';

import { Request, Response, NextFunction } from 'express';
import { Listing } from '../models';
import { controller, GET, POST, PATCH, DELETE, use } from '../decorators';
import {
  authenticationChecker,
  accessRestrictor,
  getAll,
  createOne,
  deleteOne,
} from '../middlewares';
import { Base, Routes, UserRole, ErrMsg, RequestStatus } from '../../common';
import {
  MiddlewareHandler,
  CustomRequest,
  catchAsync,
  NotFoundError,
  NotAuthorizedError,
  multerUpload,
  resizeImage,
} from '../utils';

const listingProps = [
  'title',
  'photos',
  'price',
  'category',
  'subcategory',
  'location',
  'condition',
  'description',
  'brand',
];

/**
 * A middleware to set default filtering and sorting options if there's no query provided
 */
const defaultFilterAndSort: MiddlewareHandler = (req, res, next) => {
  if (!req.query) req.query = { sort: '-createdAt' };
  else if (!req.query.sort) req.query.sort = '-createdAt';
  next();
};

/**
 * A middleware to get only active listings in addition to the request query requirements
 */
const filterOutInactiveListings: MiddlewareHandler = (req, res, next) => {
  req.query = { ...req.query, active: 'true' };
  next();
};

/**
 * A middleware to only allow certain fields when creating a new listing or update a listing.
 * This is to prevent malicious users from inserting fields that they are not
 * supposed to be editing such as featured (a paid service that they will be
 * able to use for free if they can change featured to true by themselves).
 */
const prepListingReqBody = (...allowedProps: string[]): MiddlewareHandler => {
  return (req: CustomRequest, res, next) => {
    const body: { [field: string]: any } = {};
    allowedProps.forEach(field => {
      if (field === 'location' && req.body.coordinates)
        body.location = { coordinates: req.body.coordinates };
      else if (field === 'owner') body.owner = req.user!.id;
      else if (req.body[field]) body[field] = req.body[field];
    });

    req.body = body;
    next();
  };
};

/**
 * A middleware to check if the current user owns the listing ID in request params
 */
const listingOwnerChecker: MiddlewareHandler = catchAsync(
  async (req: CustomRequest, res, next) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(new NotFoundError(ErrMsg.NoDocWithId));

    if (listing!.owner.id !== req.user!.id)
      return next(
        new NotAuthorizedError(
          ErrMsg.UnauthorizedToMadeChangesToOtherUsersListings
        )
      );

    next();
  }
);

/**
 * A middleware to esize all photos added to a listing
 */
const resizeListingPhotos = catchAsync(
  async (req: CustomRequest, res, next) => {
    if (!req.files) return next();

    (req.files as Express.Multer.File[]).forEach(async (file, i) => {
      req.body.photos.push(`listing-${req.user!.id}-${Date.now()}.jpeg`);
      await resizeImage(file.buffer, 600, 600, 'listings', req.body.photos[i]);
    });
    next();
  }
);

/**
 * Middleware to parse string to array or object.
 * When array/object is passed in a FormData obj, it has to be stringified
 */
const parseStrData: MiddlewareHandler = (req, res, next) => {
  req.body.location = JSON.parse(req.body.location);

  req.body.photos =
    req.body.photos && req.body.photos.length > 0
      ? JSON.parse(req.body.photos)
      : [];

  if (req.body.deletedImages) {
    const deletedImages = JSON.parse(req.body.deletedImages) as string[];
    deletedImages.forEach(filename =>
      fs.unlink(path.join('public/img/users', filename), err => {
        console.log(`Issue with deleting old listing photos from db`, err);
      })
    );
    delete req.body.deletedImages;
  }

  next();
};

/**
 * Handlers for listings' routes
 */
@controller(Base.Listings)
class ListingController {
  /**
   * Allows admin to delete a user's listing in case it is a scam.
   */
  @use(deleteOne(Listing))
  @use(accessRestrictor(UserRole.Admin))
  @use(authenticationChecker)
  @DELETE(Routes.ListingProtected)
  deleteListingByAdmin(req: Request, res: Response): void {}

  /**
   * Get all active listings in db
   */
  @use(getAll(Listing))
  @use(filterOutInactiveListings)
  @use(defaultFilterAndSort)
  @GET(Routes.Listings)
  getAllListing(req: Request, res: Response): void {}

  /**
   * Get a single listings based on the listing id in the request params.
   * Increments visits by 1 for every request that is not made by the listing's owner
   */
  @GET(Routes.Listing)
  getListing(req: CustomRequest, res: Response, next: NextFunction): void {
    catchAsync(async (req: CustomRequest, res, next) => {
      const listing = await Listing.findById(req.params.id);

      if (!listing) return next(new NotFoundError(ErrMsg.NoDocWithId));

      if (!req.user || (req.user && req.user.id !== listing.owner.id))
        listing.visits += 1;
      await listing.save();

      res.status(200).json({ status: RequestStatus.Success, data: listing });
    })(req, res, next);
  }

  /**
   * Current logged in user can create a listing.
   * Required properties to create a listing: title, photos, price,
   * category, subcategory, location, condition, description, brand, owner
   */
  @use(createOne(Listing))
  @use(resizeListingPhotos)
  @use(parseStrData)
  @use(prepListingReqBody(...listingProps, 'owner'))
  @use(multerUpload.array('newImages'))
  @use(authenticationChecker)
  @POST(Routes.Listings)
  createListing(req: Request, res: Response): void {}

  /**
   * User can edit their own listing
   */
  @use(prepListingReqBody(...listingProps))
  @use(listingOwnerChecker)
  @use(authenticationChecker)
  @PATCH(Routes.Listing)
  updateListing(req: Request, res: Response, next: NextFunction): void {
    catchAsync(async (req, res, next) => {
      const listing = await Listing.findById(req.params.id);
      if (!listing) return next(new NotFoundError(ErrMsg.NoDocWithId));

      Object.keys(req.body).forEach(
        // @ts-ignore
        field => (listing[field] = req.body[field])
      );
      await listing!.save();

      res.status(200).json({ status: RequestStatus.Success, data: listing });
    })(req, res, next);
  }

  /**
   * User can delete their own listing
   */
  @use(deleteOne(Listing))
  @use(listingOwnerChecker)
  @use(authenticationChecker)
  @DELETE(Routes.Listing)
  deleteListing(req: Request, res: Response): void {}
}
