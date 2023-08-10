import type { Response } from 'express';
import type { GetCalendarEventsReq, GetCalendarEventsRes, GetUpcomingEventsReq } from './models';
import type { BaseRequest } from '../../../shared/models';

import { GET_CALENDAR_EVENTS, GET_UPCOMING_EVENTS } from '../job.map';
import calendarService from './calendar.service';

const calendarController = {
  [GET_CALENDAR_EVENTS]: async (req: BaseRequest<GetCalendarEventsReq>, res: Response<GetCalendarEventsRes>): Promise<void> => {
    const events = await calendarService[GET_CALENDAR_EVENTS](req.body, req.language, req.sender?.id);

    res.send(events);
  },

  [GET_UPCOMING_EVENTS]: async (req: BaseRequest<GetUpcomingEventsReq>, res: Response<GetCalendarEventsRes>): Promise<void> => {
    const events = await calendarService[GET_UPCOMING_EVENTS](req.body, req.language, req.sender?.id);

    res.send(events);
  },
};

export default calendarController;
