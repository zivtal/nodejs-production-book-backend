import type { ErrorResponseMessage } from '../../../models/errors/error-response-message';
import CustomError from './custom-error';

class InternalError extends CustomError {
  errorCode = 500;
  errorType = 'INTERNAL_ERROR';

  constructor(message: any) {
    super(message);

    Object.setPrototypeOf(this, InternalError.prototype);
  }

  serializeErrors(): Array<ErrorResponseMessage> {
    return [{ message: this.message }];
  }
}

export default InternalError;
