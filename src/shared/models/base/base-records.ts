import { BasePagination } from './base-pagination';

export interface BaseRecords<T> {
  data: Array<T>;
  page: BasePagination;
  total: number;
}
