import { MongoDbScheme } from '../../shared/service/mongodb/models';

export const NOTIFICATION_MINI_USER = { _id: 0, firstName: 1, midName: 1, lastName: 1, nickName: 1, avatar: 1 };

export const NOTIFICATION_HIDE_VALUE: MongoDbScheme<any> = {
  fromId: 0,
  title: 0,
  location: 0,
  skills: 0,
  messages: 0,
  amount: 0,
  participants: 0,
  status: 0,
  description: 0,
  lastSeenAt: 0,
  createdAt: 0,
};
