import type { UserLocation } from '../../../user/models';

export const addDistanceField = (coordinates?: UserLocation['coordinates'], maxDistance?: number) =>
  coordinates
    ? [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: coordinates },
            distanceField: 'distance',
            ...(maxDistance ? { maxDistance } : {}),
            spherical: true,
          },
        },
      ]
    : [];
