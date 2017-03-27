// @flow

import RequestSearch from './RequestSearch';
import type { SearchRequest } from '../types';

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

  it('clears the selected request', () => {
    requestSearch.selectedRequest = MOCK_REQUEST;
    requestSearch.update(MOCK_SEARCH_RESULTS_PAGE);
    expect(requestSearch.selectedRequest).toEqual(null);
  });
});
