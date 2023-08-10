export type MongoDbScheme<U> = Partial<{ [K in keyof U]: 0 | 1 | `$${string}` | { [key: string]: any } | MongoDbScheme<K> }>;
