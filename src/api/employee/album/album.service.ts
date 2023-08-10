import type {
  AddAlbumReq,
  Album,
  Asset,
  GetAlbumsReq,
  UpdateAlbumReq,
  UpdateAssetReq,
  RemoveAlbumAssetsReq,
  UploadPhotoReq,
  GetAlbumReq,
  AddAssetReq,
} from './models';
import type { BaseId, BaseRecords, BaseResponse } from '../../../shared/models';
import {
  ADD_ALBUM,
  ADD_ALBUM_ASSETS,
  GET_ALBUM,
  GET_ALBUMS,
  REMOVE_ALBUM,
  REMOVE_ALBUM_ASSETS,
  UPDATE_ALBUM,
  UPDATE_ASSET,
  UPLOAD_PHOTO,
} from './album.map';
import { DbCollection, DbMessages } from '../../../shared/service/mongodb/constants';
import { AssetType } from '../../../shared/constants';
import { AlbumErrors } from './album.errors.enum';
import ValidationError from '../../../shared/composables/middleware/errors/validation-error';
import AwsCloud from '../../../shared/service/aws-cloud.service';
import RecordValidator, { ValidationMessage, mongoIdValidator } from '../../../shared/service/record-validator';
import { useVideoParser } from './helpers';
import { assetsValidator } from './validators';
import { LENGTH } from '../../../shared/constants';
import { generateId } from '../../../shared/helpers';
import { $match, $project, $set, $sort, $toObjectId } from '../../../shared/service/mongodb/helpers';
import mongoDbService from '../../../shared/service/mongodb/mongo-db.service';

