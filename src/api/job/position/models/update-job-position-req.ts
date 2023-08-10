import type { BaseId, DocumentPosition } from '../../../../shared/models';

export type UpdateJobPositionReq = Omit<DocumentPosition, '_id' | 'jobId'> & { _id?: BaseId };
