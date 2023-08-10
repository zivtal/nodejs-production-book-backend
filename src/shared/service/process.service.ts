import { uniqueKey } from '../helpers';

export default class ProcessService {
  public static debounce(fn: () => void, id: string, delay = 500): void {
    const key = uniqueKey(id);

    clearTimeout(this.CACHE[key]);
    this.delete(key);

    return ((...args) => {
      this.CACHE[key] = setTimeout(() => {
        this.delete(key);

        fn?.(...args);
      }, delay);
    })();
  }

  public static async delay(fn: () => void, ms?: number): Promise<any> {
    await new Promise((resolve) => setTimeout(resolve, ms || 0));

    return fn();
  }

  private static CACHE: { [key: string]: ReturnType<typeof setTimeout> } = {};

  private static delete(id: string) {
    delete this.CACHE[uniqueKey(id)];
  }
}
