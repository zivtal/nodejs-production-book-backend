import { DbQuery } from '../../../shared/service/mongodb/mongo-db.service';
import { $lookup, $match, $mergeToRoot, $project, $set, $toObjectId } from '../../../shared/service/mongodb/helpers';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { hasUpdated } from '../query';
import { DocumentConversation, GetConversationRes } from './models';
import { PROFILE_BASE_DETAILS_SCHEME } from '../../employee/constants';
import { DocumentPosition } from '../position/models';
import { ConversationStatusType } from './constants';

const getConversationQuery = (conversationId: string, userId: string): DbQuery => [
  $match({ _id: $toObjectId(conversationId) }),
  { $limit: 1 },
  $match({ $or: [{ participants: $toObjectId(userId) }, { userId: $toObjectId(userId) }] }),
  $lookup({ from: DbCollection.USERS, localField: 'participants', as: 'participants', pipeline: [$project(PROFILE_BASE_DETAILS_SCHEME)] }),
  $set({ status: { $last: '$status' }, hasUpdated: hasUpdated(userId) }),
  $project<GetConversationRes>({ positionId: 1, participants: 1, messages: 1, status: 1, agreement: 1, hasUpdated: 1 }),
];

const checkConversationQuery = (conversationId: string, userId: string): DbQuery => [
  $match({ _id: $toObjectId(conversationId), $or: [{ participants: $toObjectId(userId) }, { userId: $toObjectId(userId) }] }),
  $lookup<DocumentConversation>({
    from: DbCollection.POSITIONS,
    localField: 'positionId',
    pipeline: [
      $lookup<DocumentPosition, DocumentConversation>({
        from: DbCollection.CONVERSATIONS,
        foreignField: 'positionId',
        pipeline: [
          $match({ $expr: { $in: [{ $last: '$status.type' }, [ConversationStatusType.FREELANCER_ACCEPT, ConversationStatusType.CANCELLATION]] } }),
        ],
      }),
      $project({ _id: 0, amount: 1, jobId: 1, filled: { $size: `$${DbCollection.CONVERSATIONS}` } }),
    ],
  }),
  $mergeToRoot({ $arrayElemAt: ['$positions', 0] }),
  $lookup({ from: DbCollection.JOBS, localField: 'jobId', pipeline: [$project({ _id: 0, ownerId: 1 })] }),
  $mergeToRoot({ $arrayElemAt: ['$job', 0] }),
  $project({ _id: 1, ownerId: 1, amount: 1, filled: 1, participants: 1, status: { $last: '$status' } }),
];

export default {
  getConversations: getConversationQuery,
  checkConversation: checkConversationQuery,
};
