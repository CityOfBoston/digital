import { SearchAddressPlace } from '../types';
import AddressSearch from './AddressSearch';

jest.mock('../queries/search-address');
jest.mock('../queries/reverse-geocode');

const searchAddress = require('../queries/search-address').default;
const reverseGeocode = require('../queries/reverse-geocode').default;

const PLACE: SearchAddressPlace = {
  address: '1 City Hall Plaza',
  addressId: '12345',
  units: [],
  exact: true,
  alwaysUseLatLng: false,
  location: {
    lat: 42.36035940296916,
    lng: -71.05802536010744,
  },
};

const INTERSECTION_PLACE: SearchAddressPlace = {
  address: 'Milk St and Washington St',
  addressId: null,
  units: [],
  exact: true,
  alwaysUseLatLng: true,
  location: {
    lat: 42.36035940296916,
    lng: -71.05802536010744,
  },
};

const PLACE_2: SearchAddressPlace = {
  address: '2 City Hall Plaza',
  addressId: '12346',
  units: [],
  exact: true,
  alwaysUseLatLng: false,
  location: {
    lat: 42.37,
    lng: -71.06,
  },
};

describe('searching', () => {
  let addressSearch;
  let loopbackGraphql;
  let resolveGraphql: (places: Array<SearchAddressPlace>) => void;

  beforeEach(() => {
    searchAddress.mockReturnValue(
      new Promise(resolve => {
        resolveGraphql = resolve;
      })
    );

    loopbackGraphql = jest.fn();

    addressSearch = new AddressSearch();
    addressSearch.start(loopbackGraphql);
  });

  afterEach(() => {
    addressSearch.stop();
  });

  // disabled as per Reilly 9/23 jm
  xit('updates address and location on success', async () => {
    addressSearch.query = '1 City Hall Plaza';
    addressSearch.search(false);

    expect(searchAddress).toHaveBeenCalledWith(
      loopbackGraphql,
      '1 City Hall Plaza'
    );

    await resolveGraphql([PLACE]);

    expect(addressSearch.address).toEqual('1 City Hall Plaza');
    expect(addressSearch.location).toEqual({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });
    expect(addressSearch.addressId).toEqual('12345');
    expect(addressSearch.intent).toEqual('ADDRESS');
  });

  // disabled as per Reilly 9/23 jm
  xit('searches for an intersection and uses LATLNG intent', async () => {
    addressSearch.query = 'Milk and Washington';
    addressSearch.search(false);

    expect(searchAddress).toHaveBeenCalledWith(
      loopbackGraphql,
      'Milk and Washington'
    );

    await resolveGraphql([INTERSECTION_PLACE]);

    expect(addressSearch.address).toEqual('Milk St and Washington St');
    expect(addressSearch.intent).toEqual('LATLNG');
  });

  it('clears things when search returns nothing', async () => {
    addressSearch.setPlaces([PLACE], 'search', true);

    addressSearch.query = '8888 milk st';
    addressSearch.search(false);

    expect(searchAddress).toHaveBeenCalledWith(loopbackGraphql, '8888 milk st');

    await resolveGraphql([]);

    expect(addressSearch.address).toEqual('');
    expect(addressSearch.location).toEqual(null);
    expect(addressSearch.addressId).toEqual(null);
  });

  it('has no selection when search returns multiple things', async () => {
    addressSearch.query = '1 City Hall Plaza';
    addressSearch.search(false);

    expect(searchAddress).toHaveBeenCalledWith(
      loopbackGraphql,
      '1 City Hall Plaza'
    );

    await resolveGraphql([PLACE, PLACE_2]);

    expect(addressSearch.address).toEqual('');
    expect(addressSearch.location).toEqual(null);
    expect(addressSearch.addressId).toEqual(null);
  });
});

describe('reverse geocoding', () => {
  let addressSearch;
  let loopbackGraphql;
  let resolveGraphql: (place: SearchAddressPlace | null) => void;

  beforeEach(() => {
    reverseGeocode.mockReturnValue(
      new Promise<SearchAddressPlace | null>(resolve => {
        resolveGraphql = resolve;
      })
    );

    loopbackGraphql = jest.fn();

    addressSearch = new AddressSearch();
    addressSearch.start(loopbackGraphql);
  });

  afterEach(() => {
    addressSearch.stop();
  });

  it('reverse geocodes', async () => {
    addressSearch.location = {
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    };

    // before reverse geocode happens, location is updated immediately
    expect(addressSearch.location).toEqual({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });
    expect(addressSearch.address).toEqual('');

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
      exact: true,
      alwaysUseLatLng: false,
      units: [],
    });

    // after reverse geocode
    expect(addressSearch.location).toEqual({
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    });
    expect(addressSearch.address).toEqual('1 City Hall Plaza');
  });

  it('clears any existing query', () => {
    addressSearch.query = '8888 milk st';
    addressSearch.lastQuery = '8888 milk st';

    addressSearch.location = {
      lat: 42.36035940296916,
      lng: -71.05802536010744,
    };

    expect(addressSearch.query).toEqual('');
    expect(addressSearch.lastQuery).toEqual('');
  });
});
