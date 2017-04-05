// @flow

import ReverseGeocodeGraphql from './graphql/ReverseGeocode.graphql';

import reverseGeocode from './reverse-geocode';

test('reverseGeocode', async () => {
  const loopbackGraphql = jest.fn().mockReturnValue({ geocoder: {} });
  await reverseGeocode(loopbackGraphql, { lat: 45, lng: 50 });
  expect(loopbackGraphql).toHaveBeenCalledWith(ReverseGeocodeGraphql, { location: { lat: 45, lng: 50 } });
});
