import { RecordValidators } from './record-validators';

export type Validation<T> = [keyof Partial<T> | Array<keyof Partial<T>>, RecordValidators, string?];

export type Validations<T> = Array<Validation<T>>;
