import mongoose, { ModelPopulateOptions } from 'mongoose';
import { ErrMsg, RequestStatus } from '../../common';
import {
  catchAsync,
  MiddlewareHandler,
  Model,
  ModelAttribute,
  NotFoundError,
  QueryFeatures,
} from '../utils';

type CRUD_handler = (
  Model: Model<ModelAttribute, mongoose.Document>,
  populateOptions?: ModelPopulateOptions | ModelPopulateOptions[]
) => MiddlewareHandler;

/**
 * Returns a middleware function (last in the middleware stack) that creates an instance of the Model with the request body
 * @param Model A Mongoose Model
 */
export const createOne: CRUD_handler = Model =>
  catchAsync(async (req, res, next) => {
    const doc = Model.build(req.body);
    await doc.save();

    res.status(201).json({ status: RequestStatus.Success, data: doc });
  });

/**
 * Returns a middleware function (last in the middleware stack) that finds a document of the Model based on the request parameter `id`
 * @param Model A Mongoose Model
 * @param populateOptions options to populate ref fields of the Model
 */
export const getOne: CRUD_handler = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) return next(new NotFoundError(ErrMsg.NoDocWithId));

    res.status(200).json({ status: RequestStatus.Success, data: doc });
  });

export const deleteOne: CRUD_handler = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new NotFoundError(ErrMsg.NoDocWithId));

    res.status(200).json({ status: RequestStatus.Success, data: null });
  });

export const updateOne: CRUD_handler = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new NotFoundError(ErrMsg.NoDocWithId));

    res.status(200).json({ status: RequestStatus.Success, data: doc });
  });

export const getAll: CRUD_handler = Model =>
  catchAsync(async (req, res, next) => {
    // Add features to the query if there's any
    // @ts-ignore
    const filter = req.filter ? req.filter : {};

    const queryWithFeatures = new QueryFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .selectFields()
      .paginate();

    // Execute the query to get documents
    const docs = await queryWithFeatures.query;

    res.status(200).json({
      status: RequestStatus.Success,
      length: docs.length,
      data: docs,
    });
  });
