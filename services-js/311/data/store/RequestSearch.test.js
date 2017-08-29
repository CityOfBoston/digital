// @flow

import RequestSearch from './RequestSearch';
import type { SearchCase } from '../types';

jest.mock('lodash/debounce');
const debounce: JestMockFn = (require('lodash/debounce'): any);

let requestSearch;

export const MOCK_CASE: SearchCase = {
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
  requestedAt: 1490804343,
  requestedAtRelativeString: '4 minutes ago',
  images: [],
};

const MOCK_SEARCH_CASES_RESULT = {
  cases: [MOCK_CASE],
  query: '',
};

beforeEach(() => {
  requestSearch = new RequestSearch();
  debounce.mockImplementation(fn => fn);
});

describe('update', () => {
  it('sets the results', () => {
    requestSearch.updateCaseSearchResults(MOCK_SEARCH_CASES_RESULT);
    expect(requestSearch.results[0]).toEqual(MOCK_CASE);
  });

  it('re-uses existing IDs', () => {
    requestSearch.updateCaseSearchResults(MOCK_SEARCH_CASES_RESULT);
    requestSearch.updateCaseSearchResults({
      ...MOCK_SEARCH_CASES_RESULT,
      requests: [{ ...MOCK_CASE }],
    });

    expect(requestSearch.results[0]).toEqual(MOCK_CASE);
    expect(requestSearch.results.length).toEqual(1);
  });
});

describe('results', () => {
  it('filters to bounds', () => {
    requestSearch.updateCaseSearchResults(MOCK_SEARCH_CASES_RESULT);
    requestSearch.mapBounds = ({
      contains: () => false,
    }: any);

    expect(requestSearch.results).toEqual([]);
  });
});

describe('isCaseId', () => {
  it('is true for a Lagan case', () => {
    expect(RequestSearch.isCaseId('101002184571')).toEqual(true);
  });

  it('is true for a new case', () => {
    expect(RequestSearch.isCaseId('17-00001162')).toEqual(true);
  });

  it('is false for another number', () => {
    expect(RequestSearch.isCaseId('1989')).toEqual(false);
  });

  it('is false in general', () => {
    expect(RequestSearch.isCaseId('sidewalk')).toEqual(false);
  });
});
