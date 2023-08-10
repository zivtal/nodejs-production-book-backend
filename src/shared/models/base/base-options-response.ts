import { BaseItem } from './base-item';
import { BaseResponse } from './base-response';

export interface BaseOptionsResponse<T = any> extends BaseResponse {
  options: Array<BaseItem<T>>;
}
