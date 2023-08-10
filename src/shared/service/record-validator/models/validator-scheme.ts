export type ValidatorScheme<T> = { [K in keyof T]: 0 | 1 } | null;
