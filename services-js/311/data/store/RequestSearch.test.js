// @flow

import RequestSearch from './RequestSearch';
import type { SearchRequest, SearchRequestsPage } from '../types';

jest.mock('../dao/search-requests');
const searchRequests: JestMockFn = (require('../dao/search-requests'): any).default;

let requestSearch;

export const MOCK_REQUEST: SearchRequest = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
  },
  description: 'I think that Thanos is here',
  status: 'open',
  address: 'City Hall Plaza, Boston, MA 02131',
  location: {
    lat: 4,
    lng: 5,
  },
  updatedAtRelativeString: '4 minutes ago',
  mediaUrl: null,
};

const MOCK_SEARCH_RESULTS_PAGE = {
  requests: [MOCK_REQUEST],
};

beforeEach(() => {
  requestSearch = new RequestSearch();
});

describe('update', () => {
  it('sets the results', () => {
    requestSearch.update(MOCK_SEARCH_RESULTS_PAGE);
    expect(requestSearch.results[0]).toEqual(MOCK_REQUEST);
  });
});

describe('search', () => {
  let resolveSearch: (page: SearchRequestsPage) => void;
  let loopbackGraphql;

  beforeEach(() => {
    searchRequests.mockReturnValue(new Promise((resolve) => {
      resolveSearch = resolve;
    }));

    loopbackGraphql = jest.fn();
    requestSearch.start(loopbackGraphql);
  });

  afterEach(() => {
    requestSearch.stop();
  });

  it('doesn’t search without location', () => {
    requestSearch.query = 'Mewnir';
    expect(searchRequests).not.toHaveBeenCalled();
  });

  it('searches for location', () => {
    requestSearch.mapCenter = { lat: 1, lng: 1 };
    requestSearch.radiusKm = 1;

    expect(searchRequests).toHaveBeenCalledWith(loopbackGraphql, '', { lat: 1, lng: 1 }, 1);
  });

  it('searches with a query', () => {
    requestSearch.query = 'Mewnir';
    requestSearch.mapCenter = { lat: 1, lng: 1 };
    requestSearch.radiusKm = 1;

    expect(searchRequests).toHaveBeenCalledWith(loopbackGraphql, 'Mewnir', { lat: 1, lng: 1 }, 1);
  });

  it('updates with the response', async () => {
    requestSearch.mapCenter = { lat: 1, lng: 1 };
    requestSearch.radiusKm = 1;

    resolveSearch(MOCK_SEARCH_RESULTS_PAGE);

    await Promise.resolve();

    expect(requestSearch.results[0]).toEqual(MOCK_REQUEST);
  });

  it('only searches one at a time', async () => {
    requestSearch.mapCenter = { lat: 1, lng: 1 };
    requestSearch.radiusKm = 1;
    requestSearch.query = 'Mewnir';

    // Search kicked off before query was set
    expect(searchRequests).toHaveBeenCalledWith(loopbackGraphql, '', { lat: 1, lng: 1 }, 1);
    expect(searchRequests).not.toHaveBeenCalledWith(loopbackGraphql, 'Mewnir', { lat: 1, lng: 1 }, 1);

    requestSearch.query = 'Cat Thor';

    resolveSearch(MOCK_SEARCH_RESULTS_PAGE);

    await Promise.resolve();
    await Promise.resolve();

    // It searches on the latest query, not anything that was set in between
    expect(searchRequests).toHaveBeenCalledWith(loopbackGraphql, 'Cat Thor', { lat: 1, lng: 1 }, 1);
    expect(searchRequests).not.toHaveBeenCalledWith(loopbackGraphql, 'Mewnir', { lat: 1, lng: 1 }, 1);
  });
});
