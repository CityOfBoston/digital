// @flow

import type { SearchAddressPlace } from '../types';
import MapLocation from './MapLocation';

jest.mock('../dao/search-address');
jest.mock('../dao/reverse-geocode');
const searchAddress: JestMockFn = (require('../dao/search-address'): any)
  .default;
const reverseGeocode: JestMockFn = (require('../dao/reverse-geocode'): any)
  .default;

describe('searching', () => {
  let mapLocation;
  let loopbackGraphql;
  let resolveGraphql: (place: ?SearchAddressPlace) => void;

  beforeEach(() => {
    searchAddress.mockReturnValue(
      new Promise(resolve => {
        resolveGraphql = resolve;
      }),
    );

    loopbackGraphql = jest.fn();

    mapLocation = new MapLocation();
    mapLocation.start(loopbackGraphql);
  });

  afterEach(() => {
    mapLocation.stop();
  });

  it('clears location but preserves address during search', () => {
    mapLocation.address = '121 Devonshire Street, Boston, MA, 02108';
    mapLocation.location = {
      lat: 42.35700999905103,
      lng: -71.05761000345488,
    };
    mapLocation.addressId = '12345';

    mapLocation.search('8888 milk st');

    // We keep the address so that the search box doesn't jump around, but we
    // clear out the location so that the pin disappears
    expect(mapLocation.address).toEqual(
      '121 Devonshire Street, Boston, MA, 02108',
    );
    expect(mapLocation.location).toEqual(null);
    expect(mapLocation.addressId).toEqual(null);
  });

  it('updates address and location on success', async () => {
    mapLocation.search('121 devonshire');

    expect(searchAddress).toHaveBeenCalledWith(
      loopbackGraphql,
      '121 devonshire',
    );

    await resolveGraphql({
      address: '121 Devonshire Street, Boston, MA, 02108',
      location: {
        lat: 42.35700999905103,
        lng: -71.05761000345488,
      },
      addressId: '12345',
      units: [],
    });

    expect(mapLocation.address).toEqual(
      '121 Devonshire Street, Boston, MA, 02108',
    );
    expect(mapLocation.location).toEqual({
      lat: 42.35700999905103,
      lng: -71.05761000345488,
    });
    expect(mapLocation.addressId).toEqual('12345');
  });

  it('clears things when search returns nothing', async () => {
    mapLocation.address = '121 Devonshire Street, Boston, MA, 02108';
    mapLocation.location = {
      lat: 42.35700999905103,
      lng: -71.05761000345488,
    };

    mapLocation.search('8888 milk st');

    expect(searchAddress).toHaveBeenCalledWith(loopbackGraphql, '8888 milk st');

    await resolveGraphql(null);

    expect(mapLocation.address).toEqual('');
    expect(mapLocation.location).toEqual(null);
    expect(mapLocation.addressId).toEqual(null);
  });
});

describe('reverse geocoding', () => {
  let mapLocation;
  let loopbackGraphql;
  let resolveGraphql: (place: ?SearchAddressPlace) => void;

  beforeEach(() => {
    reverseGeocode.mockReturnValue(
      new Promise(resolve => {
        resolveGraphql = resolve;
      }),
    );

    loopbackGraphql = jest.fn();

    mapLocation = new MapLocation();
    mapLocation.start(loopbackGraphql);
  });

  afterEach(() => {
    mapLocation.stop();
  });

  it('reverse geocodes', async () => {
    mapLocation.geocodeLocation({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });

    // before reverse geocode happens, location is updated immediately
    expect(mapLocation.location).toEqual({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });
    expect(mapLocation.address).toEqual('');

    expect(reverseGeocode).toHaveBeenCalledWith(loopbackGraphql, {
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });

    await resolveGraphql({
      address: '1 City Hall Plaza',
      location: {
        lat: 42.36035940296916,
        lng: -71.05802536010744,
      },
      addressId: '12345',
      units: [],
    });

    // after reverse geocode
    expect(mapLocation.location).toEqual({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });
    expect(mapLocation.address).toEqual('1 City Hall Plaza');
  });
});
