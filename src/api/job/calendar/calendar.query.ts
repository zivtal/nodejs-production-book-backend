import { $addFields, $lookup, $match, $mergeToRoot, $project, $set, $sort, $toObjectId, $unionWith } from '../../../shared/service/mongodb/helpers';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { hasUpdated } from '../query';
import { getStatusTypeQuery } from '../conversation/helpers';
import { ConversationStatusType } from '../conversation/constants';
import { getEventBetweenQuery } from './helpers';
import { CALENDAR_EVENT_SCHEME, EventRouteNames } from './constants';
import { GetCalendarEventsReq } from './models';
import { GET_CALENDAR_EVENTS, GET_UPCOMING_EVENTS } from '../job.map';
import { DbQuery } from '../../../shared/service/mongodb/mongo-db.service';
import { PROFILE_BASE_DETAILS_SCHEME } from '../../employee/constants';

type EventLookup = {
  dateFrom: number;
  dateTo?: number;
  language?: string;
  payload?: GetCalendarEventsReq;
};

const freelancerEvent = (userId: string, { dateFrom, dateTo, payload }: EventLookup): Record<string, any> =>
  $unionWith(DbCollection.POSITIONS, [
    $lookup({ from: DbCollection.JOBS, localField: 'jobId', pipeline: [{ $match: { $expr: { $ne: ['$userId', $toObjectId(userId)] } } }] }),
    $mergeToRoot({ $arrayElemAt: [`$${DbCollection.JOBS}`, 0] }),
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
        $project({ messages: 0, positionId: 0, userId: 0 }),
      ],
    }),
    $set({ conversation: { $first: `$conversation` } }),
    $set({ status: '$conversation.status' }),
    { $unset: 'conversation' },
    $match({
      $and: [
        getStatusTypeQuery(payload?.status || [ConversationStatusType.FREELANCER_ACCEPT, ConversationStatusType.CANCELLATION]),
        getEventBetweenQuery({ dateFrom, dateTo }),
      ],
    }),
    $set({ status: '$status.type' }),
    $addFields({ routeName: EventRouteNames.JOB_OFFER }),
    $lookup({
      from: DbCollection.USERS,
      localField: 'userId',
      as: 'jobOwner',
      pipeline: [$project(PROFILE_BASE_DETAILS_SCHEME)],
    }),
    $set({ jobOwner: { $first: '$jobOwner' } }),
  ]);

const jobEvent = (userId: string, { dateFrom, dateTo }: EventLookup): DbQuery => [
  $match({ $and: [{ userId: $toObjectId(userId) }, getEventBetweenQuery({ dateFrom, dateTo })] }),
  $lookup({
    from: DbCollection.POSITIONS,
    foreignField: 'jobId',
    localField: '_id',
    pipeline: [{ $project: { jobId: 0 } }],
  }),
  $lookup({
    from: DbCollection.POSITIONS,
    foreignField: 'jobId',
    localField: '_id',
    pipeline: [
      $project({ jobId: 0 }),
      $sort({ updatedAt: -1 }),
      $lookup({
        from: DbCollection.CONVERSATIONS,
        foreignField: 'positionId',
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
          $mergeToRoot({ $arrayElemAt: ['$participants', 0] }),
          $project(PROFILE_BASE_DETAILS_SCHEME),
        ],
      }),
    ],
  }),
  $addFields({ routeName: EventRouteNames.JOB_MANAGER }),
];

const calendarEventQuery = (userId: string, { dateFrom, dateTo, payload }: EventLookup): DbQuery => {
  return [
    jobEvent(userId, { dateFrom, dateTo }),
    freelancerEvent(userId, { dateFrom, dateTo, payload }),
    $sort({ dateFrom: 1 }),
    $project(CALENDAR_EVENT_SCHEME),
  ];
};

export default {
  [GET_CALENDAR_EVENTS]: calendarEventQuery,
  [GET_UPCOMING_EVENTS]: (userId: string, options: Omit<EventLookup, 'payload' | 'dateTo'>) => calendarEventQuery(userId, options),
};
