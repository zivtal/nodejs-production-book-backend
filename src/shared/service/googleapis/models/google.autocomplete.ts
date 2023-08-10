interface Location {
  lat: number;
  lng: number;
}

interface Viewport {
  northeast: Location;
  southwest: Location;
}

interface Geometry {
  location: Location;
  viewport: Viewport;
}

interface Photo {
  width: number;
  height: number;
  html_attributions: Array<string>;
  photo_reference: string;
}

interface PlusCode {
  compound_code: string;
  global_code: string;
}

export interface GoogleAutocompleteResult {
  business_status: string;
  formatted_address: string;
  geometry: Geometry;
  icon: string;
  icon_background_color: string;
  icon_mask_base_uri: string;
  name: string;
  photos: Array<Photo>;
  place_id: string;
  plus_code: PlusCode;
  rating: number;
  reference: string;
  types: Array<string>;
  user_ratings_total: number;
}

type Status = 'OK' | 'ZERO_RESULTS' | 'NOT_FOUND' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';

export interface GoogleAutocomplete {
  html_attributions: Array<string>;
  results: Array<GoogleAutocompleteResult>;
  status: Status;
  info_messages: Array<string>;
}
