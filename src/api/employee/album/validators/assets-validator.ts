import type { AddAssetReq, Asset } from '../models';
import RecordValidator, { type CustomValidator, ValidationMessage } from '../../../../shared/service/record-validator';
import { AssetType } from '../../../../shared/constants';
import RegexPattern from '../../../../shared/constants/regex-pattern';
import { LENGTH } from '../../../../shared/constants';

export const assetsValidator: CustomValidator = (assets: AddAssetReq['assets']) => {
  for (const asset of assets || []) {
    const validate = new RecordValidator<Omit<Asset, 'key'>>(
      asset,
      [
        ['type', { required: [true], equal: [AssetType, null, { valueReturn: true }] }],
        ['url', { required: [true], regex: [[RegexPattern.VIMEO_ID, RegexPattern.YOUTUBE_ID]] }],
        ['title', { required: [true], maxLength: [LENGTH.COMMENT, ValidationMessage.MAX_LENGTH] }],
        ['description', { maxLength: [LENGTH.DESCRIPTION, ValidationMessage.MAX_LENGTH] }],
        ['thumb', { type: ['String'] }],
      ],
      { type: 1, url: 1, title: 1, description: 1 }
    );

    if (validate.errors?.length) {
      return [false, validate.errors[0].message, validate.errors[0].value];
    }
  }

  return [true];
};
