// @flow

import 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';

type SpatialReference = {
  wkid: number,
  latestWkid: number,
}

type ReverseGeocodeResponse = {
  address: {
    Street: string,
    City: string,
    State: string,
    ZIP: string,
    Match_addr: string,
    Loc_name: string,
  },
  location: {
    x: number,
    y: number,
    spatialReference: SpatialReference,
  }
} | {
  error: {
    code: number,
    message: string,
    details: string[],
  }
}

type FindAddressCandidate = {
  address: string,
  location: {
   x: number,
   y: number,
  },
  score: number,
  attributes: {
    Loc_name: string,
    Ref_ID: number,
  },
  extent: {
   xmin: number,
   ymin: number,
   xmax: number,
   ymax: number,
  }
};

type FindAddressResponse = {
  spatialReference: SpatialReference,
  candidates: FindAddressCandidate[],
};

type SearchResult = {
  location: {
    lat: number,
    lng: number,
  },
  address: string,
  addressId: ?string,
}

function formatAddress(address: string): string {
  if (!address) {
    return address;
  }

  // Intersections don't have a zip code
  const hasZip = !address.endsWith(', MA');
  const hasMa = address.indexOf(', MA') !== -1;

  // Assume that the last two commas are for city and state. Not sure if this is
  // a good assumption, but we do see multiple commas in the first line.
  // E.g.: 764 E BROADWAY, 1, SOUTH BOSTON, MA, 02127
  const parts = address.split(/, /);

  // -3 because we want 3 pieces: city, state, zip
  let offset = -3;
  if (!hasZip) {
    offset += 1;
  }
  if (!hasMa) {
    offset += 1;
  }

  return `${parts.slice(0, offset).join(', ')}\n${parts.slice(offset).join(', ')}`;
}

export default class ArcGIS {
  agent: any;
  endpoint: string
  opbeat: any

  constructor(endpoint: ?string, opbeat: any) {
    if (!endpoint) {
      throw new Error('Missing ArcGIS endpoint');
    }

    this.endpoint = endpoint;
    this.opbeat = opbeat;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  url(path: string): string {
    return url.resolve(this.endpoint, path);
  }

  async reverseGeocode(lat: number, lng: number): Promise<?string> {
    const transaction = this.opbeat && this.opbeat.startTransaction('reverseGeocode', 'ArcGIS');

    const location = {
      x: lng,
      y: lat,
      spatialReference: {
        wkid: '4326',
      },
    };

    const params = new URLSearchParams();
    params.append('location', JSON.stringify(location));
    params.append('outFields', '*');
    params.append('returnIntersection', 'false');
    params.append('f', 'json');

    const response = await fetch(this.url(`reverseGeocode?${params.toString()}`), {
      agent: this.agent,
    });

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS geocoder');
    }

    const geocode: ReverseGeocodeResponse = await response.json();

    if (transaction) {
      transaction.end();
    }

    if (geocode.error) {
      return null;
    } else {
      return formatAddress(geocode.address.Match_addr);
    }
  }


  async search(query: string): Promise<?SearchResult> {
    const transaction = this.opbeat && this.opbeat.startTransaction('findAddressCandidates', 'ArcGIS');

    const params = new URLSearchParams();
    params.append('SingleLine', query);
    params.append('outFields', '*');
    params.append('f', 'json');
    // Makes the output in lat/lng
    params.append('outSR', '4326');

    const response = await fetch(this.url(`findAddressCandidates?${params.toString()}`), {
      agent: this.agent,
    });

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS find address');
    }

    const findAddressResponse: FindAddressResponse = await response.json();

    if (transaction) {
      transaction.end();
    }

    const candidates = findAddressResponse.candidates.filter((c) => c.attributes.Loc_name !== 'Points_SubAddr');
    candidates.sort((a, b) => b.score - a.score);

    const candidate = candidates[0];
    if (!candidate) {
      return null;
    } else {
      const { x: lng, y: lat } = candidate.location;
      return {
        location: { lat, lng },
        address: formatAddress(candidate.address),
        addressId: (candidate.attributes.Ref_ID ? candidate.attributes.Ref_ID.toString() : null),
      };
    }
  }
}
