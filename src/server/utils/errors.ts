import mongoose from 'mongoose';
import { DuplicateKeyMongoError } from '../utils';
import { ErrMsg } from '../../common';

abstract class CustomError extends Error {
  isOperational = true;
  errors?: { field: string; message: string }[];
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  get status(): string {
    return `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
  }
}

/** A general Custom Error for the app. It can be instantiated with an error message and a status code */
export class AppError extends CustomError {
  constructor(public message: string, public statusCode: number) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** A general Not Found Error. Can be more specific with an override custom message */
export class NotFoundError extends CustomError {
  statusCode = 404;
  constructor(public message = 'Not Found') {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/** A general Not Authorized Error Can be more specific with an override custom message */
export class NotAuthorizedError extends CustomError {
  statusCode = 401;
  constructor(public message = 'Not Authorized') {
    super(message);
    Object.setPrototypeOf(this, NotAuthorizedError);
  }
}

/** A Custom Error that handles Field Validation Errors from Mongoose for Mongoose Model */
export class MongooseValidationError extends CustomError {
  statusCode = 400;
  constructor(err: mongoose.Error.ValidationError) {
    super('Validation Error');
    Object.setPrototypeOf(this, MongooseValidationError);

    this.errors = Object.keys(err.errors).map(field => {
      const error = err.errors[field];
      const message =
        error instanceof mongoose.Error.ValidatorError
          ? error.properties.message
          : `Invalid ${error.path}: ${error.value}`;
      return { field, message };
    });
  }
}

/** A Custom Error that handles Cast Error from Mongoose */
export class MongooseCastError extends CustomError {
  statusCode = 400;
  constructor(err: mongoose.Error.CastError) {
    super(`Invalid ${err.path}: ${err.value}`);
    Object.setPrototypeOf(this, MongooseCastError);
  }
}

/** A Custom Error that handles Mongo duplicate key error (unique keyword) in indexes */
export class MongoDuplicateKeyError extends CustomError {
  statusCode = 400;
  constructor(err: DuplicateKeyMongoError) {
    super(ErrMsg.DuplicateKey);
    Object.setPrototypeOf(this, MongoDuplicateKeyError);

    const field = Object.keys(err.keyValue)[0];
    const message = `${field} ${err.keyValue[field]} already exists`;

    this.errors = [{ field, message }];
  }
}

/** A Custom Error that handles JWT Invalid token */
export class JwtInvalidError extends CustomError {
  statusCode = 401;
  constructor() {
    super(ErrMsg.JwtInvalid);
    Object.setPrototypeOf(this, JwtInvalidError);
  }
}

/** A Custom Error that handles JWT Expired token */
export class JwtExpiredError extends CustomError {
  statusCode = 401;
  constructor() {
    super(ErrMsg.JwtExpired);
    Object.setPrototypeOf(this, JwtExpiredError);
  }
}
