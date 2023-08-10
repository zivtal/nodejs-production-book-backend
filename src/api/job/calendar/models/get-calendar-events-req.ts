import { ConversationStatusType } from '../../conversation/constants';
import { CalendarEventType } from '../constants';

export interface GetCalendarEventsReq {
  year: number;
  month: number;
  status?: Array<ConversationStatusType>;
  type?: Array<CalendarEventType>;
}
