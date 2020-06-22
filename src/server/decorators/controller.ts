import 'reflect-metadata';
import { Base, ErrMsg } from '../../common';
import {
  AppError,
  AppRouter,
  HTML_Methods,
  MetadataKeys,
  MiddlewareHandler,
  PropsAndValidators,
} from '../utils';

/**
 * Validate if all required props are in the request body and run specific validator
 * for each prop if provided
 * @param props Required body properties (Array of strings)
 */
const getBodyValidators = (
  propsAndValidators: PropsAndValidators
): MiddlewareHandler => {
  return function (req, res, next) {
    // No body props needed to be validated
    if (propsAndValidators.length === 0) return next();

    // Check if req.body contains the required props
    if (!req.body) return next(new AppError(ErrMsg.InvalidRequest, 400));

    const missingProps = propsAndValidators.filter(
      ({ prop }) => !req.body[prop]
    );

    if (missingProps.length > 0) {
      const errors = missingProps.map(({ prop }) => {
        return {
          field: prop,
          message: `Please enter your ${prop}`,
        };
      });
      return next(new AppError(ErrMsg.MissingProperties, 400, errors));
    }

    // Run additional validator for each prop if provided
    const propsWithValidators = propsAndValidators.filter(
      ({ validator }) => validator
    );
    const propsFailedValidation = propsWithValidators.filter(
      ({ prop, validator }) => !validator!(req.body[prop])
    );

    if (propsFailedValidation.length > 0) {
      const errors = propsFailedValidation.map(({ prop, message }) => {
        return { field: prop, message };
      });
      // @ts-ignore
      return next(new AppError(ErrMsg.ValidationError, 400, errors));
    }

    // Pass all validation step
    next();
  };
};

/**
 * A class decorator for controllers. It runs through all method decorators, gathers all metadata
 * and then register routes with express app, and the corresponding handlers for each route based
 * on the controller classes' methods.
 * @param resourceRoute base route of a resource. Ex: /api/v1/users
 */
export function controller(resourceRoute: Base) {
  return function (target: any): void {
    const router = AppRouter.instance;

    for (const functionName in target.prototype) {
      const routeHandler = target.prototype[functionName];
      const route = Reflect.getMetadata(
        MetadataKeys.route,
        target.prototype,
        functionName
      );

      const method: HTML_Methods = Reflect.getMetadata(
        MetadataKeys.method,
        target.prototype,
        functionName
      );

      const middlewares: MiddlewareHandler[] =
        Reflect.getMetadata(
          MetadataKeys.middleware,
          target.prototype,
          functionName
        ) || [];

      const requiredPropsAndValidators: PropsAndValidators =
        Reflect.getMetadata(
          MetadataKeys.validator,
          target.prototype,
          functionName
        ) || [];
      const validators = getBodyValidators(requiredPropsAndValidators);

      if (route)
        router[method](
          `${resourceRoute}${route}`,
          ...middlewares,
          validators,
          routeHandler
        );
    }
  };
}
