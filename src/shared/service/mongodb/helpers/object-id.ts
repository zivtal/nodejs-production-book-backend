import { ObjectId } from 'mongodb';
import * as Mongo from 'mongodb';
import ValidationError from '../../../composables/middleware/errors/validation-error';
import { DbMessages } from '../constants';

export const $toObjectId = (id: string): ObjectId => {
  try {
    return new Mongo.ObjectId(id);
  } catch (err) {
    throw new ValidationError(DbMessages.INVALID_ID);
  }
};

export const $toObjectIds = (ids: Array<string>) => [...new Set(ids)].map((id) => $toObjectId(id));
