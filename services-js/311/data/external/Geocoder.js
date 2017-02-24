// @flow

import 'isomorphic-fetch';

const SHOW_NEIGHBORHOOD = false;

function componentsWithTypes(components, ...types) {
  return components.filter((c) => {
    for (let t = 0; t < types.length; t++) {
      if (c.types.indexOf(types[t]) !== -1) {
        return true;
      }
    }

    return false;
  }).map((c) => c.short_name);
}

export type ReverseGeocode = {|
  address: string,
  location: {|
    lat: number,
    lng: number,
  |},
|}

export default class Geocoder {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async handleReverseGeocode(resPromise: Promise<Response>): Promise<?ReverseGeocode> {
    const res = await resPromise;
    if (!res.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const json = await res.json();

    if (json.error_message) {
      throw new Error(json.error_message);
    }

    const result = json.results[0];
    if (!result) {
      return null;
    }

    const components = result.address_components;
    const line1 = componentsWithTypes(components, 'street_number', 'route', 'establishment', 'point_of_interest', 'premise');
    const line15 = SHOW_NEIGHBORHOOD ? componentsWithTypes(components, 'neighborhood') : '';
    const line2 = componentsWithTypes(components, 'locality', 'administrative_area_level_1', 'postal_code');

    if (line2[0] !== 'Boston' || line2[1] !== 'MA') {
      return null;
    }

    const address = `${line1.join(' ')}\n${line15.length ? `${line15[0]}\n` : ''}${line2[0]}, ${line2[1]} ${line2[2] || ''}`;
    return {
      address,
      location: result.geometry.location,
    };
  }

  place(placeId: string): Promise<?ReverseGeocode> {
    return this.handleReverseGeocode(fetch(`https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${this.apiKey}`));
  }

  // Returns the address in two lines, separated by a newline, with street
  // address on top and city / state / zip below
  address({ lat, lng }: {| lat: number, lng: number |}): Promise<?ReverseGeocode> {
    return this.handleReverseGeocode(fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`));
  }
}
