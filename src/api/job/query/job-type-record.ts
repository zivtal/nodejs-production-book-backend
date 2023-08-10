import type { DocumentOption } from '../models';
import type { DbResponse, MongoDbScheme } from '../../../shared/service/mongodb/models';
import type { BaseItem } from '../../../shared/models';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { $lookup, $project, useTranslateQuery } from '../../../shared/service/mongodb/helpers';

export const jobTypeRecord = (
  language?: string,
  localField: string = 'jobType',
  scheme: MongoDbScheme<BaseItem & DbResponse> = { _id: 0, title: 1, value: 1 }
): Record<string, any> =>
  $lookup({
    from: DbCollection.JOB_TYPE,
    localField,
    foreignField: 'value',
    pipeline: [useTranslateQuery<DocumentOption>('title', language), $project(scheme)],
  });
