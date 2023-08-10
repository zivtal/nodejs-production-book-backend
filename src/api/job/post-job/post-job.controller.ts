import type { Response } from 'express';
import type { BaseRequest, BaseResponse, BaseRecords } from '../../../shared/models';
import type { CreatePostJobReq, JobSearchPostJobsReq, GetJobDetailsRes, SearchPostJobRes, UpdatePostJobReq } from './models';

import { CREATE_JOB_POST, GET_JOB_DETAILS, SEARCH_JOB_POSTS, UPDATE_JOB_POST } from '../job.map';
import AuthorizationError from '../../../shared/composables/middleware/errors/authorization-error';
import { AuthErrors } from '../../auth/auth.errors.enum';
import postJobService from './post-job.service';

const postJobController = {
  [CREATE_JOB_POST]: async (req: BaseRequest<CreatePostJobReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const { returnCode } = await postJobService[CREATE_JOB_POST]({ ...req.body, createdAt: Date.now(), updatedAt: Date.now() }, req.sender.id);

    res.send({ returnCode });
  },

  [UPDATE_JOB_POST]: async (req: BaseRequest<UpdatePostJobReq>, res: Response<BaseResponse>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    await postJobService[UPDATE_JOB_POST](req.body, req.sender?.id);
    res.send({ returnCode: 0 });
  },

  [SEARCH_JOB_POSTS]: async (req: BaseRequest<JobSearchPostJobsReq>, res: Response<BaseRecords<SearchPostJobRes>>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const jobs = await postJobService[SEARCH_JOB_POSTS](req.body, req.sender.id);

    res.send(jobs);
  },

  [GET_JOB_DETAILS]: async (req: BaseRequest, res: Response<GetJobDetailsRes>): Promise<void> => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const job = await postJobService[GET_JOB_DETAILS](req.params.id, req.sender.id);

    res.send(job);
  },
};

export default postJobController;
