import type { BaseDate } from '../../../../shared/models';

export const getEventBetweenQuery = ({ dateFrom, dateTo }: { dateFrom?: BaseDate; dateTo?: BaseDate }): Record<string, any> => ({
  $expr: {
    $or: [
      { $and: [...(dateFrom ? [{ $gte: ['$dateFrom', dateFrom] }] : []), ...(dateTo ? [{ $lte: ['$dateTo', dateTo] }] : [])] },
      { $and: [...(dateTo ? [{ $lte: ['$dateFrom', dateTo] }] : []), ...(dateFrom ? [{ $gte: ['$dateTo', dateFrom] }] : [])] },
    ],
  },
});
