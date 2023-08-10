import { DbCollection } from '../../../../shared/service/mongodb/constants';

export const getRecordConversations = ({ foreignField, localField }: { foreignField?: string; localField?: string }) => ({
  from: DbCollection.POSITIONS,
  foreignField,
  localField,
  pipeline: [{ $project: { jobId: 0 } }],
  as: DbCollection.POSITIONS,
});
