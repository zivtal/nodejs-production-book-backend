import { SearchPositionReq } from './models';
import { BaseId } from '../../../shared/models';
import { UserLocation } from '../../user/models';
import { DbQuery } from '../../../shared/service/mongodb/mongo-db.service';
import { hasUpdated, skillsRecord, addPositionActiveStatus } from '../query';
import { ConversationStatusType } from '../conversation/constants';
import { $distance, $lookup, $match, $mergeToRoot, $project, $set, $sort, $toObjectId } from '../../../shared/service/mongodb/helpers';
import { addJobTitle } from './helpers';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { GET_POSITION_DETAILS, SEARCH_POSITIONS } from '../job.map';
import { MongoDbScheme } from '../../../shared/service/mongodb/models';

const $conversation = (userId: BaseId, scheme: MongoDbScheme<any>) =>
  $lookup({
    from: DbCollection.CONVERSATIONS,
    as: 'conversation',
    foreignField: 'positionId',
    pipeline: [
      $match({ participants: $toObjectId(userId) }),
      $set({
        status: { $last: '$status' },
        lastSeenAt: `$lastSeenAt.${userId}`,
        hasUpdated: hasUpdated(userId),
      }),
      $project(scheme),
    ],
  });

const getPositionDetails = (positionId: BaseId, userId?: BaseId, language?: string): DbQuery => {
  const addConversationStatus: Array<Record<string, any>> = userId
    ? [
        $conversation(userId, { positionId: 0, userId: 0 }),
        $set({ conversation: { $first: `$conversation` } }),
        $set({ status: `$conversation.status`, hasUpdated: `$conversation.hasUpdated` }),
      ]
    : [];

  return [
    $match({ _id: $toObjectId(positionId) }),
    $lookup({ from: DbCollection.JOBS, localField: 'jobId' }),
    $mergeToRoot({ $arrayElemAt: [`$${DbCollection.JOBS}`, 0] }),
    skillsRecord(language, 'type'),
    ...addConversationStatus,
    $set({ title: addJobTitle() }),
    $project({ userId: 0, jobId: 0 }),
  ];
};

const searchPositionsQuery = (
  payload: SearchPositionReq,
  userId?: BaseId,
  language?: string,
  userCoordinates?: UserLocation['coordinates']
): DbQuery => {
  const { status, inConversation, jobType, dateFrom, dateTo, maxDistance, skills, location } = payload;

  const coordinates = location?.coordinates || userCoordinates;

  const match: Array<Record<string, any>> = [
    ...(status ? [{ 'conversation.status.type': status }] : []),
    ...(jobType?.length ? [{ jobType: { $in: jobType } }] : []),
    ...(skills?.length ? [{ type: { $in: skills } }] : []),
    ...(dateFrom ? [{ dateFrom: { $gte: dateFrom } }] : []),
    ...(dateTo ? [{ dateTo: { $lte: dateTo } }] : []),
    ...(userId ? [{ userId: { $ne: $toObjectId(userId) } }] : []),
  ];

  const sort = coordinates
    ? [$set({ inRadius: { $round: [{ $divide: ['$distance', 100000] }, 0] } }), $sort({ hasUpdated: -1, inRadius: 1, dateFrom: 1 })]
    : [$sort({ hasUpdated: -1, dateFrom: 1 })];

  const addConversationStatus: Array<Record<string, any>> = userId
    ? [
        $conversation(userId, { hasUpdated: 1, status: 1 }),
        $set({ conversation: { $first: `$conversation` } }),
        $set({ status: `$conversation.status`, hasUpdated: `$conversation.hasUpdated` }),
        { $unset: 'conversation' },
        ...(inConversation ? [$match({ status: { $exists: true } })] : []),
      ]
    : [];

  return [
    ...addPositionActiveStatus([ConversationStatusType.FREELANCER_ACCEPT, ConversationStatusType.CANCELLATION]),
    $match({ isClosed: false }),
    {
      $lookup: {
        from: DbCollection.JOBS,
        as: 'jobId',
        let: { jobId: '$jobId' },
        pipeline: [
          $distance(coordinates, maxDistance ? Math.min(maxDistance || 0, 500) * 1000 : undefined),
          $match({ $expr: { $eq: ['$_id', '$$jobId'] } }),
        ],
      },
    },
    $mergeToRoot({ $arrayElemAt: ['$jobId', 0] }),
    { $project: { jobId: 0 } },
    $match({ $and: [...match, ...(maxDistance ? [{ $or: [{ $expr: { $lte: ['$distance', '$maxDistance'] } }, { maxDistance: null }] }] : [])] }),
    skillsRecord(language, 'type'),
    ...addConversationStatus,
    $set({ title: addJobTitle() }),
    ...sort,
  ];
};

export default {
  [SEARCH_POSITIONS]: searchPositionsQuery,
  [GET_POSITION_DETAILS]: getPositionDetails,
};
