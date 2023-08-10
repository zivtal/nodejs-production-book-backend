import { AddAlbumReq } from './add-album-req';
import { BaseId } from '../../../../shared/models';

export type UpdateAlbumReq = Partial<Omit<AddAlbumReq, 'assets'>> & { albumId: BaseId };
