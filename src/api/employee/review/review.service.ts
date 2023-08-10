import type { DocumentReview, AddReviewReq, GetReviewsReq, ReviewRes } from './models';
import type { BaseId, BaseRecords, BaseResponse } from '../../../shared/models';
import type { ObjectId } from 'mongodb';
import { ADD_REVIEW, GET_REVIEW, GET_REVIEWS, REMOVE_REVIEW } from './review.map';
import { PROFILE_BASE_DETAILS_SCHEME, REVIEW_ADD_UPDATE_SCHEME } from '../constants';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import RecordValidator, { ValidationMessage, mongoIdValidator } from '../../../shared/service/record-validator';
import { calculateAverageFields } from './helpers';
import { LENGTH } from '../../../shared/constants';
import { $lookup, $match, $project, $set, $toObjectId } from '../../../shared/service/mongodb/helpers';
import mongoDbService from '../../../shared/service/mongodb/mongo-db.service';

const reviewService = {
  [ADD_REVIEW]: async (fromId: BaseId, payload: AddReviewReq): Promise<{ _id?: ObjectId } & BaseResponse> => {
    const validate = new RecordValidator<AddReviewReq & { fromId: BaseId }, AddReviewReq>(
      { ...payload, fromId },
      [
        ['userId', { required: [true], custom: [mongoIdValidator] }],
        ['comment', { maxLength: [LENGTH.DESCRIPTION, ValidationMessage.MAX_LENGTH] }],
        ['attitude', { min: [0.5, ValidationMessage.MIN], max: [5, ValidationMessage.MAX] }],
        ['reliability', { min: [0.5, ValidationMessage.MIN], max: [5, ValidationMessage.MAX] }],
        ['craftsmanship', { min: [0.5, ValidationMessage.MIN], max: [5, ValidationMessage.MAX] }],
        ['communication', { min: [0.5, ValidationMessage.MIN], max: [5, ValidationMessage.MAX] }],
      ],
      REVIEW_ADD_UPDATE_SCHEME
    );

    const { userId, ...restReview } = validate.results;

    const { returnCode } = await mongoDbService.replaceOne<AddReviewReq & { average: number; fromId: BaseId }>(
      DbCollection.REVIEWS,
      { fromId: $toObjectId(fromId), userId: $toObjectId(userId) },
      {
        fromId: $toObjectId(fromId),
        userId: $toObjectId(userId),
        average: calculateAverageFields(restReview, ['attitude', 'communication', 'craftsmanship', 'reliability']),
        ...restReview,
      },
      { upsert: true }
    );

    return { returnCode };
  },

  [GET_REVIEW]: async (id: string): Promise<DocumentReview> => {
    new RecordValidator({ id }, [['id', { required: [true], custom: [mongoIdValidator] }]]);

    return await mongoDbService.fineOne<DocumentReview>(DbCollection.REVIEWS, [$match({ _id: $toObjectId(id) })]);
  },

  [GET_REVIEWS]: async ({ userId, page }: GetReviewsReq): Promise<BaseRecords<ReviewRes>> => {
    new RecordValidator({ userId }, [['userId', { required: [true], custom: [mongoIdValidator] }]]);

    return await mongoDbService.find<DocumentReview, ReviewRes>(
      DbCollection.REVIEWS,
      [
        $match({ userId: $toObjectId(userId) }),
        $lookup({ from: DbCollection.USERS, localField: 'fromId', as: 'user', pipeline: [$project(PROFILE_BASE_DETAILS_SCHEME)] }),
        $set({ user: { $first: '$user' } }),
      ],
      { page }
    );
  },

  [REMOVE_REVIEW]: async (id: BaseId, userId: BaseId): Promise<BaseResponse> => {
    new RecordValidator({ id }, [['id', { required: [true], custom: [mongoIdValidator] }]]);

    return await mongoDbService.deleteOne(DbCollection.REVIEWS, {
      _id: $toObjectId(id),
      fromId: $toObjectId(userId),
    });
  },
};

export default reviewService;
