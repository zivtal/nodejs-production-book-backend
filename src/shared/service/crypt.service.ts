export default class CryptService {
  public static encrypt(text: string, key: string = this.defaultKey): string {
    const hexLength = ((): number => {
      const max = Math.max(...[...text].map((value) => [...value].map((char) => char.charCodeAt(0))[0]));

      return [...key].reduce((acc, char) => acc * Math.floor(char.charCodeAt(0) / key.length), max).toString(16).length;
    })();

    const step1 = (value: string) => [...value].map((char) => char.charCodeAt(0))[0];
    const step2 = (value: number) => this.keyGenerate(value, key);
    const step3 = (value: number) => ('0'.repeat(hexLength) + value.toString(16)).slice(-hexLength);

    return [...text].map(step1).map(step2).map(step3).join('') + ('0' + hexLength).slice(-2);
  }

  public static decrypt(text: string, key: string = this.defaultKey): string {
    const hexLength = +text.slice(-2);
    const regExp = new RegExp(`.{${hexLength}}`, 'g');
    const step1 = (value: string) => parseInt(value, 16);
    const step2 = (value: number) => this.keyGenerate(value, key, true);
    const step3 = (value: number) => String.fromCharCode(value);

    return (
      text
        .slice(0, text.length - 2)
        .match(regExp)
        ?.map(step1)
        .map(step2)
        .map(step3)
        .join('') || text
    );
  }

  private static defaultKey: string = Math.ceil(Math.sqrt(new Date().getFullYear()) * new Date().getUTCMonth() ** 2) + '';
  private static keyGenerate(value: number, code: string, revert: boolean = false) {
    return [...code].reduce(
      (acc, char) => (revert ? acc / Math.floor(char.charCodeAt(0) / code.length) : acc * Math.floor(char.charCodeAt(0) / code.length)),
      value
    );
  }
}
