type Keys = '$set' | '$unset' | '$pull' | '$push';
type KeyMap<T> = { [K in Keys]: T };

export type MongodbUpdateOne<T = any> = Partial<KeyMap<T>>;
