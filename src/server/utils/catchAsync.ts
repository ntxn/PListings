import { MiddlewareHandler, AsyncMiddlewareHandler } from './interfaces';

/**
 * Wraps the asynchronous Middleware handler with a catch phrase to handle rejections
 * @param callback an asynchorous middleware handler
 */
export const catchAsync = (
  callback: AsyncMiddlewareHandler
): MiddlewareHandler => (req, res, next) =>
  callback(req, res, next).catch(next);
