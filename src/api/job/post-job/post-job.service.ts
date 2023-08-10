import type {
  BasePostJob,
  CreatePostJobReq,
  DocumentJob,
  GetJobDetailsRes,
  JobSearchPostJobsReq,
  SearchPostJobRes,
  UpdateJobPositionReq,
  UpdatePostJobReq,
} from './models';
import type { CreateJobPosition } from '../position/models';
import type { BaseId, BaseRecords, BaseResponse } from '../../../shared/models';
import { type InsertOneResult, type ObjectId } from 'mongodb';

import {
  CREATE_JOB_POSITION,
  CREATE_JOB_POST,
  GET_JOB_DETAILS,
  REMOVE_JOB_POSITION,
  SEARCH_JOB_POSTS,
  UPDATE_JOB_POSITION,
  UPDATE_JOB_POST,
} from '../job.map';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { NotificationType } from '../../notification/constants';
import notificationService from '../../notification/notification.service';
import { SET_NOTIFICATION } from '../../notification/notification.maps';
import { CREATE_POST_JOB_SCHEME, UPDATE_POST_JOB_SCHEME } from './constants';
import RegexPattern from '../../../shared/constants/regex-pattern';
import RecordValidator, { coordinateValidator, mongoIdValidator, ValidationMessage } from '../../../shared/service/record-validator';
import { positionValidator } from './helpers';
import { LENGTH } from '../../../shared/constants';
import { $toObjectId } from '../../../shared/service/mongodb/helpers';
import mongoDbService from '../../../shared/service/mongodb/mongo-db.service';
import postJobQuery from './post-job.query';

