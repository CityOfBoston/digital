// @flow
import fetchMock from 'fetch-mock';
import Geocoder from './Geocoder';

afterEach(fetchMock.restore);

describe('address', () => {
  it('returns a street address for a building', async () => {
    fetchMock.get('*', {
      body: {
        results: [
          {
            address_components: [
              {
                long_name: '201',
                short_name: '201',
                types: ['street_number'],
              },
              {
                long_name: 'Newbury Street',
                short_name: 'Newbury St',
                types: ['route'],
              },
              {
                long_name: 'Back Bay East',
                short_name: 'Back Bay East',
                types: ['neighborhood', 'political'],
              },
              {
                long_name: 'Boston',
                short_name: 'Boston',
                types: ['locality', 'political'],
              },
              {
                long_name: 'Suffolk County',
                short_name: 'Suffolk County',
                types: ['administrative_area_level_2', 'political'],
              },
              {
                long_name: 'Massachusetts',
                short_name: 'MA',
                types: ['administrative_area_level_1', 'political'],
              },
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political'],
              },
              {
                long_name: '02116',
                short_name: '02116',
                types: ['postal_code'],
              },
            ],
            formatted_address: '201 Newbury St, Boston, MA 02116, USA',
            geometry: {
              bounds: {
                northeast: {
                  lat: 42.3505872,
                  lng: -71.0801153,
                },
                southwest: {
                  lat: 42.3502456,
                  lng: -71.08079309999999,
                },
              },
              location: {
                lat: 42.3504164,
                lng: -71.08045419999999,
              },
              location_type: 'ROOFTOP',
              viewport: {
                northeast: {
                  lat: 42.3517653802915,
                  lng: -71.0791052197085,
                },
                southwest: {
                  lat: 42.3490674197085,
                  lng: -71.0818031802915,
                },
              },
            },
            place_id: 'ChIJcX9mvA5644kRdTy14XChUYw',
            types: ['premise'],
          },
        ],
        status: 'OK',
      },
    });

    const geocoder = new Geocoder('fake-api-key');
    const { address } = await geocoder.address({ lat: 42.35012381884158, lng: -71.08027696609497 }) || {};

    expect(address).toEqual('201 Newbury St\nBoston, MA 02116');
  });

  it('returns something for the swan boats', async () => {
    fetchMock.get('*', {
      body: {
        results: [
          {
            address_components: [
              {
                long_name: 'Lagoon Bridge',
                short_name: 'Lagoon Bridge',
                types: ['establishment', 'point_of_interest', 'premise'],
              },
              {
                long_name: 'Boston',
                short_name: 'Boston',
                types: ['locality', 'political'],
              },
              {
                long_name: 'Suffolk County',
                short_name: 'Suffolk County',
                types: ['administrative_area_level_2', 'political'],
              },
              {
                long_name: 'Massachusetts',
                short_name: 'MA',
                types: ['administrative_area_level_1', 'political'],
              },
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political'],
              },
              {
                long_name: '02116',
                short_name: '02116',
                types: ['postal_code'],
              },
            ],
            formatted_address: 'Lagoon Bridge, Boston, MA 02116, USA',
            geometry: {
              bounds: {
                northeast: {
                  lat: 42.3542031,
                  lng: -71.0696986,
                },
                southwest: {
                  lat: 42.3540464,
                  lng: -71.0701442,
                },
              },
              location: {
                lat: 42.3541249,
                lng: -71.0699242,
              },
              location_type: 'ROOFTOP',
              viewport: {
                northeast: {
                  lat: 42.35547373029151,
                  lng: -71.06857241970849,
                },
                southwest: {
                  lat: 42.35277576970851,
                  lng: -71.07127038029149,
                },
              },
            },
            place_id: 'ChIJeTFChnV644kRn6f0GaORLug',
            types: ['establishment', 'point_of_interest', 'premise'],
          },
          {
            address_components: [
              {
                long_name: 'Charles Street',
                short_name: 'MA-28',
                types: ['route'],
              },
              {
                long_name: 'Boston',
                short_name: 'Boston',
                types: ['locality', 'political'],
              },
              {
                long_name: 'Suffolk County',
                short_name: 'Suffolk County',
                types: ['administrative_area_level_2', 'political'],
              },
              {
                long_name: 'Massachusetts',
                short_name: 'MA',
                types: ['administrative_area_level_1', 'political'],
              },
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political'],
              },
              {
                long_name: '02108',
                short_name: '02108',
                types: ['postal_code'],
              },
            ],
            formatted_address: 'Charles St, Boston, MA 02108, USA',
            geometry: {
              bounds: {
                northeast: {
                  lat: 42.3551769,
                  lng: -71.068501,
                },
                southwest: {
                  lat: 42.354493,
                  lng: -71.0688789,
                },
              },
              location: {
                lat: 42.35483490000001,
                lng: -71.0686901,
              },
              location_type: 'GEOMETRIC_CENTER',
              viewport: {
                northeast: {
                  lat: 42.35618393029149,
                  lng: -71.06734096970848,
                },
                southwest: {
                  lat: 42.35348596970849,
                  lng: -71.0700389302915,
                },
              },
            },
            place_id: 'ChIJI_bWEJ5w44kRyVX_AfojoLU',
            types: ['route'],
          },
        ],
        status: 'OK',
      },
    });

    const geocoder = new Geocoder('fake-api-key');
    const { address } = await geocoder.address({ lat: 42.35415165273146, lng: -71.06993436813354 }) || {};

    expect(address).toEqual('Lagoon Bridge\nBoston, MA 02116');
  });

  it('returns null outside of Boston', async () => {
    fetchMock.get('*', {
      body: {
        results: [
          {
            address_components: [
              {
                long_name: '600',
                short_name: '600',
                types: ['street_number'],
              },
              {
                long_name: 'Cardinal Medeiros Avenue',
                short_name: 'Cardinal Medeiros Ave',
                types: ['route'],
              },
              {
                long_name: 'Wellington-Harrington',
                short_name: 'Wellington-Harrington',
                types: ['neighborhood', 'political'],
              },
              {
                long_name: 'Cambridge',
                short_name: 'Cambridge',
                types: ['locality', 'political'],
              },
              {
                long_name: 'Middlesex County',
                short_name: 'Middlesex County',
                types: ['administrative_area_level_2', 'political'],
              },
              {
                long_name: 'Massachusetts',
                short_name: 'MA',
                types: ['administrative_area_level_1', 'political'],
              },
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political'],
              },
              {
                long_name: '02139',
                short_name: '02139',
                types: ['postal_code'],
              },
            ],
            formatted_address: '600 Cardinal Medeiros Ave, Cambridge, MA 02139, USA',
            geometry: {
              bounds: {
                northeast: {
                  lat: 42.3674059,
                  lng: -71.08994389999999,
                },
                southwest: {
                  lat: 42.3663344,
                  lng: -71.0914847,
                },
              },
              location: {
                lat: 42.3668701,
                lng: -71.0907143,
              },
              location_type: 'ROOFTOP',
              viewport: {
                northeast: {
                  lat: 42.36821913029149,
                  lng: -71.08936531970849,
                },
                southwest: {
                  lat: 42.3655211697085,
                  lng: -71.0920632802915,
                },
              },
            },
            place_id: 'ChIJWQc9Ba5w44kRej78VijIxIA',
            types: ['premise'],
          },
          {
            address_components: [
              {
                long_name: '1',
                short_name: '1',
                types: ['street_number'],
              },
              {
                long_name: 'Kendall Square',
                short_name: 'Kendall Square',
                types: ['route'],
              },
              {
                long_name: 'Wellington-Harrington',
                short_name: 'Wellington-Harrington',
                types: ['neighborhood', 'political'],
              },
              {
                long_name: 'Cambridge',
                short_name: 'Cambridge',
                types: ['locality', 'political'],
              },
              {
                long_name: 'Middlesex County',
                short_name: 'Middlesex County',
                types: ['administrative_area_level_2', 'political'],
              },
              {
                long_name: 'Massachusetts',
                short_name: 'MA',
                types: ['administrative_area_level_1', 'political'],
              },
              {
                long_name: 'United States',
                short_name: 'US',
                types: ['country', 'political'],
              },
              {
                long_name: '02139',
                short_name: '02139',
                types: ['postal_code'],
              },
            ],
            formatted_address: '1 Kendall Square, Cambridge, MA 02139, USA',
            geometry: {
              location: {
                lat: 42.3667741,
                lng: -71.09029269999999,
              },
              location_type: 'ROOFTOP',
              viewport: {
                northeast: {
                  lat: 42.3681230802915,
                  lng: -71.08894371970848,
                },
                southwest: {
                  lat: 42.3654251197085,
                  lng: -71.09164168029149,
                },
              },
            },
            place_id: 'ChIJDzVF5rFw44kRnXLNavtXsJ4',
            types: ['street_address'],
          },
        ],
        status: 'OK',
      },
    });
    const geocoder = new Geocoder('fake-api-key');
    const result = await geocoder.address({ lat: 42.366707, lng: -71.090149 });

    expect(result).toEqual(null);
  });
});
