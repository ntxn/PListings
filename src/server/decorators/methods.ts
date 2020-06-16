import 'reflect-metadata';
import { HTML_Methods, MetadataKeys } from '../utils';
import { Routes } from '../../common';

function bindMethod(method: HTML_Methods) {
  return function (route: Routes) {
    return function (target: any, key: string) {
      Reflect.defineMetadata(MetadataKeys.route, route, target, key);
      Reflect.defineMetadata(MetadataKeys.method, method, target, key);
    };
  };
}

export const GET = bindMethod(HTML_Methods.get);
export const POST = bindMethod(HTML_Methods.post);
export const PATCH = bindMethod(HTML_Methods.patch);
export const PUT = bindMethod(HTML_Methods.put);
export const DELETE = bindMethod(HTML_Methods.delete);
