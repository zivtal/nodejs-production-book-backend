import type { MongodbLocation } from '../../../shared/service/mongodb/models';

export interface UserLocation extends MongodbLocation {
  id: string;
  title: string;
  place?: string;
  address: string;
  icon?: string;
}
