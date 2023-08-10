import type { BaseId, DocumentReview } from '../../../../shared/models';

export interface AddReviewReq {
  userId: BaseId;
  comment?: DocumentReview['comment'];
  attitude: DocumentReview['attitude'];
  reliability: DocumentReview['reliability'];
  craftsmanship: DocumentReview['craftsmanship'];
  communication: DocumentReview['communication'];
}
