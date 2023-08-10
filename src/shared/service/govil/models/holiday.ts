interface Error {
  __type: string;
  message: string;
}

interface Record {
  _id: number;
  Name: string;
  ShortDescription: string;
  FullDescription: string;
  HebrewDate: string;
  HolidayStart: string;
  HolidayEnds: string;
}

interface Field {
  _id: number;
  type: string;
}

interface Links {
  start: string;
  next: string;
}

interface Result {
  include_total: boolean;
  limit: number;
  records_format: string;
  resource_id: string;
  total_estimation_threshold: any;
  records: Array<Record>;
  fields: Array<Field>;
  _links: Links;
  total: number;
  total_was_estimated: boolean;
}

export interface Holiday {
  help: string;
  success: boolean;
  result: Result;
  error: Error;
}
