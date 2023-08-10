import type { PositionJobDetailsRes, PositionSearchRes, SearchPositionReq } from './models';
import type { BaseId, BaseRecords } from '../../../shared/models';
import type { UserLocation } from '../../user/models';
import { GET_POSITION_DETAILS, SEARCH_POSITIONS } from '../job.map';
import { DbCollection } from '../../../shared/service/mongodb/constants';
import { ConversationStatusType } from '../conversation/constants';
import RecordValidator, { coordinateValidator } from '../../../shared/service/record-validator';
import positionQuery from './position.query';
import mongoDbService from '../../../shared/service/mongodb/mongo-db.service';

const positionService = {
  [SEARCH_POSITIONS]: async (
    payload: SearchPositionReq,
    userId?: BaseId,
    language?: string,
    userCoordinates?: UserLocation['coordinates']
  ): Promise<BaseRecords<PositionSearchRes>> => {
    const validation = new RecordValidator<SearchPositionReq>(payload, [
      [['skills', 'jobType'], { type: ['Array'] }],
      [['dateTo', 'dateFrom'], { type: ['Number'] }],
      ['maxDistance', { max: [500] }],
      ['inConversation', { type: ['Boolean'] }],
      ['location', { custom: [coordinateValidator] }],
      ['status', { equal: [ConversationStatusType, null, { valueReturn: true }] }],
    ]);

    const { page, ...rest } = validation.results;

    return await mongoDbService.find<PositionJobDetailsRes>(
      DbCollection.POSITIONS,
      positionQuery[SEARCH_POSITIONS](rest, userId, language, userCoordinates),
      { page }
    );
  },

  [GET_POSITION_DETAILS]: async (positionId: BaseId, userId?: BaseId, language?: string): Promise<PositionJobDetailsRes> => {
    return await mongoDbService.fineOne<PositionJobDetailsRes>(
      DbCollection.POSITIONS,
      positionQuery[GET_POSITION_DETAILS](positionId, userId, language)
    );
  },
};

export default positionService;
