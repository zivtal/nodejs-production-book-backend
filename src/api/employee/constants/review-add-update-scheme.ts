import type { ValidatorScheme } from '../../../shared/service/record-validator';
import type { AddReviewReq } from '../review/models';
import type { BaseId } from '../../../shared/models';

export const REVIEW_ADD_UPDATE_SCHEME: ValidatorScheme<AddReviewReq & { fromId: BaseId }> = {
  fromId: 0,
  userId: 1,
  comment: 1,
  attitude: 1,
  reliability: 1,
  craftsmanship: 1,
  communication: 1,
};
