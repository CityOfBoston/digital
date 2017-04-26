// @flow

import type { ReverseGeocodedPlace } from '../types';
import MapLocation from './MapLocation';

jest.mock('../dao/reverse-geocode');
const reverseGeocode: JestMockFn = (require('../dao/reverse-geocode'): any).default;

describe('reverse geocoding', () => {
  let mapLocation;
  let loopbackGraphql;
  let resolveGraphql: (place: ?ReverseGeocodedPlace) => void;

  beforeEach(() => {
    reverseGeocode.mockReturnValue(new Promise((resolve) => {
      resolveGraphql = resolve;
    }));

    loopbackGraphql = jest.fn();

    mapLocation = new MapLocation();
    mapLocation.start(loopbackGraphql);
  });

  afterEach(() => {
    mapLocation.stop();
  });

  it('reverse geocodes when the location changes', async () => {
    mapLocation.location = {
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    };

    // before reverse geocode happens
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
    });

    // after reverse geocode
    expect(mapLocation.location).toEqual({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });
    expect(mapLocation.address).toEqual('1 City Hall Plaza');
  });
});
