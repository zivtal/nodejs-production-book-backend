import type { MongoDbScheme, MongodbUpdateOne } from './models';
import type { BaseResponse, BaseRecords, BasePagination } from '../../models';
import type { ObjectId, UpdateOptions, UpdateResult, DeleteResult, InsertOneResult, Document } from 'mongodb';

import * as Mongo from 'mongodb';
import config from '../../../config';
import ValidationError from '../../composables/middleware/errors/validation-error';
import { DbMessages } from './constants';
import InternalError from '../../composables/middleware/errors/internal-error';
import { USER_CONFIGURATION } from '../../../api/user/user.constants';
import { AggregationCursor } from 'mongodb';

export type DbQuery = Array<Record<string, any>>;
type Pagination = { page?: BasePagination; unlimited?: boolean };

type Find<Target> = Promise<BaseRecords<Target>>;
type FindAll<Target> = Promise<Array<Target>>;

const { DB_NAME, DB_RUI } = config;

export class MongoDbService {
  private readonly dbName: string;
  private readonly dbRui: string;
  private readonly printUri: string;
  private dbConnection: Mongo.Db | undefined;
  private schemeProtected = { [USER_CONFIGURATION]: 0, userId: 0, lastSeenAt: 0 };

  constructor(dbName: string, dbRui: string) {
    this.dbName = dbName;
    this.dbRui = dbRui;
    this.printUri = dbRui.replace(/(=?\/\/(.*?)(?=@))/i, '//').replace(/(\?(.*))/g, '') as string;

    (async () => await this.connect())();
  }

