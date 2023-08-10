export interface BaseItem<T = any> {
  title: string;
  value: T;
  icon?: string;
  count?: number;
}
