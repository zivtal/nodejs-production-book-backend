import type { Response } from 'express';
import type { BaseRequest, BaseOptionsResponse } from '../../shared/models';
import type { ListSkillsReq } from './models';

import jobService from './job.service';
import { LIST_CLASSIFICATIONS, LIST_SKILLS } from './job.map';
import positionController from './position/position.controller';
import conversationController from './conversation/conversation.controller';
import postJobController from './post-job/post-job.controller';
import calendarController from './calendar/calendar.controller';

const jobController = {
  [LIST_SKILLS]: async (req: BaseRequest<ListSkillsReq>, res: Response<BaseOptionsResponse>): Promise<void> => {
    const skills = await jobService[LIST_SKILLS](req.body, req.language);

    res.send(skills);
  },

  [LIST_CLASSIFICATIONS]: async (req: BaseRequest<{ value?: string }>, res: Response<BaseOptionsResponse>): Promise<void> => {
    const types = await jobService[LIST_CLASSIFICATIONS](req.body.value, req.language);

    res.send(types);
  },

  ...postJobController,
  ...positionController,
  ...conversationController,
  ...calendarController,
};

export default jobController;
