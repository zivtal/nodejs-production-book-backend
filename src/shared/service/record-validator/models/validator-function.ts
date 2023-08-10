export type ValidatorFunction<T = any> = (value?: T, ...arg: Array<any>) => [boolean, string?, (string | number | Array<string>)?];
