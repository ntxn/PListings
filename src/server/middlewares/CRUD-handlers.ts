import mongoose, { ModelPopulateOptions } from 'mongoose';
// import { Request, Response, NextFunction } from 'express';
import { catchAsync, MiddlewareHandler, Model, ModelAttribute } from '../utils';

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

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

/**
 * Returns a middleware function (last in the middleware stack) that finds a document of the Model based on the request parameter `id`
 * @param Model A Mongoose Model
 * @param populateOptions options to populate ref fields of the Model
 */
export const getOne: CRUD_handler = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // let query = Model.findById(req.params.id);
    // if (populateOptions) query = query.populate(populateOptions);
    // const doc = await query;

    // if (!doc) return next(new AppError('No document found with that ID', 404));

    const doc = await Model.findById(req.params.id); // will delete
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
