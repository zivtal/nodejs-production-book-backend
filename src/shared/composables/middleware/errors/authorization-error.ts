import type { ErrorResponseMessage } from '../../../models/errors/error-response-message';
import CustomError from './custom-error';

class AuthorizationError extends CustomError {
  errorCode = 403;
  errorType = 'AUTHORIZATION_ERROR';

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }

  serializeErrors(): Array<ErrorResponseMessage> {
    return [{ message: this.message }];
  }
}

export default AuthorizationError;
