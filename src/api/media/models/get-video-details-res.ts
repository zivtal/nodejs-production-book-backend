import type { BaseResponse } from '../../../shared/models';

export interface GetVideoDetailsRes extends BaseResponse {
  id: string;
  publishedAt: string;
  title: string;
  description: string;
  thumb: string;
  tags: Array<string>;
}
