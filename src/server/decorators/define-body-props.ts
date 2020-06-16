import 'reflect-metadata';
import { MetadataKeys, PropsAndValidators } from '../utils';

export function defineBodyProps(...propsAndValidators: PropsAndValidators) {
  return function (target: any, key: string): void {
    Reflect.defineMetadata(
      MetadataKeys.validator,
      propsAndValidators,
      target,
      key
    );
  };
}
