import type { ConversationStatus } from '../../conversation/models';
import type { UserLocation } from '../../../user/models';
import type { BaseDate, ValueOf } from '../../../../shared/models';
import type { ProfileBaseDetails } from '../../../employee/models';
import type { BaseJobPosition } from '../../position/models';
import { EventRouteNames } from '../constants';

export interface CalendarEvent {
  dateFrom: BaseDate;
  dateTo: BaseDate;
  title: string;
  jobType?: string;
  status?: ConversationStatus['type'];
  location?: UserLocation;
  routeName?: ValueOf<typeof EventRouteNames>;
  jobOwner?: ProfileBaseDetails;
  positions: Array<BaseJobPosition & { participants: Array<ProfileBaseDetails> }>;
}
