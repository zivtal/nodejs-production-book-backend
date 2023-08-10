import type { TypeOf } from '../models';

export const typeOf = (obj: any): TypeOf => /(?<=\s)\w+(|])/.exec(Object.prototype.toString.call(obj))![0] as TypeOf;