const postJobService = {
  [CREATE_JOB_POST]: async (payload: CreatePostJobReq, userId: BaseId): Promise<BaseResponse & InsertOneResult<DocumentJob>> => {
    const validator = new RecordValidator<CreatePostJobReq, CreatePostJobReq>(
      payload,
      [
        [['title', 'jobType'], { required: [true] }],
        ['positions', { required: [true], custom: [positionValidator] }],
        [['dateTo', 'dateFrom'], { required: [true], regex: [RegexPattern.TIMESTAMP, ValidationMessage.INVALID_TIMESTAMP] }],
        ['location', { required: [true], custom: [coordinateValidator] }],
        ['maxDistance', { required: [true], regex: [RegexPattern.NUMBER] }],
      ],
      CREATE_POST_JOB_SCHEME,
      { skipUndefined: true }
    );

    const { positions, maxDistance, ...job } = validator.results;

    const res = await mongoDbService.insertOne<BasePostJob & { userId: ObjectId }>(DbCollection.JOBS, {
      ...job,
      ...(maxDistance ? { maxDistance: maxDistance * 1000 } : {}),
      userId: $toObjectId(userId),
    });

    await Promise.all(
      positions.map(async (position): Promise<BaseResponse> => await postJobService[CREATE_JOB_POSITION]({ ...position, jobId: res.insertedId }))
    );

    return res;
  },

  [UPDATE_JOB_POST]: async (payload: UpdatePostJobReq, userId: BaseId): Promise<void> => {
    const validator = new RecordValidator<UpdatePostJobReq>(
      payload,
      [
        ['_id', { required: [true], custom: [mongoIdValidator] }],
        ['positions', { custom: [positionValidator] }],
        [['dateTo', 'dateFrom'], { regex: [RegexPattern.TIMESTAMP, ValidationMessage.INVALID_TIMESTAMP] }],
        ['location', { custom: [coordinateValidator] }],
        ['maxDistance', { regex: [RegexPattern.NUMBER] }],
      ],
      UPDATE_POST_JOB_SCHEME,
      { skipUndefined: true }
    );

    const { positions, deleted, maxDistance, ...job } = validator.results;
    await Promise.all((positions || []).map((position): Promise<BaseResponse> => postJobService[UPDATE_JOB_POSITION](payload._id, position)));
    await Promise.all((deleted || []).map((id): Promise<BaseResponse> => postJobService[REMOVE_JOB_POSITION](id)));

    await mongoDbService.updateOne(
      DbCollection.JOBS,
      {
        _id: $toObjectId(payload._id),
        userId: $toObjectId(userId),
      },
      { $set: { ...job, ...(maxDistance ? { maxDistance: maxDistance * 1000 } : {}) } }
    );
  },

  [CREATE_JOB_POSITION]: async (payload: CreateJobPosition): Promise<BaseResponse> => {
    const validator = new RecordValidator<CreateJobPosition>(
      payload,
      [
        ['type', { required: [true] }],
        ['amount', { required: [true], min: [1, ValidationMessage.MIN], regex: [RegexPattern.NUMBER, ValidationMessage.INVALID] }],
        ['comment', { maxLength: [LENGTH.COMMENT, ValidationMessage.MAX_LENGTH] }],
      ],
      { type: 1, amount: 1, jobId: 1, comment: 1 }
    );

    const { insertedId, returnCode } = await mongoDbService.insertOne<CreateJobPosition>(DbCollection.POSITIONS, validator.results);
    await notificationService[SET_NOTIFICATION]({ positionId: insertedId, type: NotificationType.NEW_JOB_OFFER });

    return { returnCode };
  },

  [UPDATE_JOB_POSITION]: async (jobId: BaseId, payload: UpdateJobPositionReq): Promise<BaseResponse> => {
    const validator = new RecordValidator<UpdateJobPositionReq>(
      payload,
      [
        ['_id', { custom: [mongoIdValidator] }],
        ['type', { required: [true] }],
        ['amount', { required: [true], min: [1, ValidationMessage.MIN], regex: [RegexPattern.NUMBER, ValidationMessage.INVALID] }],
        ['comment', { maxLength: [LENGTH.COMMENT, ValidationMessage.MAX_LENGTH] }],
      ],
      { type: 1, amount: 1, comment: 1, _id: 0 }
    );

    if (!payload._id) {
      return await postJobService[CREATE_JOB_POSITION]({ jobId: $toObjectId(jobId), ...validator.results });
    }

    const { returnCode } = await mongoDbService.updateOne(
      DbCollection.POSITIONS,
      {
        _id: $toObjectId(payload._id),
        jobId: $toObjectId(jobId),
      },
      { $set: { jobId: $toObjectId(jobId), ...validator.results } },
      {}
    );

    return { returnCode };
  },

  [REMOVE_JOB_POSITION]: async (positionId: BaseId): Promise<BaseResponse> => {
    const id = $toObjectId(positionId);
    await mongoDbService.deleteMany(DbCollection.CONVERSATIONS, { positionId: id });
    const { returnCode } = await mongoDbService.deleteOne(DbCollection.POSITIONS, { _id: id });

    return { returnCode };
  },

  [GET_JOB_DETAILS]: async (_id: BaseId, userId: BaseId): Promise<GetJobDetailsRes> => {
    new RecordValidator({ id: _id }, [['id', { custom: [mongoIdValidator] }]]);

    return await mongoDbService.fineOne<GetJobDetailsRes>(DbCollection.JOBS, postJobQuery[GET_JOB_DETAILS](_id, userId));
  },

  [SEARCH_JOB_POSTS]: async (payload: JobSearchPostJobsReq, userId: BaseId): Promise<BaseRecords<SearchPostJobRes>> => {
    const { page, ...filters } = payload;
    const validator = new RecordValidator(filters, [
      [['dateFrom', 'dateTo'], { regex: [RegexPattern.TIMESTAMP] }],
      ['jobType', { type: [['Array', 'Null']] }],
      ['value', { maxLength: [LENGTH.TITLE] }],
    ]);

    return await mongoDbService.find<DocumentJob, SearchPostJobRes>(DbCollection.JOBS, postJobQuery[SEARCH_JOB_POSTS](validator.results, userId), {
      page,
    });
  },
};

export default postJobService;
