// @flow

import 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import proj4 from 'proj4';

// Uses lat/long
const WGS84_LAT_LNG = 'EPSG:4326';
const MASSACHUSETTS_MAINLAND_PROJECTION = 'EPSG:6492';

// taken from: https://github.com/OSGeo/proj.4/blob/master/nad/epsg
proj4.defs(MASSACHUSETTS_MAINLAND_PROJECTION, '+proj=lcc +lat_1=42.68333333333333 +lat_2=41.71666666666667 +lat_0=41 +lon_0=-71.5 +x_0=200000.0001016002 +y_0=750000 +ellps=GRS80 +units=us-ft +no_defs');

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
  attributes: Object,
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
}

function formatAddress(address: string): string {
  if (!address) {
    return address;
  }

  // Assume that the last two commas are for city and state. Not sure if this is
  // a good assumption, but we do see multiple commas in the first line.
  // E.g.: 764 E BROADWAY, 1, SOUTH BOSTON, MA, 02127
  const parts = address.split(/, /);

  // -3 because we want 3 pieces: city, state, zip
  return `${parts.slice(0, -3).join(', ')}\n${parts.slice(-3).join(', ')}`;
}

export default class ArcGIS {
  agent: any;
  endpoint: string
  opbeat: any
  project: ([number, number]) => [number, number];

  constructor(endpoint: ?string, opbeat: any) {
    if (!endpoint) {
      throw new Error('Missing ArcGIS endpoint');
    }

    this.endpoint = endpoint;
    this.opbeat = opbeat;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }

    this.project = proj4(WGS84_LAT_LNG, MASSACHUSETTS_MAINLAND_PROJECTION);
  }

  url(path: string): string {
    return url.resolve(this.endpoint, path);
  }

  async reverseGeocode(lat: number, lng: number): Promise<?string> {
    const [x, y] = this.project.forward([lng, lat]);

    const params = new URLSearchParams();
    params.append('location', `${x.toString()}, ${y.toString()}`);
    params.append('returnIntersection', 'false');
    params.append('f', 'json');

    const response = await fetch(this.url(`reverseGeocode?${params.toString()}`), {
      agent: this.agent,
    });

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS geocoder');
    }

    const geocode: ReverseGeocodeResponse = await response.json();

    if (geocode.error) {
      return null;
    } else {
      return formatAddress(geocode.address.Match_addr);
    }
  }


  async search(query: string): Promise<?SearchResult> {
    const params = new URLSearchParams();
    params.append('SingleLine', query);
    params.append('f', 'json');

    const response = await fetch(this.url(`findAddressCandidates?${params.toString()}`), {
      agent: this.agent,
    });

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS find address');
    }

    const findAddressResponse: FindAddressResponse = await response.json();

    const candidate = findAddressResponse.candidates[0];
    if (!candidate) {
      return null;
    } else {
      const [lng, lat] = this.project.inverse([candidate.location.x, candidate.location.y]);
      return {
        location: { lat, lng },
        address: formatAddress(candidate.address),
      };
    }
  }
}
