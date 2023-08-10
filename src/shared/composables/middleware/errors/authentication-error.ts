import type { ErrorResponseMessage } from '../../../models/errors/error-response-message';
import CustomError from './custom-error';

class AuthenticationError extends CustomError {
  errorCode = 401;
  errorType = 'AUTHENTICATION_ERROR';

  constructor(message: string, private property?: string) {
    super(message);

    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }

  serializeErrors(): Array<ErrorResponseMessage> {
    return [{ message: this.message, property: this.property }];
  }
}

export default AuthenticationError;
