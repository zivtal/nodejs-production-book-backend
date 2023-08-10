import type { BaseRequest, BaseRecords } from '../../../shared/models';
import type { SearchPositionReq, PositionJobDetailsRes, PositionSearchRes } from './models';
import type { Response } from 'express';

import { GET_POSITION_DETAILS, SEARCH_POSITIONS } from '../job.map';
import positionService from './position.service';

const positionController = {
  [SEARCH_POSITIONS]: async (req: BaseRequest<SearchPositionReq>, res: Response<BaseRecords<PositionSearchRes>>): Promise<void> => {
    const positions = await positionService[SEARCH_POSITIONS](req.body, req.sender?.id, req.language, req.coordinates);

    res.send(positions);
  },

  [GET_POSITION_DETAILS]: async (req: BaseRequest, res: Response<PositionJobDetailsRes>): Promise<void> => {
    const position = await positionService[GET_POSITION_DETAILS](req.params.id, req.sender?.id, req.language);

    res.send(position);
  },
};

export default positionController;
