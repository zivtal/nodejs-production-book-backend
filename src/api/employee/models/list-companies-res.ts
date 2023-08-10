import type { BaseResponse } from '../../../shared/models';

export interface ListCompaniesRes extends BaseResponse {
  companies: Array<string>;
}
