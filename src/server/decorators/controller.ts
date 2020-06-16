import 'reflect-metadata';
import { ResourceRoutes } from '../../common';
import {
  AppRouter,
  HTML_Methods,
  MetadataKeys,
  MiddlewareHandler,
} from '../utils';

export function controller(resourceRoute: ResourceRoutes) {
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

      if (route)
        router[method](
          `${resourceRoute}${route}`,
          ...middlewares,
          routeHandler
        );
    }
  };
}
