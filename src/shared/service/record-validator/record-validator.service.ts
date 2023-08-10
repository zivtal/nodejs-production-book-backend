import type { ErrorResponseMessage } from '../../models/errors/error-response-message';
import type { RecordValidators, Validations, ValidatorScheme, ValidatorFunction, CustomValidator, CoreValidators } from './models';
import type { TypeOf } from '../../models';
import ValidationError from '../../composables/middleware/errors/validation-error';
import { ValidationMessage } from './constants';

type ValidatorCallback<Target> = { successCallback?: (payload?: Target) => void; failedCallback?: (payload?: Array<ErrorResponseMessage>) => void };
type ValidatorOptions<Source, Target> = ValidatorCallback<Target> & { skipUndefined?: boolean; throwErrors?: boolean };

export default class RecordValidator<Source = Record<string, any>, Target = Source> {
  private readonly validation: Validations<Source> = [];
  private readonly options: ValidatorOptions<Source, Target> = { skipUndefined: false, throwErrors: true };
  public readonly source: Partial<Source> = {};
  public results: Target = {} as Target;
  public errors: Array<ErrorResponseMessage> | null = null;

  constructor(
    source: Partial<Source>,
    validation: Validations<Source>,
    scheme?: ValidatorScheme<Source>,
    options?: ValidatorOptions<Source, Target>
  ) {
    this.source = source;
    this.validation = validation;
    this.options = { ...this.options, ...(options || {}) };

    this.results = (
      scheme
        ? (Object.entries(scheme) as Array<[keyof Source, 0 | 1]>).reduce(
            (fields: Partial<Source>, [key, value]) => (this.source[key] === undefined || !value ? fields : { ...fields, [key]: this.source[key] }),
            {}
          )
        : this.source
    ) as Target;

    this.validate();
  }

  public validate(successCallback?: (payload?: Target) => void, failedCallback?: (message?: Array<ErrorResponseMessage>) => void): boolean {
    const errors = this.validation.reduce((result: Array<ErrorResponseMessage>, item) => {
      const [fields, validators, message] = item;

      const items = (Array.isArray(fields) ? fields : [fields]).reduce((errors: Array<ErrorResponseMessage>, fieldName, index) => {
        const fieldValue = this.source[fieldName];
        const error = this.check([fieldName as string, index, fieldValue], validators, message);

        return error ? [...errors, error] : errors;
      }, []);

      return [...result, ...items];
    }, []);

    this.errors = errors.length ? errors : null;

    if (this.errors) {
      failedCallback?.(this.errors);
    } else {
      successCallback?.(this.results);
    }

    if (this.errors && this.options.throwErrors) {
      throw new ValidationError(this.errors);
    }

    return !!this.errors;
  }

  public check(
    [fieldName, fieldIndex, fieldValue]: [string, number, any?],
    validators: RecordValidators,
    mainMessage?: string
  ): ErrorResponseMessage | undefined {
    const { custom: externalValidators = [], ...internalValidators } = validators;
    const externalValidatorIndex = Object.keys(validators).findIndex((key) => key === 'custom');

    const { message, value } =
      this.execute(
        fieldValue,
        Object.entries(internalValidators).reduce(
          (result: Array<CustomValidator>, [validatorName, validatorPayload]: [string, any], intIndex, intBulk) => {
            const [validatorValue, errorMessage = mainMessage, ...arg] = validatorPayload;
            const validate = this.coreValidators[validatorName as keyof CoreValidators](fieldValue, [validatorValue, errorMessage, ...arg]);

            return [
              ...result,
              ...(externalValidatorIndex === intIndex || intIndex === intBulk.length - 1 ? externalValidators : []),
              ...(validate ? [validate] : []),
            ];
          },
          []
        )
      ) || {};

    return message ? { message, value, property: fieldName as string, index: fieldIndex } : undefined;
  }

  private execute(value: any, validators: Array<CustomValidator>): { message: string; value?: string | number } | undefined {
    for (const validator of validators) {
      const [isValid, errorMessage, validatorValue] = validator instanceof Function ? validator(value) : validator;

      if (!isValid) {
        return { message: errorMessage || ValidationMessage.GENERAL_ERROR, value: validatorValue as any };
      }
    }
  }

