import type { NextFunction, Response } from 'express';
import type { BaseRequest, BaseErrorResponse } from '../../models';
import CustomError from './errors/custom-error';

export function errorHandler(error: Error, req: BaseRequest, res: Response<BaseErrorResponse>, next: NextFunction) {
  if (error instanceof CustomError) {
    return res.status(error.errorCode).send({ errorCode: error.errorCode, errorMessage: error.serializeErrors() });
  }
}
