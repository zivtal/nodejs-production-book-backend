import { ConversationStatusType } from '../conversation/constants';
import { DbCollection } from '../../../shared/service/mongodb/constants';

export const addPositionActiveStatus = (
  statuses: Array<keyof typeof ConversationStatusType>,
  options?: { foreignField?: string; localField?: string; addCloseState?: boolean; amountField?: string }
): Array<Record<string, any>> => {
  const { localField = '_id', foreignField = 'positionId', amountField = 'amount' } = options || {};

  return [
    {
      $lookup: {
        from: DbCollection.CONVERSATIONS,
        localField,
        foreignField,
        as: 'statuses',
        pipeline: [{ $match: { $expr: { $in: [{ $last: '$status.type' }, statuses] } } }],
      },
    },
    {
      $addFields: {
        filled: { $size: '$statuses' },
        isClosed: { $cond: [{ $lte: [`$${amountField}`, { $size: '$statuses' }] }, true, false] },
      },
    },
    { $unset: 'statuses' },
  ];
};
