import { ErrorResponseMessage } from '../errors/error-response-message';

export interface BaseErrorResponse {
  errorCode?: number;
  errorMessage: Array<ErrorResponseMessage>;
}
