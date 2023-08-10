import type { ProfileExtendDetails, EmployeeSearchReq, ProfileFullDetails, EmployeeUpdateProfileReq, ListCompaniesRes } from './models';
import type { Response } from 'express';
import type { BaseRequest, BaseRecords, BaseResponse } from '../../shared/models';

import { GET_EMPLOYEE_DETAILS, LIST_COMPANIES, SEARCH_EMPLOYEES, UPDATE_EMPLOYEE_PROFILE } from './employee.map';
import employeeService from './employee.service';
import albumController from './album/album.controller';
import reviewController from './review/review.controller';
import AuthenticationError from '../../shared/composables/middleware/errors/authentication-error';
import { AuthErrors } from '../auth/auth.errors.enum';

const employeeController = {
  [LIST_COMPANIES]: async (req: BaseRequest<never, { search: string }>, res: Response<ListCompaniesRes>) => {
    res.send(await employeeService[LIST_COMPANIES](req.query.search));
  },

  [SEARCH_EMPLOYEES]: async (req: BaseRequest<EmployeeSearchReq>, res: Response<BaseRecords<ProfileExtendDetails>>): Promise<void> => {
    req.body.coordinates ??= req.coordinates;

    res.send(await employeeService[SEARCH_EMPLOYEES](req.body, req.language));
  },

  [GET_EMPLOYEE_DETAILS]: async (req: BaseRequest<any, { id: string }>, res: Response<ProfileFullDetails>): Promise<void> => {
    res.send(await employeeService[GET_EMPLOYEE_DETAILS](req.query.id, req.sender?.id, req.language));
  },

  [UPDATE_EMPLOYEE_PROFILE]: async (
    req: BaseRequest<Partial<EmployeeUpdateProfileReq>>,
    res: Response<BaseResponse & Partial<EmployeeUpdateProfileReq>>
  ): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    res.send(await employeeService[UPDATE_EMPLOYEE_PROFILE](req.sender.id, req.body));
  },

  ...albumController,
  ...reviewController,
};

export default employeeController;
