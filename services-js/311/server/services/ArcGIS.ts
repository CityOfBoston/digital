import _ from 'lodash';
import URLSearchParams from 'url-search-params';
import url from 'url';
import HttpsProxyAgent from 'https-proxy-agent';
import fetch from 'node-fetch';

// Later is higher-priority so that index -1 is worst
const ADDR_TYPE_PRIORITY = ['StreetName', 'StreetAddress', 'PointAddress'];
const OPEN_SPACES_LAYER_ID = '13';

type ArcGISErrorResult = {
  error: {
    code: number;
    message: string;
    details: string[];
  };
};

interface SpatialReference {
  wkid: number;
  latestWkid: number;
}

type ReverseGeocodeResult =
  | {
      address: {
        SingleKey: string;
        Match_addr: string;
      };

      location: {
        x: number;
        y: number;
        spatialReference: SpatialReference;
      };
    }
  | ArcGISErrorResult;

export interface FindAddressCandidate {
  address: string;
  location: {
    x: number;
    y: number;
  };

  score: number;
  attributes: {
    Loc_name: string;
    Match_addr: string;
    Ref_ID: number;

    User_fld: string;
    Addr_type: string;
    SubAddrUnit: string;

    State: string;
  };

  extent?: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

interface FindAddressResponse {
  spatialReference: SpatialReference;
  candidates: FindAddressCandidate[];
}

export interface LiveSamFeature {
  attributes: {
    SAM_ADDRESS_ID: number;
    RELATIONSHIP_TYPE: number;
    BUILDING_ID: number;
    FULL_ADDRESS: string;
    STREET_NUMBER: string;
    FULL_STREET_NAME: string;
    MAILING_NEIGHBORHOOD: string;
    ZIP_CODE: string;
    UNIT: string;
    STREET_NUMBER_SORT: number;
  };

  geometry: {
    x: number;
    y: number;
  };
}

export interface LayerFeature {
  attributes: {
    OBJECTID: number;

    SITE_NAME: string;
    OWNERSHIP: string;
    PROTECTION: string;
    TYPECODE: number;
    DISTRICT: string;
    ACRES: number;
    ADDRESS: string;
    ZonAgg: string;
    TypeLong: string;
    OS_Own_Jur: string;
    OS_Mngmnt: string;
    POS: string;
    PA: string;
    ALT_NAME: string;
    AgncyJuris: string;
    Shape_STArea__: number;
    Shape_STLength__: number;
    PARK_ID: undefined;
    'Shape.STLength()': number;
    REGION: string;
  };
}

type LiveSamResponse =
  | {
      features: LiveSamFeature[];
    }
  | ArcGISErrorResult;

type LayerQueryResult =
  | {
      features: LayerFeature[];
    }
  | ArcGISErrorResult;

export interface SearchResult {
  location: {
    lat: number;
    lng: number;
  };

  address: string;
  addressId: string | null;
  buildingId: string | null;
  exact: boolean;
  alwaysUseLatLng: boolean;
}

export interface UnitResult {
  location: {
    lat: number;
    lng: number;
  };

