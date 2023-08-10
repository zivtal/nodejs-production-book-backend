import type { BaseResponse } from '../../../../shared/models';
import type { CalendarEvent } from './calendar-event';
import type { GetCalendarEventsReq } from './get-calendar-events-req';

export interface GetCalendarEventsRes extends GetCalendarEventsReq, BaseResponse {
  events: Array<CalendarEvent>;
}
