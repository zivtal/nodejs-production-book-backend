import type { Wage } from '../../models';
import RecordValidator, { type CustomValidator, ValidationMessage } from '../../../../shared/service/record-validator';
import RegexPattern from '../../../../shared/constants/regex-pattern';

export const wageValidator: CustomValidator = (wage: Wage) => {
  const validate = new RecordValidator<Wage>(
    wage,
    [
      ['currencyType', { required: [true] }],
      ['hourly', { type: ['Number'], regex: [RegexPattern.NUMBER] }, ValidationMessage.INVALID],
      ['daily', { type: ['Number'], regex: [RegexPattern.NUMBER] }, ValidationMessage.INVALID],
      ['includeTax', { type: ['Number'], regex: [RegexPattern.NUMBER] }, ValidationMessage.INVALID],
    ],
    { currencyType: 1, hourly: 1, daily: 1, includeTax: 1 }
  );

  return validate.errors?.length ? [false, validate.errors[0].message, validate.errors[0].value] : [true];
};
