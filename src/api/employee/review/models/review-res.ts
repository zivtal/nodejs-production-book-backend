import type { ProfileBaseDetails } from '../../models';
import type { DocumentReview } from '../../../../shared/models';

export interface ReviewRes extends Omit<DocumentReview, 'userId' | 'fromId'> {
  user: ProfileBaseDetails;
}
