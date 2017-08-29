// @flow

import 'isomorphic-fetch';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';

// Later is higher-priority so that index -1 is worst
const ADDR_TYPE_PRIORITY = ['StreetName', 'StreetAddress', 'PointAddress'];

type SpatialReference = {
  wkid: number,
  latestWkid: number,
};

type ReverseGeocodeResponse =
  | {
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
      },
    }
  | {
      error: {
        code: number,
        message: string,
        details: string[],
      },
    };

type FindAddressCandidate = {
  address: string,
  location: {
    x: number,
    y: number,
  },
  score: number,
  attributes: {
    Loc_name: string,
    Match_addr: string,
    Ref_ID: number,
    User_fld: string,
    Addr_type: string,
  },
  extent: {
    xmin: number,
    ymin: number,
    xmax: number,
    ymax: number,
  },
};

type FindAddressResponse = {
  spatialReference: SpatialReference,
  candidates: FindAddressCandidate[],
};

export type LiveSamFeature = {
  attributes: {
    SAM_ADDRESS_ID: number,
    BUILDING_ID: number,
    FULL_ADDRESS: string,
    STREET_NUMBER: string,
    FULL_STREET_NAME: string,
    MAILING_NEIGHBORHOOD: string,
    ZIP_CODE: string,
    UNIT: string,
    STREET_NUMBER_SORT: number,
  },
  geometry: {
    x: number,
    y: number,
  },
};

type LiveSamResponse =
  | {|
      features: LiveSamFeature[],
    |}
  | {|
      error: {|
        code: number,
        message: string,
        details: Array<string>,
      |},
    |};

export type SearchResult = {
  location: {
    lat: number,
    lng: number,
  },
  address: string,
  addressId: ?string,
  buildingId: ?string,
  exact: boolean,
};

export type UnitResult = {
  location: {
    lat: number,
    lng: number,
  },
  address: string,
  addressId: string,
  streetAddress: string,
  unit: string,
};

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

  return `${parts.slice(0, offset).join(', ')}\n${parts
    .slice(offset)
    .join(', ')}`;
}

export function sortUnits(units: Array<LiveSamFeature>): Array<LiveSamFeature> {
  const sortedUnits = [...units];
  sortedUnits.sort((a, b) => {
    return (
      a.attributes.FULL_STREET_NAME.localeCompare(
        b.attributes.FULL_STREET_NAME
      ) ||
      a.attributes.STREET_NUMBER_SORT - b.attributes.STREET_NUMBER_SORT ||
      a.attributes.UNIT.localeCompare(b.attributes.UNIT, 'en', {
        numeric: true,
      })
    );
  });
  return sortedUnits;
}

export default class ArcGIS {
  agent: any;
  endpoint: string;
  opbeat: any;

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

  locatorUrl(path: string): string {
    return url.resolve(
      this.endpoint,
      `Locators/BostonComposite/GeocodeServer/${path}`
    );
  }

  samAddressOnlyLocatorUrl(path: string): string {
    return url.resolve(
      this.endpoint,
      `Locators/SAM_Address_FH/GeocodeServer/${path}`
    );
  }

  liveAddressUrl(path: string): string {
    return url.resolve(
      this.endpoint,
      `311/LiveSAMAddresses/MapServer/0/${path}`
    );
  }

  async reverseGeocode(lat: number, lng: number): Promise<?SearchResult> {
    const transaction =
      this.opbeat && this.opbeat.startTransaction('reverseGeocode', 'ArcGIS');

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

    // This done though a particular locator that we have high confidence will
    // return addresses that we can look up through search.
    const response = await fetch(
      this.samAddressOnlyLocatorUrl(`reverseGeocode?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

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
      // We take the address from the locator and send it over to
      // search so we can get the building ID and SAM id, which are
      // not sent in the reverse geocode response.
      const places = await this.search(geocode.address.Match_addr);
      if (places.length) {
        return places[0];
      } else {
        // Just in case we still want to return something
        return {
          location: { lat, lng },
          address: formatAddress(geocode.address.Match_addr),
          addressId: null,
          buildingId: null,
          exact: false,
        };
      }
    }
  }

  async search(query: string): Promise<Array<SearchResult>> {
    const transaction =
      this.opbeat &&
      this.opbeat.startTransaction('findAddressCandidates', 'ArcGIS');

    const params = new URLSearchParams();
    params.append('SingleLine', query);
    params.append('outFields', '*');
    params.append('f', 'json');
    // Makes the output in lat/lng
    params.append('outSR', '4326');

    const response = await fetch(
      this.locatorUrl(`findAddressCandidates?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS find address');
    }

    const findAddressResponse: FindAddressResponse = await response.json();

    if (transaction) {
      transaction.end();
    }

    const candidates = findAddressResponse.candidates.filter(
      c => c.attributes.Loc_name !== 'SAMAddressSubU'
    );

    candidates.sort(
      (a, b) =>
        b.score - a.score ||
        ADDR_TYPE_PRIORITY.indexOf(b.attributes.Addr_type) -
          ADDR_TYPE_PRIORITY.indexOf(a.attributes.Addr_type) ||
        a.attributes.Match_addr.localeCompare(b.attributes.Match_addr)
    );

    return candidates.map(candidate => {
      const { x: lng, y: lat } = candidate.location;
      return {
        location: { lat, lng },
        address: formatAddress(candidate.address),
        addressId: candidate.attributes.Ref_ID
          ? candidate.attributes.Ref_ID.toString()
          : null,
        buildingId: candidate.attributes.User_fld || null,
        exact: candidate.attributes.Addr_type === 'PointAddress',
      };
    });
  }

  async lookupUnits(buildingId: string): Promise<Array<UnitResult>> {
    const transaction =
      this.opbeat && this.opbeat.startTransaction('LiveSAMAddresses', 'ArcGIS');

    const params = new URLSearchParams();
    params.append('where', `BUILDING_ID=${parseInt(buildingId, 10)}`);
    params.append('outFields', '*');
    params.append('f', 'json');
    // Makes the output in lat/lng
    params.append('outSR', '4326');

    const response = await fetch(
      this.liveAddressUrl(`query?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS live address table');
    }

    const liveSamResponse: LiveSamResponse = await response.json();

    if (transaction) {
      transaction.end();
    }

    if (liveSamResponse.error) {
      throw new Error(
        liveSamResponse.error.message +
          '\n' +
          liveSamResponse.error.details.join('\n')
      );
    }

    return sortUnits(
      liveSamResponse.features || []
    ).map(({ attributes, geometry }) => ({
      location: { lat: geometry.y, lng: geometry.x },
      address: `${attributes.FULL_ADDRESS}\n${attributes.MAILING_NEIGHBORHOOD}, MA, ${attributes.ZIP_CODE}`,
      addressId: attributes.SAM_ADDRESS_ID.toString(),
      streetAddress: attributes.FULL_ADDRESS,
      unit: attributes.UNIT,
      buildingId: attributes.BUILDING_ID.toString(),
    }));
  }
}
