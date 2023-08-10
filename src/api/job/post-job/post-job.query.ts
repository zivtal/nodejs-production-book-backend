import { DbQuery } from '../../../shared/service/mongodb/mongo-db.service';
import { $addFields, $lookup, $match, $mergeToRoot, $project, $set, $sort, $toObjectId } from '../../../shared/service/mongodb/helpers';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { PROFILE_BASE_DETAILS_SCHEME } from '../../employee/constants';
import { GET_JOB_DETAILS, SEARCH_JOB_POSTS } from '../job.map';
import { getEventBetweenQuery } from '../calendar/helpers';
import { hasUpdated, sumOfArray } from '../query';
import { ConversationStatusType } from '../conversation/constants';
import { JobSearchPostJobsReq } from './models';
import { BaseId } from '../../../shared/models';

const getJobDetailsQuery = (_id: string, userId: string): DbQuery => {
  return [
    $match({ _id: $toObjectId(_id), userId: $toObjectId(userId) }),
    $lookup({
      from: DbCollection.POSITIONS,
      foreignField: 'jobId',
      localField: '_id',
      pipeline: [
        $lookup({
          from: DbCollection.CONVERSATIONS,
          foreignField: 'positionId',
          localField: '_id',
          pipeline: [
            $lookup({
              from: DbCollection.USERS,
              localField: 'participants',
              foreignField: '_id',
              as: 'participants',
              pipeline: [$project({ ...PROFILE_BASE_DETAILS_SCHEME, avatar: { $cond: [{ $eq: ['$_id', $toObjectId(userId)] }, null, '$avatar'] } })],
            }),
            $set({ status: { $last: '$status' }, lastSeenAt: `$lastSeenAt.${userId}` }),
            $project({ messages: 0, positionId: 0 }),
            $sort({ updatedAt: -1 }),
          ],
        }),
        $project({ jobId: 0 }),
        $sort({ updatedAt: -1 }),
      ],
    }),
  ];
};

const searchJobPosts = (payload: JobSearchPostJobsReq, userId: BaseId): DbQuery => {
  const { dateFrom = 0, dateTo, value, jobType } = payload;

  return [
    $match({
      $and: [
        { userId: $toObjectId(userId) },
        ...(value ? [{ title: { $regex: value, $options: 'i' } }] : []),
        ...(jobType?.length ? [{ jobType: { $in: jobType } }] : []),
        getEventBetweenQuery({ dateFrom, dateTo }),
      ],
    }),
    $sort({ dateFrom: 1 }),
    $lookup({
      from: DbCollection.POSITIONS,
      foreignField: 'jobId',
      localField: '_id',
    }),
    $lookup({
      from: DbCollection.POSITIONS,
      foreignField: 'jobId',
      localField: '_id',
      pipeline: [
        $lookup({
          from: DbCollection.CONVERSATIONS,
          foreignField: 'positionId',
          localField: '_id',
          let: { positionId: '$positionId' },
          as: 'participants',
          pipeline: [
            $lookup({
              from: DbCollection.USERS,
              foreignField: '_id',
              localField: 'participants',
              as: 'participants',
              let: { participants: '$participants' },
              pipeline: [{ $match: { $expr: { $ne: ['$_id', $toObjectId(userId)] } } }, { $project: PROFILE_BASE_DETAILS_SCHEME }],
            }),
            $set({ status: { $last: '$status.type' }, hasUpdated: hasUpdated(userId) }),
            $mergeToRoot({ $first: `$participants` }),
            $sort({ updatedAt: -1 }),
            $project({ ...PROFILE_BASE_DETAILS_SCHEME, status: 1, hasUpdated: 1 }),
          ],
        }),
        $project({ jobId: 0 }),
        $sort({ updatedAt: -1 }),
        $addFields(
          sumOfArray('filled', 'participants', {
            $in: ['$participants.status', [ConversationStatusType.FREELANCER_ACCEPT, ConversationStatusType.CANCELLATION]],
          })
        ),
      ],
    }),
  ];
};

export default {
  [GET_JOB_DETAILS]: getJobDetailsQuery,
  [SEARCH_JOB_POSTS]: searchJobPosts,
};
