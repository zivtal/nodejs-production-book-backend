import type { ObjectId } from 'mongodb';
import type { BaseDate, BaseId } from '../../../models';

export interface DbResponse {
  _id: BaseId | ObjectId;
  createdAt?: BaseDate;
  updatedAt?: BaseDate;
}
