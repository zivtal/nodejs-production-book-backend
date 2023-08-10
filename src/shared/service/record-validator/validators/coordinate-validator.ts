import type { CustomValidator } from '../models';
import type { MongodbLocation } from '../../mongodb/models';
import { ValidationMessage } from '../constants';
import RegexPattern from '../../../constants/regex-pattern';

export const coordinateValidator: CustomValidator = (location?: MongodbLocation) => [
  (location?.coordinates || []).every((val) => RegexPattern.COORDINATE.test(val.toString())),
  ValidationMessage.INVALID_COORDINATE,
];
