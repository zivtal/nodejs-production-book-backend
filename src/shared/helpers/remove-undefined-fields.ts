export const removeUndefinedFields = <T>(source: T, fields: Array<keyof Partial<T>>): Partial<T> =>
  fields.reduce((fields: Partial<T>, key) => (source[key] === undefined ? fields : { ...fields, [key]: source[key] }), {});
