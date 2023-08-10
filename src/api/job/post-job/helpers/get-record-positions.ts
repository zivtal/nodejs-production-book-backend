import { DbCollection } from '../../../../shared/service/mongodb/constants';

export const getRecordPositions = ({
  foreignField,
  localField,
  pipeline,
}: {
  foreignField?: string;
  localField?: string;
  pipeline?: Array<Record<string, any>>;
}) => ({
  from: DbCollection.POSITIONS,
  foreignField,
  localField,
  pipeline: [{ $project: { jobId: 0 } }, ...(pipeline || [])],
  as: DbCollection.POSITIONS,
});
