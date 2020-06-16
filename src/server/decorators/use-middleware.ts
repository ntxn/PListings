import 'reflect-metadata';
import { MiddlewareHandler, MetadataKeys } from '../utils';

export function use(middleware: MiddlewareHandler): Function {
  return function (target: any, key: string) {
    const middlewares: MiddlewareHandler[] =
      Reflect.getMetadata(MetadataKeys.middleware, target, key) || [];
    middlewares.push(middleware);

    Reflect.defineMetadata(MetadataKeys.middleware, middlewares, target, key);
  };
}
