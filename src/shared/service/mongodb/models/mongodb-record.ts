import type { MongoDbScheme } from './mongo-db-scheme';

interface DbRecord<Scheme, Source, Target = Source> {
  as?: string;
  from: string;
  localField: keyof Source | keyof Target;
  foreignField?: string;
  pipeline?: any;
  scheme?: MongoDbScheme<Scheme>;
}

export type MongodbRecord<Scheme, Source, Target = Source> = DbRecord<Scheme, Source, Target>;
