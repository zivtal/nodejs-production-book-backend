import type { CustomValidator } from '../models';
import * as Mongo from 'mongodb';
import { ValidationMessage } from '../constants';

export const mongoIdValidator: CustomValidator = (value: string | Array<string>) => [
  (() => {
    try {
      return !(Array.isArray(value) ? value : [value]).some((id) => !new Mongo.ObjectId(id));
    } catch (err) {
      return false;
    }
  })(),
  ValidationMessage.INVALID_ID,
];
