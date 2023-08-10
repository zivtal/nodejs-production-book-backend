import type { BaseItem, BaseOptionsResponse } from '../../shared/models';
import type { GoogleAutocompleteResult } from '../../shared/service/googleapis/models';
import type { UserLocation } from '../user/models';
import { LIST_ADDRESSES } from './location.maps';
import GoogleMaps from '../../shared/service/googleapis/google-maps.service';
import InternalError from '../../shared/composables/middleware/errors/internal-error';

const locationService = {
  [LIST_ADDRESSES]: async (query: string, language?: string): Promise<BaseOptionsResponse<UserLocation>> => {
    try {
      const res = await GoogleMaps.getLocationByPlace(query, language);

      const options = (res?.results || []).map(
        ({ name, formatted_address, geometry, place_id, icon }: GoogleAutocompleteResult): BaseItem<UserLocation> => ({
          title: formatted_address.includes(name) ? formatted_address : `${name} - ${formatted_address}`,
          value: {
            id: place_id,
            type: 'Point',
            title: name || formatted_address,
            coordinates: [geometry.location.lat, geometry.location.lng],
            address: formatted_address,
            icon,
          },
          icon,
        })
      );

      return { returnCode: res.status === 'OK' ? 0 : 1, options };
    } catch (err) {
      throw new InternalError(err);
    }
  },
};

export default locationService;