  public async find<Source, Target = Source>(collectionName: string, query: DbQuery, pagination?: Pagination): Find<Target> {
    const { size = 20, index = 0 } = pagination?.page || {};
    const data = [...(pagination?.unlimited ? [] : [{ $skip: index * size }, { $limit: size }]), { $project: this.schemeProtected }];

    const value = [...this.reQuery(query), { $facet: { data, page: [{ $count: 'total' }] } }];

    try {
      // console.log('mongoService:findOne', `db.${collectionName}.aggregate(${JSON.stringify(value)})`);
      const collection = await this.get<Source>(collectionName);
      const document = (await collection.aggregate(value).toArray())[0];

      return {
        data: document.data,
        page: pagination?.unlimited ? {} : { index, size, total: Math.ceil((document.page[0]?.total || 0) / size) },
        total: document.page[0]?.total || 0,
      };
    } catch (e) {
      console.error('ERROR', 'mongoService:findOne', `db.${collectionName}.aggregate(${JSON.stringify(value)})`);
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async findAll<Source, Target = Source>(collectionName: string, query: DbQuery, returnQuery?: boolean): FindAll<Target> {
    try {
      // console.log('mongoDbService:findAll',`db.${collectionName}.aggregate(${JSON.stringify(query)})`);
      const collection = await this.get<Source>(collectionName);

      return (await collection.aggregate([...this.reQuery(query), { $project: this.schemeProtected }]).toArray()) as Array<Target>;
    } catch (e) {
      console.error('ERROR', 'mongoDbService:findAll', `db.${collectionName}.aggregate(${JSON.stringify(query)})`);
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async fineOne<Source, Target = Source>(collectionName: string, query: DbQuery, isProtected?: boolean): Promise<Target> {
    const value = [...this.reQuery(query), { $limit: 1 }, ...(isProtected ? [] : [{ $project: this.schemeProtected }])];

    try {
      // console.log('mongoService:findOne', `db.${collectionName}.aggregate(${JSON.stringify(query)})`);
      const collection = await this.get<Source>(collectionName);
      const document = (await collection.aggregate(value).toArray())[0];

      return document as Target;
    } catch (e) {
      console.error('ERROR', 'mongoService:findOne', `db.${collectionName}.aggregate(${JSON.stringify(value)})`);
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async insertOne<Source>(
    collectionName: string,
    item: Mongo.OptionalUnlessRequiredId<Source & Mongo.Document>
  ): Promise<BaseResponse & InsertOneResult<Source>> {
    try {
      const collection = await this.get<Source>(collectionName);
      const res = await collection.insertOne(item);

      if (!res.insertedId) {
        throw new ValidationError(DbMessages.QUERY_FAILED);
      }

      return { ...res, returnCode: 0 };
    } catch (e) {
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async replaceOne<Source>(
    collectionName: string,
    filter: Record<string, any>,
    update: Mongo.WithoutId<Source & Mongo.Document>,
    options: Mongo.ReplaceOptions
  ): Promise<BaseResponse & (Mongo.UpdateResult | Mongo.Document)> {
    try {
      const collection = await this.get<Source>(collectionName);
      const dbResult = await collection.replaceOne(filter, update, options);

      return { returnCode: !dbResult.upsertedCount && !dbResult.modifiedCount ? 1 : 0, ...dbResult };
    } catch (e) {
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async findOneAndUpdate<Source>(
    collectionName: string,
    filter: Record<string, any>,
    update: Mongo.MatchKeysAndValues<Source & Mongo.Document>,
    option: Mongo.FindOneAndUpdateOptions = {}
  ): Promise<BaseResponse & { value: Source }> {
    const { _id, ...rest } = update;

    try {
      const collection = await this.get<Source>(collectionName);
      const { ok, value } = await collection.findOneAndUpdate(filter, rest, { returnDocument: 'after', ...option });

      return { value, returnCode: !ok || !value ? 1 : 0 } as { value: Source } & BaseResponse;
    } catch (e) {
      console.error(`db.${collectionName}.findOneAndUpdate(${JSON.stringify(filter)},${JSON.stringify(update)})`);
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async updateOne<Source>(
    collectionName: string,
    filter: Record<string, any>,
    update: MongodbUpdateOne,
    options: UpdateOptions = {}
  ): Promise<BaseResponse & UpdateResult> {
    try {
      const collection = await this.get<Source>(collectionName);
      const dbResult = await collection.updateOne(filter, update, options);

      return { returnCode: !dbResult.upsertedCount && !dbResult.modifiedCount ? 1 : 0, ...dbResult };
    } catch (e) {
      console.error(`db.${collectionName}.updateOne(${JSON.stringify(filter)},${JSON.stringify(update)})`);
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async deleteMany<Source>(collectionName: string, filter: Record<string, any>): Promise<BaseResponse & DeleteResult> {
    try {
      const collection = await this.get<Source>(collectionName);
      const dbResult = await collection.deleteMany(filter);

      return { returnCode: 0, ...dbResult };
    } catch (e) {
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  public async deleteOne<Source>(collectionName: string, filter: Record<string, any>): Promise<BaseResponse & DeleteResult> {
    try {
      const collection = await this.get<Source>(collectionName);
      const dbResult = await collection.deleteOne(filter);

      if (!dbResult.deletedCount) {
        throw new ValidationError(DbMessages.QUERY_FAILED);
      }

      return { returnCode: 0, ...dbResult };
    } catch (e) {
      throw new InternalError(DbMessages.QUERY_FAILED);
    }
  }

  private async get<Source>(collectionName: string, retry: boolean = false): Promise<Mongo.Collection<Source & Mongo.Document>> {
    try {
      return this.dbConnection!.collection<Source & Mongo.Document>(collectionName);
    } catch (err) {
      if (!retry) {
        await this.connect();

        return await this.get<Source>(collectionName, true);
      }

      throw new ValidationError(DbMessages.QUERY_FAILED);
    }
  }

  public async aggregate<Source, Target = Source>(
    collectionName: string,
    query: DbQuery,
    scheme?: MongoDbScheme<Target>
  ): Promise<AggregationCursor<Target>> {
    try {
      const collection = await this.get<Source>(collectionName);

      return collection.aggregate<Target & Document>([...this.reQuery(query), ...(scheme ? [{ $project: this.schemeProtected }] : [])]);
    } catch (err) {
      throw new ValidationError(DbMessages.QUERY_FAILED);
    }
  }

  public $toObjectId(id: string): ObjectId {
    try {
      return new Mongo.ObjectId(id);
    } catch (err) {
      throw new ValidationError(DbMessages.INVALID_ID);
    }
  }

  private reQuery(query: DbQuery): DbQuery {
    return query.reduce((map: DbQuery, value) => [...map, ...(Array.isArray(value) ? value : [value])], []);
  }

  private async connect() {
    try {
      const client: Mongo.MongoClient = new Mongo.MongoClient(this.dbRui);
      await client.connect();
      this.dbConnection = client.db(this.dbName);
      console.info('mongoDbService:connect', 'Successfully', this.printUri);
    } catch (e) {
      console.error('mongoDbService:connect', 'Failed', this.printUri);
    }
  }
}

export default new MongoDbService(DB_NAME!, DB_RUI!);
