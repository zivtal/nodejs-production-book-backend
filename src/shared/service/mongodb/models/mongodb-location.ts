export interface MongodbLocation {
  type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon';
  coordinates: [number, number];
}
