import type { ErrorResponseMessage } from '../../../models/errors/error-response-message';
import CustomError from './custom-error';

class NotFoundError extends CustomError {
  errorCode = 404;
  errorType = 'NOT_FOUND_ERROR';

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): Array<ErrorResponseMessage> {
    return [{ message: this.message }];
  }
}

export default NotFoundError;
