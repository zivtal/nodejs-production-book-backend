import type { Request } from 'express';
import type { DocumentUser, UserLocation } from '../../../api/user/models';
import type { AccessToken } from '../../service/token/models/access-token';
import * as core from 'express-serve-static-core';

export interface BaseRequest<ReqBody = any, ReqQuery = core.Query> extends Request<core.ParamsDictionary, any, ReqBody, ReqQuery> {
  development?: boolean;
  currency?: string;
  language?: string;
  sender?: AccessToken | null;
  coordinates?: UserLocation['coordinates'];
  skills?: DocumentUser['skills'];
  specialization?: DocumentUser['skills'];
  isAsMode?: boolean;
}
