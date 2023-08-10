const DEBOUNCE: any = {};
export function debounce(fn: Function, delay: number = 500, id: number | string = 0): void {
  clearTimeout(DEBOUNCE[id]);
  DEBOUNCE[id] = null;
  return ((...args) => {
    DEBOUNCE[id] = setTimeout(() => {
      delete DEBOUNCE[id];
      fn(...args);
    }, delay);
  })();
}

export function typeOf(obj: any): string | undefined {
  const type: any = /[\s-]\w+(|])/.exec(Object.prototype.toString.call(obj))![0].trim();
  return type[0].trim() || undefined;
}

export function deepClone(value: any): any {
  if (typeOf(value) === 'Array' || typeOf(value) === 'Object') {
    if (typeOf(value) === 'Array') value = [...value];
    if (typeOf(value) === 'Object') value = { ...value };
    for (const key in value) {
      value[key] = deepClone(value[key]);
    }
  }
  return value;
}

export function sortArrayByIds(arrayToSort: Array<any>, arrayOfIds: Array<string>, sortByKey: string = 'id'): Array<any> {
  return arrayToSort.sort((a, b) => arrayOfIds.indexOf(a[sortByKey]) - arrayOfIds.indexOf(b[sortByKey]));
}

export function makeId(length = 20): string {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function sentenceToKebabCase(str: string) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    ?.join('-');
}

export function sentenceToCamelCase(str: string) {
  return str
    .replace(/^\w|[A-Z]|\b\w/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

export function camelCaseToSentence(str: string, isOnlyFirst = true) {
  const path = str.split(',');
  return path
    .map((key) =>
      key.replace(/[A-Z]/g, (letter) => (isOnlyFirst ? ` ${letter.toLowerCase()}` : ` ${letter}`)).replace(/[a-z]/, (letter) => letter.toUpperCase())
    )
    .join(' > ');
}
