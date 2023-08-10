import type { EmployeeSearchReq, EmployeeUpdateProfileReq, ListCompaniesRes, ProfileExtendDetails, ProfileFullDetails } from './models';
import type { BaseId, BaseRecords, BaseResponse } from '../../shared/models';
import type { DocumentUser } from '../user/models';
import { GET_EMPLOYEE_DETAILS, LIST_COMPANIES, SEARCH_EMPLOYEES, UPDATE_EMPLOYEE_PROFILE } from './employee.map';
import { DbCollection } from '../../shared/service/mongodb/constants';
import RegexPattern from '../../shared/constants/regex-pattern';
import RecordValidator, { coordinateValidator, mongoIdValidator, ValidationMessage } from '../../shared/service/record-validator';
import { wageValidator } from './helpers';
import { LENGTH } from '../../shared/constants';
import { PROFILE_UPDATE_PROFILE_SCHEME } from './constants';
import mongoDbService from '../../shared/service/mongodb/mongo-db.service';
import employeeQuery from './employee.query';
import { $toObjectId } from '../../shared/service/mongodb/helpers';

const employeeService = {
  [LIST_COMPANIES]: async (query: string): Promise<ListCompaniesRes> => {
    const { companies = [] } = await mongoDbService.fineOne<DocumentUser, { companies: ListCompaniesRes['companies'] }>(
      DbCollection.USERS,
      employeeQuery[LIST_COMPANIES](query)
    );

    return { companies, returnCode: companies.length ? 0 : 1 };
  },

  [SEARCH_EMPLOYEES]: async ({ page, coordinates, ...payload }: EmployeeSearchReq, language?: string): Promise<BaseRecords<ProfileExtendDetails>> => {
    return await mongoDbService.find<ProfileExtendDetails>(
      DbCollection.USERS,
      employeeQuery[SEARCH_EMPLOYEES]({ coordinates, ...payload }, language),
      {
        page,
      }
    );
  },

  [GET_EMPLOYEE_DETAILS]: async (userId: BaseId, senderId?: BaseId, language?: string): Promise<ProfileFullDetails> => {
    new RecordValidator({ id: userId }, [['id', { required: [true], custom: [mongoIdValidator] }]]);

    return mongoDbService.fineOne<DocumentUser, ProfileFullDetails>(
      DbCollection.USERS,
      employeeQuery[GET_EMPLOYEE_DETAILS](userId, senderId, language)
    );
  },

  [UPDATE_EMPLOYEE_PROFILE]: async (
    userId: BaseId,
    updateFields: Partial<EmployeeUpdateProfileReq>
  ): Promise<BaseResponse & Partial<EmployeeUpdateProfileReq>> => {
    const validator = new RecordValidator<Partial<EmployeeUpdateProfileReq>>(
      updateFields,
      [
        ['avatar', { type: [['String', 'Null']] }],
        ['birthday', { type: [['Number', 'Null']], regex: [RegexPattern.TIMESTAMP, ValidationMessage.INVALID_TIMESTAMP] }],
        ['phone', { regex: [RegexPattern.PHONE.HE, ValidationMessage.INVALID_PHONE_NUMBER] }],
        ['location', { custom: [coordinateValidator] }],
        ['lastName', { regex: [RegexPattern.NAME], minLength: [2] }],
        ['firstName', { regex: [RegexPattern.NAME], minLength: [2] }],
        ['wage', { custom: [wageValidator] }],
        ['specialization', { minLength: [1] }],
        ['skills', { minLength: [1] }],
        ['about', { maxLength: [LENGTH.RICH_TEXT] }],
      ],
      PROFILE_UPDATE_PROFILE_SCHEME,
      { skipUndefined: true }
    );

    const { returnCode } = await mongoDbService.findOneAndUpdate<DocumentUser>(
      DbCollection.USERS,
      { _id: $toObjectId(userId) },
      { $set: validator.results }
    );

    return { returnCode, ...validator.results };
  },
};

export default employeeService;
