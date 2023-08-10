import RegexPattern from '../../../constants/regex-pattern';
import { ValidationMessage } from './validation.message.enum';
import { CoreValidators } from '../models';

export class ValidatorRegex {
  public static readonly EMAIL_ADDRESS: CoreValidators['regex'] = [RegexPattern.EMAIL_ADDRESS, ValidationMessage.INVALID_EMAIL_ADDRESS];
  public static readonly NAME: CoreValidators['regex'] = [RegexPattern.NAME, ValidationMessage.INVALID_NAME];
  public static readonly TIMESTAMP: CoreValidators['regex'] = [RegexPattern.TIMESTAMP, ValidationMessage.INVALID_TIMESTAMP];
  public static readonly COORDINATE: CoreValidators['regex'] = [RegexPattern.COORDINATE, ValidationMessage.INVALID_COORDINATE];

  public static readonly PHONE: Record<string, CoreValidators['regex']> = {
    HE: [RegexPattern.PHONE.HE, ValidationMessage.INVALID_PHONE_NUMBER],
  };

  public static readonly PASSWORD: CoreValidators['regex'] = [
    [
      [RegexPattern.PASSWORD.LOWERCASE, ValidationMessage.MISSING_LOWERCASE_CHARACTER],
      [RegexPattern.PASSWORD.UPPERCASE, ValidationMessage.MISSING_UPPERCASE_CHARACTER],
      [RegexPattern.PASSWORD.NUMERIC, ValidationMessage.MISSING_NUMERIC_CHARACTER],
      [RegexPattern.PASSWORD.SPECIAL, ValidationMessage.MISSING_SPECIAL_CHARACTER],
    ],
    ValidationMessage.WEAK_PASSWORD,
    { checkMode: 'every' },
  ];
}
