import { Asset } from './asset';

export interface AddAlbumReq {
  name: string;
  description?: string;
  assets?: Array<Asset>;
  cover?: string;
}
