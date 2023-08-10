import type { DocumentReview, AddReviewReq, GetReviewsReq, ReviewRes } from './models';
import type { BaseRecords, BaseRequest, BaseResponse } from '../../../shared/models';
import type { Response } from 'express';
import type { ObjectId } from 'mongodb';

import { ADD_REVIEW, GET_REVIEW, GET_REVIEWS, REMOVE_REVIEW } from './review.map';
import reviewService from './review.service';
import AuthorizationError from '../../../shared/composables/middleware/errors/authorization-error';
import { AuthErrors } from '../../auth/auth.errors.enum';

const reviewController = {
  [ADD_REVIEW]: async (req: BaseRequest<AddReviewReq>, res: Response<{ _id: ObjectId } | BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    res.send(await reviewService[ADD_REVIEW](req.sender.id, req.body));
  },

  [GET_REVIEW]: async (req: BaseRequest<never, never>, res: Response<DocumentReview>): Promise<void> => {
    res.send(await reviewService[GET_REVIEW](req.params.id));
  },

  [GET_REVIEWS]: async (req: BaseRequest<GetReviewsReq>, res: Response<BaseRecords<ReviewRes>>) => {
    res.send(await reviewService[GET_REVIEWS](req.body));
  },

  [REMOVE_REVIEW]: async (req: BaseRequest, res: Response<BaseResponse>) => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    res.send(await reviewService[REMOVE_REVIEW](req.params.id, req.sender.id));
  },
};

export default reviewController;
