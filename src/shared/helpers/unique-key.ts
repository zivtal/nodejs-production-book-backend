const generateKey = (value: string | number = Date.now(), key?: string | number): string =>
  [...('' + value + (key || ''))]
    .reduce((sum: number, char: string, index: number): number => sum + char.charCodeAt(0) ** ((index % 10) + 1), 0)
    .toString(16);

export const uniqueKey = (value: string | number = Date.now(), key?: string | number): string => generateKey(value, key);

export const generateId = (value: string | number) => generateKey('' + Date.now() + value);