const albumService = {
  [GET_ALBUMS]: async ({ userId, page }: GetAlbumsReq): Promise<BaseRecords<Album>> => {
    new RecordValidator({ userId }, [['userId', { required: [true], custom: [mongoIdValidator] }]]);

    return await mongoDbService.find<Album>(
      DbCollection.ALBUMS,
      [
        $match({ userId: $toObjectId(userId) }),
        $sort({ updatedAt: -1 }),
        $set({ total: { $size: '$assets' }, assets: { $arrayElemAt: ['$assets', 0] }, cover: { $ifNull: ['$cover', '$assets.thumb'] } }),
        $project({ assets: 0 }),
      ],
      { page }
    );
  },

  [GET_ALBUM]: async ({ albumId, updatedAt }: GetAlbumReq): Promise<Album & BaseResponse> => {
    new RecordValidator({ albumId }, [['albumId', { required: [true], custom: [mongoIdValidator] }]]);

    const album = await mongoDbService.fineOne<Album>(DbCollection.ALBUMS, [
      $match({ _id: $toObjectId(albumId), ...(updatedAt ? { updatedAt: { $gt: updatedAt } } : {}) }),
    ]);

    return { ...(album || {}), returnCode: album ? 0 : 1 };
  },

  [ADD_ALBUM]: async (albumReq: AddAlbumReq, userId: BaseId): Promise<Album & BaseResponse> => {
    const validator = new RecordValidator<AddAlbumReq>(
      albumReq,
      [
        ['name', { required: [true], minLength: [3] }],
        ['description', { maxLength: [LENGTH.DESCRIPTION] }],
        ['cover', { type: ['String'] }],
      ],
      { name: 1, assets: 1, description: 1 }
    );

    const { description = '', assets = [], ...restAlbumReq } = validator.results;
    const album = {
      userId: $toObjectId(userId),
      description,
      assets,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...restAlbumReq,
    } as Omit<Album, '_id'>;

    const { insertedId } = await mongoDbService.insertOne<Omit<Album, '_id'>>(DbCollection.ALBUMS, album);

    return { ...album, _id: insertedId, returnCode: insertedId ? 0 : 1 };
  },

  [UPDATE_ALBUM]: async (album: UpdateAlbumReq, userId: BaseId): Promise<BaseResponse> => {
    const validator = new RecordValidator(
      album,
      [
        ['albumId', { required: [true], custom: [mongoIdValidator] }],
        ['name', { required: [true], minLength: [2] }],
        ['description', { maxLength: [LENGTH.DESCRIPTION] }],
        ['cover', { type: ['String', 'Null'] }],
      ],
      { name: 1, description: 1, cover: 1, albumId: 0 }
    );

    const { returnCode } = await mongoDbService.updateOne(
      DbCollection.ALBUMS,
      { _id: $toObjectId(album.albumId), userId: $toObjectId(userId) },
      { $set: { ...validator.results, cover: validator.results.cover || null, updatedAt: Date.now() } }
    );

    return { returnCode };
  },

  [UPDATE_ASSET]: async (asset: UpdateAssetReq, userId: BaseId): Promise<BaseResponse> => {
    const validator = new RecordValidator<UpdateAssetReq>(
      asset,
      [
        ['albumId', { required: [true], custom: [mongoIdValidator] }],
        ['key', { required: [true] }],
        ['title', { type: ['String'], maxLength: [LENGTH.TITLE, ValidationMessage.MAX_LENGTH] }],
        ['description', { type: ['String'], maxLength: [LENGTH.DESCRIPTION, ValidationMessage.MAX_LENGTH] }],
      ],
      { albumId: 1, key: 1, description: 1, title: 1 }
    );

    const { albumId, key, ...update } = validator.results;

    const { returnCode } = await mongoDbService.updateOne<Asset>(
      DbCollection.ALBUMS,
      { _id: $toObjectId(albumId), userId: $toObjectId(userId), assets: { $elemMatch: { key } } },
      { $set: Object.entries(update).reduce((update, [key, value]) => ({ ...update, [`assets.$.${key}`]: value }), { updatedAt: Date.now() }) }
    );

    return { returnCode };
  },

  [REMOVE_ALBUM]: async (albumId: BaseId, userId: BaseId, development?: boolean): Promise<BaseResponse> => {
    new RecordValidator({ id: albumId }, [['id', { required: [true], custom: [mongoIdValidator] }]]);

    const { assets } = await mongoDbService.fineOne<Album>(DbCollection.ALBUMS, [$match({ _id: $toObjectId(albumId) })]);

    if (!development) {
      await Promise.all(assets.map(async ({ key }: Asset): Promise<any> => AwsCloud.delete(key)));
    }

    return await mongoDbService.deleteOne(DbCollection.ALBUMS, {
      _id: $toObjectId(albumId),
      userId: $toObjectId(userId),
    });
  },

  [UPLOAD_PHOTO]: async (albumId: BaseId, userId: BaseId, files: Array<Express.Multer.File>, { thumbs, sizes }: UploadPhotoReq) => {
    new RecordValidator({ albumId, photos: files }, [
      ['albumId', { required: [true], custom: [mongoIdValidator] }],
      ['photos', { minLength: [1] }],
    ]);

    const path = `albums/${userId}/${albumId}`;
    const imagesUrl = await AwsCloud.bulk(files, path);

    const assets: Array<Asset> = imagesUrl.map(({ location: url, key }, index) => {
      const fileName = files[index].originalname;

      return {
        title: '',
        type: AssetType.PHOTO,
        url,
        thumb: thumbs[index],
        fileName,
        fileSize: Number(sizes[index]),
        key,
      };
    });

    const { returnCode } = await mongoDbService.updateOne<Album>(
      DbCollection.ALBUMS,
      {
        _id: $toObjectId(albumId),
        userId: $toObjectId(userId),
      },
      { $push: { assets: { $each: assets } }, $set: { updatedAt: Date.now() } }
    );

    if (returnCode) {
      throw new ValidationError(AlbumErrors.PHOTO_UPLOAD_FAILED);
    }

    return { returnCode: 0 };
  },

  [ADD_ALBUM_ASSETS]: async (userId: BaseId, { albumId, assets }: AddAssetReq) => {
    new RecordValidator({ albumId, assets }, [
      ['albumId', { required: [true], custom: [mongoIdValidator] }],
      ['assets', { required: [true], type: ['Array'], minLength: [1], custom: [assetsValidator] }],
    ]);

    const insertAssets = assets.map(({ type, title, url, description, thumb }, index) => {
      switch (type) {
        case 'VIDEO':
          const videoParsing = useVideoParser(url);

          return videoParsing
            ? { type: videoParsing.type, url: videoParsing.id, title, description, key: generateId(videoParsing.id + index), thumb }
            : { type, title, url, description, key: generateId(url + index), thumb };
        default:
          return { type, title, url, description, key: generateId(url + index), thumb };
      }
    });

    const { returnCode } = await mongoDbService.updateOne<Album>(
      DbCollection.ALBUMS,
      {
        _id: $toObjectId(albumId),
        userId: $toObjectId(userId),
      },
      { $push: { assets: { $each: insertAssets } }, $set: { updatedAt: Date.now() } }
    );

    if (returnCode) {
      throw new ValidationError(AlbumErrors.PHOTO_UPLOAD_FAILED);
    }

    return { returnCode: 0 };
  },

  [REMOVE_ALBUM_ASSETS]: async (userId: BaseId, payload: RemoveAlbumAssetsReq, development?: boolean) => {
    const validator = new RecordValidator<RemoveAlbumAssetsReq>(
      payload,
      [
        ['albumId', { required: [true], custom: [mongoIdValidator] }],
        ['assets', { minLength: [1] }],
      ],
      { albumId: 1, assets: 1 }
    );

    const { albumId, assets } = validator.results;

    if (!development) {
      const photos = assets.filter(({ type }) => type === 'PHOTO');
      await Promise.all(photos.map(({ key }) => AwsCloud.delete(key)));
    }

    const assetsKeys = assets.map(({ key }) => key);
    const { returnCode } = await mongoDbService.updateOne<Album>(
      DbCollection.ALBUMS,
      {
        _id: $toObjectId(albumId),
        userId: $toObjectId(userId),
      },
      { $pull: { assets: { key: { $in: assetsKeys } } }, $set: { updatedAt: Date.now() } }
    );

    if (returnCode) {
      throw new ValidationError(DbMessages.QUERY_FAILED);
    }

    return { returnCode };
  },
};

export default albumService;
