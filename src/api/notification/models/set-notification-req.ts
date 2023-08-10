import { DocumentNotification } from '../../../shared/models';

export type SetNotificationReq = Omit<DocumentNotification, '_id' | 'createdAt'>;
