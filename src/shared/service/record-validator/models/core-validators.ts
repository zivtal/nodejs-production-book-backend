import { TypeOf } from '../../../models';

type Message = string | null;
type Type = TypeOf | Array<TypeOf>;
type Equal = number | string | Record<string, any> | Array<number | string>;
type RegEx = RegExp | Array<RegExp | [RegExp, string?]>;
type CheckMode = 'every' | 'some';

export interface CoreValidators {
  type: [Type, Message?];
  required: [true, string?];
  equal: [Equal, Message?, { valueReturn?: true }?];
  length: [number, Message?];
  maxLength: [number, Message?];
  minLength: [number, Message?];
  max: [number, Message?];
  min: [number, Message?];
  regex: [RegEx, Message?, { checkMode?: CheckMode; valueReturn?: true }?];
}
