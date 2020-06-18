import { ErrorRequestHandler } from 'express';
import { RequestStatus } from '../../common';
import {
  MongooseValidationError,
  MongoDuplicateKeyError,
  MongooseCastError,
  JwtInvalidError,
  JwtExpiredError,
  AppError,
} from '../utils';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const devEnv = process.env.NODE_ENV === 'development';
  let error: AppError;

  if (err.name === 'ValidationError') error = new MongooseValidationError(err);
  else if (err.name === 'CastError') error = new MongooseCastError(err);
  else if (err.name === 'JsonWebTokenError') error = new JwtInvalidError();
  else if (err.name === 'TokenExpiredError') error = new JwtExpiredError();
  else if (err.name === 'MongoError' && err.code === (11000 || 11001))
    error = new MongoDuplicateKeyError(err);
  else error = err;

  console.error('ERROR', error);

  res.status(error.statusCode || 500).json({
    status: error.status || RequestStatus.Fail,
    message:
      devEnv || err.isOperational ? error.message : 'Something went wrong',
    errors: error.errors,
    // stack: devEnv ? err.stack : undefined,
    originalError: devEnv ? err : undefined,
  });
};

export { errorHandler as globalErrorHandler };
