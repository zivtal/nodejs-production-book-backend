import type { BaseId } from '../../shared/models';
import type { BaseResponse, BaseRecords } from '../../shared/models';
import type { DocumentNotification, SetNotificationReq, GetNotificationReq, GetNotificationRes } from './models';
import type { AccessToken } from '../../shared/service/token/models/access-token';
import { GET_NOTIFICATIONS, REMOVE_NOTIFICATION, SET_NOTIFICATION } from './notification.maps';
import { NOTIFICATION_HIDE_VALUE, NOTIFICATION_MINI_USER } from './notification.constants';
import { DbCollection } from '../../shared/service/mongodb/constants';
import ProcessService from '../../shared/service/process.service';
import RecordValidator, { mongoIdValidator } from '../../shared/service/record-validator';
import { $lookup, $match, $mergeToRoot, $project, $set, $sort, $toObjectId } from '../../shared/service/mongodb/helpers';
import mongoDbService from '../../shared/service/mongodb/mongo-db.service';

const notificationService = {
  [GET_NOTIFICATIONS]: async (sender: AccessToken, payload: GetNotificationReq): Promise<BaseRecords<GetNotificationRes>> => {
    new RecordValidator({ ...payload, id: sender.id }, [
      ['id', { required: [true], custom: [mongoIdValidator] }],
      ['skills', { required: [true], minLength: [1] }],
      ['specialization', { required: [true], minLength: [1] }],
    ]);

    const { page } = payload;

    return await mongoDbService.find<DocumentNotification, GetNotificationRes>(
      DbCollection.NOTIFICATIONS,
      [
        $match({ $or: [{ userId: $toObjectId(sender.id) }, { userId: { $exists: false } }] }),
        $sort({ updatedAt: -1 }),
        $lookup({
          from: DbCollection.USERS,
          localField: 'fromId',
          foreignField: '_id',
          as: 'from',
          pipeline: [{ $project: NOTIFICATION_MINI_USER }],
        }),
        $set({ from: { $first: '$from' } }),
        $lookup({ from: DbCollection.CONVERSATIONS, localField: 'conversationId', foreignField: '_id' }),
        $mergeToRoot({ $first: `$${DbCollection.CONVERSATIONS}` }),
        $lookup({ from: DbCollection.POSITIONS, localField: 'positionId', foreignField: '_id', pipeline: [{ $addFields: { skills: '$type' } }] }),
        $mergeToRoot({ $first: `$${DbCollection.POSITIONS}` }),
        $lookup({ from: DbCollection.JOBS, localField: 'jobId', foreignField: '_id', pipeline: [{ $project: { userId: 0 } }] }),
        $mergeToRoot({ $first: `$${DbCollection.JOBS}` }),
        $match({
          $or: [{ $and: [{ skills: { $in: payload.skills } }, { specialization: { $in: payload.specialization } }] }, { userId: { $exists: true } }],
        }),
        $project(NOTIFICATION_HIDE_VALUE),
      ],
      { page }
    );
  },

  [REMOVE_NOTIFICATION]: async (conversationId: BaseId, userId: BaseId): Promise<BaseResponse> => {
    return await mongoDbService.deleteOne(DbCollection.NOTIFICATIONS, { _id: $toObjectId(conversationId), userId: $toObjectId(userId) });
  },

  [SET_NOTIFICATION]: async (notification: SetNotificationReq): Promise<void> => {
    const { userId, jobId, positionId, conversationId, ...restNotification } = notification;

    ProcessService.debounce(
      async (): Promise<void> => {
        await mongoDbService.insertOne(DbCollection.NOTIFICATIONS, {
          ...restNotification,
          ...(userId ? { userId } : {}),
          ...(jobId ? { jobId } : {}),
          ...(positionId ? { positionId } : {}),
          ...(conversationId ? { conversationId } : {}),
          createdAt: Date.now(),
        });
      },
      JSON.stringify({ userId, jobId, positionId, conversationId, type: restNotification.type }),
      5000
    );
  },
};

export default notificationService;
