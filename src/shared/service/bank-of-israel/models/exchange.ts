import type { BaseDate } from '../../../models';

export interface Exchange {
  from: string;
  to: string;
  updatedAt: BaseDate;
}
