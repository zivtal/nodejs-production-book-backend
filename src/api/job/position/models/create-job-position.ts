import type { DocumentPosition } from '../../../../shared/models';

export type CreateJobPosition = Omit<DocumentPosition, '_id' | 'createdAt' | 'updatedAt'>;