  address: string;
  addressId: string;
  streetAddress: string;
  unit: string;
  buildingId: string;
}

export function formatAddress(address: string): string {
  if (!address) {
    return address;
  }

  // Intersections don't have a zip code
  const hasZip =
    address.match(/\d\d\d\d\d$/) || address.match(/\d\d\d\d\d-\d\d\d\d$/);
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

// Returns true if this matches a known address in the database, rather than
// being estimated based on the street and street number. Used to filter out
// "StreetAddress" interpolated results if we have an exact match.
function isExactAddress(candidate: FindAddressCandidate): boolean {
  return candidate.attributes.Addr_type === 'PointAddress';
}

// These locator types can't be found in Salesforce's forward address, so we
// send lat/lng for these types. (This is safe, since there won't be e.g.
// separate units sharing the same point that we'd need to differentiate.)
function isAddressUnsearchable(candidate: FindAddressCandidate): boolean {
  return (
    candidate.attributes.Loc_name === 'Intersection' ||
    candidate.attributes.Loc_name === 'Seg_Alternate' ||
    candidate.attributes.Loc_name === 'Landmark_Alter'
  );
}

function isExactIntersection(candidate: FindAddressCandidate): boolean {
  return candidate.attributes.Loc_name === 'Intersection';
}

export function sortAddressCandidates(
  candidates: FindAddressCandidate[]
): FindAddressCandidate[] {
  const needsExactAddress = !!candidates.find(isExactAddress);
  const needsExactIntersection = !!candidates.find(isExactIntersection);

  return (
    _(candidates)
      // At this stage we don't want sub-units. We'll look them up later by
      // building ID.
      .filter(c => c.attributes.SubAddrUnit === '')
      // If we have any exact matches in the results, only return exact results.
      // Should clean up the address options to avoid confusing constituents.
      .filter(c => !needsExactAddress || isExactAddress(c))
      .filter(c => !needsExactIntersection || isExactIntersection(c))
      .uniqBy(c => c.attributes.Ref_ID)
      // if two elements have the same building id we only want one. If
      // there's no building id, we want to keep it, so we return a "guaranteed"
      // unique value.
      .uniqBy(c => c.attributes.State || Math.random())
      .sort(
        (a, b) =>
          // Most importantly, sort by score
          b.score - a.score ||
          // Sort by type priority so that actual addresses are ahead of
          // "probably about here on the street" addresses
          ADDR_TYPE_PRIORITY.indexOf(b.attributes.Addr_type) -
            ADDR_TYPE_PRIORITY.indexOf(a.attributes.Addr_type) ||
          // Finally, be in alphabetical order
          a.attributes.Match_addr.localeCompare(b.attributes.Match_addr)
      )

      // Can remove duplicate intersections
      .uniqBy(c => `${c.location.x}:${c.location.y}`)
      .value()
  );
}

export function sortUnits(units: LiveSamFeature[]): LiveSamFeature[] {
  return _(units)
    .sort((a, b) => {
      return (
        a.attributes.RELATIONSHIP_TYPE - b.attributes.RELATIONSHIP_TYPE ||
        a.attributes.FULL_STREET_NAME.localeCompare(
          b.attributes.FULL_STREET_NAME
        ) ||
        a.attributes.STREET_NUMBER_SORT - b.attributes.STREET_NUMBER_SORT ||
        a.attributes.UNIT.localeCompare(b.attributes.UNIT, 'en', {
          numeric: true,
        })
      );
    })
    .value();
}

export function samFeatureToUnit({
  attributes,
  geometry,
}: LiveSamFeature): UnitResult {
  return {
    location: { lat: geometry.y, lng: geometry.x },
    address: `${attributes.FULL_ADDRESS}\n${attributes.MAILING_NEIGHBORHOOD}, ${
      attributes.ZIP_CODE
    }`,
    addressId: attributes.SAM_ADDRESS_ID.toString(),
    streetAddress: attributes.FULL_ADDRESS,
    unit: attributes.UNIT,
    buildingId: attributes.BUILDING_ID.toString(),
  };
}

export default class ArcGIS {
  private readonly agent: any;
  private readonly endpoint: string;

  constructor(endpoint: string | undefined) {
    if (!endpoint) {
      throw new Error('Missing ArcGIS endpoint');
    }

    this.endpoint = endpoint;

    if (process.env.http_proxy) {
      this.agent = new HttpsProxyAgent(process.env.http_proxy);
    }
  }

  private addressSearchLocatorUrl(path: string): string {
    return url.resolve(
      this.endpoint,
      `Locators/Boston_Composite_Prod/GeocodeServer/${path}`
    );
  }

  // Locator that returns SAM addresses and intersections
  private reverseGeocodeLocatorUrl(path: string): string {
    return url.resolve(
      this.endpoint,
      `Locators/intersection_and_address/GeocodeServer/${path}`
    );
  }

  private liveAddressUrl(path: string): string {
    return url.resolve(
      this.endpoint,
      `311/LiveSAMAddresses/MapServer/0/${path}`
    );
  }

  private openSpacesUrl(path: string): string {
    return url.resolve(
      this.endpoint,
      `311/Composite_Services/MapServer/${OPEN_SPACES_LAYER_ID}/${path}`
    );
  }

  private async reverseGeocodeOpenSpace(
    lat: number,
    lng: number
  ): Promise<SearchResult | null> {
    const params = new URLSearchParams();
    params.append('geometry', `${lng},${lat}`);
    params.append('geometryType', 'esriGeometryPoint');
    params.append('inSR', '4326');
    params.append('spatialRelationship', 'esriSpatialRelWithin');
    params.append('returnGeometry', 'false');
    params.append('outFields', '*');
    params.append('f', 'json');

    const response = await fetch(
      this.openSpacesUrl(`query?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS geocoder');
    }

    const result: LayerQueryResult = await response.json();

    if (isArcGISErrorResult(result)) {
      const { error } = result;

      if (error.code === 400) {
        return null;
      } else {
        throw new Error(
          error.details[0] || error.message || 'Unknown ArcGIS error'
        );
      }
    }

    if (!result.features.length) {
      return null;
    } else {
      const { SITE_NAME } = result.features[0].attributes;

      return {
        location: { lat, lng },
        address: SITE_NAME,
        addressId: null,
        buildingId: null,
        exact: true,
        alwaysUseLatLng: true,
      };
    }
  }

  public async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<SearchResult | null> {
    // We do the reverse geocoding in parallel.
    const reverseGeocodeOpenSpacePromise = this.reverseGeocodeOpenSpace(
      lat,
      lng
    );

    const location = {
      x: lng,
      y: lat,
      // Makes the output in lat/lng
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
    const responsePromise = fetch(
      this.reverseGeocodeLocatorUrl(`reverseGeocode?${params.toString()}`),
      {
        agent: this.agent,
      }
    );

    // open spaces take precedence, so we await this first and actually
    // short-circuit out if it returns, not waiting for the responsePromise to
    // complete.
    const openSpaceResult = await reverseGeocodeOpenSpacePromise;
    if (openSpaceResult && openSpaceResult.address) {
      // keeps us from having an uncaught promise exception
      return openSpaceResult;
    }

    const response = await responsePromise;

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS geocoder');
    }

    const result: ReverseGeocodeResult = await response.json();

    if (isArcGISErrorResult(result)) {
      const { error } = result;
      if (error.code === 400) {
        return null;
      } else {
        throw new Error(
          error.details[0] || error.message || 'Unknown ArcGIS error'
        );
      }
    }

    // We take the address from the locator and send it over to
    // search so we can get the building ID and SAM id, which are
    // not sent in the reverse geocode response.
    const places = await this.search(result.address.Match_addr);

    return (
      // Just in case, we still want to return something
      places[0] || {
        location: { lat, lng },
        address: formatAddress(result.address.Match_addr),
        addressId: null,
        buildingId: null,
        exact: false,
        alwaysUseLatLng: true,
      }
    );
  }

  public async search(query: string): Promise<SearchResult[]> {
    const params = new URLSearchParams();
    params.append('SingleLine', query);
    params.append('outFields', '*');
    params.append('f', 'json');
    // Makes the output in lat/lng
    params.append('outSR', '4326');

    const response = await fetch(
      this.addressSearchLocatorUrl(
        `findAddressCandidates?${params.toString()}`
      ),

      {
        agent: this.agent,
      }
    );

    if (!response.ok) {
      throw new Error('Got not-ok response from ArcGIS find address');
    }

    const findAddressResponse: FindAddressResponse = await response.json();

    return _.compact(
      await Promise.all(
        sortAddressCandidates(findAddressResponse.candidates).map(
          candidateToSearchResult.bind(null, this)
        )
      )
    );
  }

  public async lookupUnits(buildingId: string): Promise<UnitResult[]> {
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

    if (isArcGISErrorResult(liveSamResponse)) {
      throw new Error(
        liveSamResponse.error.message +
          '\n' +
          liveSamResponse.error.details.join('\n')
      );
    }

    return sortUnits(liveSamResponse.features || []).map(samFeatureToUnit);
  }
}

function isArcGISErrorResult(x: any): x is ArcGISErrorResult {
  return !!(x as ArcGISErrorResult).error;
}

export async function candidateToSearchResult(
  arcgis: ArcGIS,
  candidate: FindAddressCandidate
): Promise<SearchResult | null> {
  const { x: lng, y: lat } = candidate.location;

  // The goal here is to never return an interpolated, StreetAddress result,
  // since it has no SAM ID. So, if we found one in the search results, we
  // reverse-geocode its estimated location to get an address. We then set the
  // "exact" bit to false since the address can be named something somewhat
  // different from the search term and we want to communicate that something
  // approximate is going on.
  if (candidate.attributes.Addr_type === 'StreetAddress') {
    // Recur. Safe because reverseGeocode won't find 'StreetAddress'
    // candidates.
    const geocoded = await arcgis.reverseGeocode(
      candidate.location.y,
      candidate.location.x
    );

    if (geocoded) {
      geocoded.exact = false;
    }

    return geocoded;
  } else {
    return {
      location: { lat, lng },
      address: formatAddress(
        candidate.attributes.Addr_type === 'StreetAddress'
          ? candidate.address
          : candidate.attributes.User_fld || candidate.address
      ),

      addressId: candidate.attributes.Ref_ID
        ? candidate.attributes.Ref_ID.toString()
        : null,
      buildingId: candidate.attributes.State || null,
      exact: true,
      alwaysUseLatLng: isAddressUnsearchable(candidate),
    };
  }
}
