import type { CalendarEvent, GetCalendarEventsReq, GetCalendarEventsRes, GetUpcomingEventsReq, GetUpcomingEventsRes } from './models';
import type { BaseId } from '../../../shared/models';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { GET_CALENDAR_EVENTS, GET_UPCOMING_EVENTS } from '../job.map';
import AuthorizationError from '../../../shared/composables/middleware/errors/authorization-error';
import { AuthErrors } from '../../auth/auth.errors.enum';
import RecordValidator from '../../../shared/service/record-validator';
import calendarQuery from './calendar.query';
import mongoDbService from '../../../shared/service/mongodb/mongo-db.service';

const calendarService: Record<any, any> = {
  [GET_CALENDAR_EVENTS]: async (payload: GetCalendarEventsReq, language: string, userId?: BaseId): Promise<GetCalendarEventsRes> => {
    if (!userId) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const minYear = new Date().getFullYear() - 10;
    const maxYear = new Date().getFullYear() + 10;

    const validator = new RecordValidator<GetCalendarEventsReq>(
      payload,
      [
        ['year', { required: [true], type: ['Number'], min: [minYear], max: [maxYear] }],
        ['month', { required: [true], type: ['Number'], min: [1], max: [12] }],
        ['status', { type: ['Array'] }],
        ['type', { type: ['Array'] }],
      ],
      { year: 1, month: 1, status: 1, type: 1 }
    );

    const dateFrom = new Date(validator.results.year, validator.results.month - 1).valueOf();
    const dateTo = new Date(validator.results.year, validator.results.month).valueOf();

    const events = await mongoDbService.findAll<CalendarEvent>(
      DbCollection.JOBS,
      calendarQuery[GET_CALENDAR_EVENTS](userId, { dateFrom, dateTo, payload: validator.results })
    );

    return {
      events,
      ...validator.results,
      returnCode: 0,
    } as GetCalendarEventsRes;
  },

  [GET_UPCOMING_EVENTS]: async ({ page }: GetUpcomingEventsReq, language: string, userId?: BaseId): Promise<GetUpcomingEventsRes> => {
    if (!userId) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const now = new Date();
    const dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();

    return await mongoDbService.find<CalendarEvent>(DbCollection.JOBS, calendarQuery[GET_UPCOMING_EVENTS](userId, { dateFrom }), { page });
  },
};

export default calendarService;
