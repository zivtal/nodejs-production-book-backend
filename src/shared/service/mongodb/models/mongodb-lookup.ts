export type MongodbLookup<Scheme, Source> = {
  from: string;
  foreignField?: keyof Scheme | string;
  localField?: keyof Source | string;
  let?: any;
  as?: string;
  pipeline?: Array<Record<string, Record<string, any>>>;
};
