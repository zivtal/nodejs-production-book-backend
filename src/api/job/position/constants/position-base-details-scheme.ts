import type { DocumentPosition } from '../models';
import type { MongoDbScheme } from '../../../../shared/service/mongodb/models';

export const POSITION_BASE_DETAILS_SCHEME: MongoDbScheme<DocumentPosition> = {
  _id: 1,
  type: 1,
  amount: 1,
  comment: 1,
};
