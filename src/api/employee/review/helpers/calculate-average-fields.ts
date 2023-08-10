export const calculateAverageFields = <T>(obj: T, fields: Array<keyof T>) => {
  const sum = fields.reduce((sum, key) => sum + Number(obj[key] || 0), 0);

  return sum ? sum / fields.length : 0;
};
