import type { Response } from 'express';
import type { BaseRequest, BaseResponse } from '../../shared/models';
import type { GetVideoDetailsRes, GetVideoDetailsReq } from './models';
import { GET_VIDEO_DETAILS } from './media.maps';
import mediaService from './media.service';

const mediaController = {
  [GET_VIDEO_DETAILS]: async (req: BaseRequest<GetVideoDetailsReq>, res: Response<GetVideoDetailsRes | BaseResponse>): Promise<void> => {
    res.send(await mediaService[GET_VIDEO_DETAILS](req.body.url));
  },
};

export default mediaController;
