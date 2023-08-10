import type { ErrorResponseMessage } from '../../../models/errors/error-response-message';

abstract class CustomError extends Error {
  abstract errorCode: number;
  abstract errorType: string;

  protected constructor(message: any) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): Array<ErrorResponseMessage>;
}

export default CustomError;
