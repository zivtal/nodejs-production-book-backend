import type { Response } from 'express';
import type {
  Album,
  GetAlbumsReq,
  AddAlbumReq,
  RemoveAlbumAssetsReq,
  UpdateAlbumReq,
  UploadPhotoReq,
  GetAlbumReq,
  AddAssetReq,
  UpdateAssetReq,
} from './models';
import type { BaseRecords, BaseRequest, BaseResponse } from '../../../shared/models';
import {
  GET_ALBUMS,
  GET_ALBUM,
  ADD_ALBUM,
  UPDATE_ALBUM,
  REMOVE_ALBUM,
  UPLOAD_PHOTO,
  REMOVE_ALBUM_ASSETS,
  ADD_ALBUM_ASSETS,
  UPDATE_ASSET,
} from './album.map';
import albumService from './album.service';
import { AuthErrors } from '../../auth/auth.errors.enum';
import AuthorizationError from '../../../shared/composables/middleware/errors/authorization-error';
import AuthenticationError from '../../../shared/composables/middleware/errors/authentication-error';

const albumController = {
  [GET_ALBUMS]: async (req: BaseRequest<GetAlbumsReq>, res: Response<BaseRecords<Album>>) => {
    const send = await albumService[GET_ALBUMS](req.body);
    res.json(send);
  },

  [GET_ALBUM]: async (req: BaseRequest<GetAlbumReq>, res: Response<Album>) => {
    const send = await albumService[GET_ALBUM](req.body);
    res.json(send);
  },

  [ADD_ALBUM]: async (req: BaseRequest<AddAlbumReq>, res: Response<Album>) => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    const send = await albumService[ADD_ALBUM](req.body, req.sender.id);
    res.json(send);
  },

  [UPDATE_ALBUM]: async (req: BaseRequest<UpdateAlbumReq>, res: Response<BaseResponse>) => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    res.json(await albumService[UPDATE_ALBUM](req.body, req.sender.id));
  },

  [UPDATE_ASSET]: async (req: BaseRequest<UpdateAssetReq>, res: Response<BaseResponse>) => {
    if (!req.sender?.id) {
      throw new AuthorizationError(AuthErrors.UNAUTHORIZED);
    }

    res.json(await albumService[UPDATE_ASSET](req.body, req.sender.id));
  },

  [REMOVE_ALBUM]: async (req: BaseRequest<never, never>, res: Response<BaseResponse>) => {
    const { sender, development } = req;

    if (!sender) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const { returnCode } = await albumService[REMOVE_ALBUM](req.params.id, sender.id, development);

    res.json({ returnCode });
  },

  [ADD_ALBUM_ASSETS]: async (req: BaseRequest<AddAssetReq>, res: Response<BaseResponse>) => {
    if (!req.sender?.id) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    res.json(await albumService[ADD_ALBUM_ASSETS](req.sender.id, req.body));
  },

  [UPLOAD_PHOTO]: async (req: BaseRequest<UploadPhotoReq, never>, res: Response<BaseResponse>) => {
    if (!req.sender?.id) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    const { id } = req.params;
    const photos = req.files as Array<Express.Multer.File>;
    const thumbs = Array.isArray(req.body.thumbs) ? req.body.thumbs : [req.body.thumbs];
    const sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];

    res.json(await albumService[UPLOAD_PHOTO](id, req.sender.id, photos, { thumbs, sizes }));
  },

  [REMOVE_ALBUM_ASSETS]: async (req: BaseRequest<RemoveAlbumAssetsReq>, res: Response<BaseResponse>) => {
    const { sender, development } = req;

    if (!sender) {
      throw new AuthenticationError(AuthErrors.UNAUTHORIZED);
    }

    res.json(await albumService[REMOVE_ALBUM_ASSETS](sender.id, req.body, development));
  },
};

export default albumController;
