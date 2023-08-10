import type { Response } from 'express';
import type { BaseRequest, BaseOptionsResponse } from '../../shared/models';
import type { UserLocation } from '../user/models';
import { LIST_ADDRESSES } from './location.maps';
import locationService from './location.service';

const locationController = {
  [LIST_ADDRESSES]: async (req: BaseRequest<never, { search: string }>, res: Response<BaseOptionsResponse<UserLocation>>): Promise<void> => {
    if (!req.query.search) {
      return;
    }

    res.send(await locationService[LIST_ADDRESSES](req.query.search, req.language));
  },
};

export default locationController;
