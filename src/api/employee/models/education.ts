import type { BaseDate } from '../../../shared/models';

export interface Education {
  degree: string | number;
  school: string;
  fieldOfStudy: string;
  dateFrom: BaseDate;
  dateTo: BaseDate;
}
