import type { ValidatorFunction } from './validator-function';

export type CustomValidator<T = any> = ValidatorFunction | ReturnType<ValidatorFunction>;
