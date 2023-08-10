import type { ListSkillsReq, DocumentOption, DocumentSkills } from './models';
import type { BaseOptionsResponse, BaseItem } from '../../shared/models';
import { LIST_CLASSIFICATIONS, LIST_SKILLS } from './job.map';
import { DbCollection } from '../../shared/service/mongodb/constants';
import mongoDbService from '../../shared/service/mongodb/mongo-db.service';
import { $match, $project, $translate } from '../../shared/service/mongodb/helpers';

const jobService: Record<any, any> = {
  [LIST_SKILLS]: async (payload: ListSkillsReq, language?: string): Promise<BaseOptionsResponse> => {
    const groups = Array.isArray(payload.groups) ? payload.groups : [payload.groups];

    const skills = await mongoDbService.findAll<DocumentSkills, BaseItem<string>>(DbCollection.SKILLS, [
      $match({ group: { $in: groups } }),
      $translate('title', language),
      $project({ _id: 0, value: 1, title: 1 }),
    ]);

    return { returnCode: skills.length ? 0 : 1, options: skills };
  },

  [LIST_CLASSIFICATIONS]: async (query?: string, language?: string): Promise<BaseOptionsResponse> => {
    const types = await mongoDbService.findAll<DocumentOption, BaseItem<string>>(DbCollection.JOB_TYPE, [
      $translate('title', language),
      $project({ _id: 0, value: 1, title: 1 }),
    ]);

    return {
      returnCode: 0,
      options: types,
    };
  },
};

export default jobService;