  private typeOf(obj: any): TypeOf {
    return /(?<=\s)\w+(|])/.exec(Object.prototype.toString.call(obj))![0] as TypeOf;
  }

  private toArray<T = any>(value: any): Array<T> {
    return Array.isArray(value) ? value : [value];
  }

  private getLength(value: any): number {
    return (Array.isArray(value) ? value : (value || '').toString()).length;
  }

  private isValidType(value: any, accept: Array<TypeOf>) {
    return accept.includes(this.typeOf(value));
  }

  private coreValidators: Record<keyof CoreValidators, ValidatorFunction> = {
    required: (inputValue: any, [_, errorMessage = ValidationMessage.REQUIRED]): ReturnType<ValidatorFunction> => [
      inputValue !== undefined,
      errorMessage,
    ],
    type: (inputValue: any, [acceptTypes, errorMessage = ValidationMessage.INVALID_TYPE]): ReturnType<ValidatorFunction> => {
      const valueType = this.typeOf(inputValue);
      const validatorTypes = this.toArray(acceptTypes);

      return [!(inputValue !== undefined && !validatorTypes.some((type) => valueType === type)), errorMessage, validatorTypes];
    },
    regex: (inputValue: any, [regExPatterns, errorMessage = ValidationMessage.MISMATCH, options]): ReturnType<ValidatorFunction> => {
      const { checkMode, valueReturn } = options || {};
      const errors: Array<ReturnType<ValidatorFunction>> = [];
      const isEvery = checkMode === 'every';

      if (inputValue === undefined || inputValue === null) {
        return [true];
      }

      for (const container of this.toArray(regExPatterns)) {
        const [regExPattern, message = errorMessage] = this.toArray(container);
        const valid = regExPattern instanceof RegExp && regExPattern.test((inputValue || '').toString());

        if (isEvery && !valid) {
          return [false, message, regExPattern.toString().slice(1, -1)];
        }

        errors.push([valid, message, valueReturn ? regExPattern.toString().slice(1, -1) : undefined]);
      }

      return [
        isEvery ? errors.every(([isValid]) => isValid) : errors.some(([isValid]) => isValid),
        errorMessage,
        valueReturn
          ? this.toArray(regExPatterns)
              .map((regex) => this.toArray(regex)[0].toString().slice(1, -1))
              .join('')
          : undefined,
      ];
    },
    equal: (inputValue: any, [equalValue, errorMessage = ValidationMessage.MISMATCH, options]): ReturnType<ValidatorFunction> => {
      const { valueReturn } = options || {};
      const values = (() => (this.typeOf(equalValue) === 'Object' ? Object.keys(equalValue) : null))() || this.toArray(equalValue);

      return [!inputValue || values.some((eqValue) => inputValue === eqValue), errorMessage, valueReturn ? values : undefined];
    },
    max: (inputValue: any, [maxValue, errorMessage = ValidationMessage.MAX]): ReturnType<ValidatorFunction> => [
      !inputValue || (!isNaN(+inputValue) && +inputValue <= maxValue),
      errorMessage,
      maxValue,
    ],
    min: (inputValue: any, [minValue, errorMessage = ValidationMessage.MIN]): ReturnType<ValidatorFunction> => [
      !inputValue || (!isNaN(+inputValue) && +inputValue >= minValue),
      errorMessage,
      minValue,
    ],
    length: (inputValue: any, [lengthValue, errorMessage = ValidationMessage.LENGTH]): ReturnType<ValidatorFunction> =>
      this.isValidType(inputValue, ['String', 'Number', 'Array']) ? [this.getLength(inputValue) === lengthValue, errorMessage, lengthValue] : [true],
    maxLength: (inputValue: any, [maxLengthValue, errorMessage = ValidationMessage.MAX_LENGTH]): ReturnType<ValidatorFunction> =>
      this.isValidType(inputValue, ['String', 'Number', 'Array'])
        ? [this.getLength(inputValue) < maxLengthValue || inputValue === undefined || inputValue === null, errorMessage, maxLengthValue]
        : [true],
    minLength: (inputValue: any, [minLengthValue, errorMessage = ValidationMessage.MIN_LENGTH]): ReturnType<ValidatorFunction> =>
      this.isValidType(inputValue, ['String', 'Number', 'Array'])
        ? [this.getLength(inputValue) >= minLengthValue || inputValue === undefined || inputValue === null, errorMessage, minLengthValue]
        : [true],
  };
}
