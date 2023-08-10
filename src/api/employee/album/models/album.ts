import type { ObjectId } from 'mongodb';
import type { DbResponse } from '../../../../shared/service/mongodb/models';
import type { BaseId } from '../../../../shared/models';
import type { Asset } from './asset';

export interface Album extends DbResponse {
  userId: BaseId | ObjectId;
  name: string;
  description?: string;
  assets: Array<Asset>;
  cover?: string;
}
