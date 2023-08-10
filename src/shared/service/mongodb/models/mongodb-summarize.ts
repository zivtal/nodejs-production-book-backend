export interface MongodbSummarize {
  fields: Record<string, 'avg' | 'sum'>;
  from: string;
  as: string;
  returnField?: { from: string; as: string; value?: string; removeFields?: Array<string> };
}
