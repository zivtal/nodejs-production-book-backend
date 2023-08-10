import type { ErrorResponseMessage } from '../../../models/errors/error-response-message';
import CustomError from './custom-error';

class ValidationError extends CustomError {
  errorCode = 400;
  errorType = 'VALIDATION_ERROR';

  constructor(private errorMessage: Array<ErrorResponseMessage> | ErrorResponseMessage | string, errorCode?: number) {
    super(errorMessage);

    if (errorCode) {
      this.errorCode = errorCode;
    }

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors(): Array<ErrorResponseMessage> {
    if (Array.isArray(this.errorMessage)) {
      return this.errorMessage;
    }

    return [typeof this.errorMessage === 'string' ? { message: this.errorMessage } : this.errorMessage];
  }
}

export default ValidationError;
