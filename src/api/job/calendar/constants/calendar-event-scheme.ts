import type { MongoDbScheme } from '../../../../shared/service/mongodb/models';
import type { CalendarEvent } from '../models';

export const CALENDAR_EVENT_SCHEME: MongoDbScheme<CalendarEvent> = {
  title: 1,
  jobType: 1,
  dateFrom: 1,
  dateTo: 1,
  status: 1,
  location: 1,
  routeName: 1,
  jobOwner: 1,
  positions: 1,
};
