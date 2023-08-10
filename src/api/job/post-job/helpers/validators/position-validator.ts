import type { CreatePostJobReq } from '../../models';
import type { CreateJobPosition } from '../../../position/models';
import RecordValidator, { type CustomValidator, ValidationMessage } from '../../../../../shared/service/record-validator';
import RegexPattern from '../../../../../shared/constants/regex-pattern';
import { LENGTH } from '../../../../../shared/constants';

export const positionValidator: CustomValidator = (positions?: CreatePostJobReq['positions']) => {
  for (const position of positions || []) {
    const validate = new RecordValidator<CreateJobPosition>(
      position,
      [
        ['type', { required: [true] }],
        ['amount', { required: [true], min: [1, ValidationMessage.MIN], regex: [RegexPattern.NUMBER, ValidationMessage.INVALID] }],
        ['comment', { maxLength: [LENGTH.COMMENT, ValidationMessage.MAX_LENGTH] }],
      ],
      { type: 1, amount: 1, jobId: 1, comment: 1 }
    );

    if (validate.errors?.length) {
      return [false, validate.errors[0].message, validate.errors[0].value];
    }
  }

  return [true];
};
