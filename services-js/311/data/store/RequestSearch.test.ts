import RequestSearch from './RequestSearch';
import { SearchCase } from '../types';

jest.mock('lodash/debounce');
const debounce = require('lodash/debounce');

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
      cases: [{ ...MOCK_CASE }],
    });

    expect(requestSearch.results[0]).toEqual(MOCK_CASE);
    expect(requestSearch.results.length).toEqual(1);
  });
});

describe('results', () => {
  it('filters to bounds', () => {
    requestSearch.updateCaseSearchResults(MOCK_SEARCH_CASES_RESULT);
    requestSearch.mapBounds = {
      contains: () => false,
    };

    expect(requestSearch.results).toEqual([]);
  });
});

describe('caseUrlsForSearchQuery', () => {
  it('finds a full Lagan case', () => {
    expect(RequestSearch.caseUrlsForSearchQuery('101002184571')!.as).toEqual(
      '/reports/101002184571'
    );
  });

  it('finds a new case ID', () => {
    expect(RequestSearch.caseUrlsForSearchQuery('3123123')!.as).toEqual(
      '/reports/3123123'
    );
  });

  it('ignores # signs and whitespace', () => {
    expect(RequestSearch.caseUrlsForSearchQuery('#3123123 ')!.as).toEqual(
      '/reports/3123123'
    );
  });

  it('adds legacy prefix to old case numbers', () => {
    expect(RequestSearch.caseUrlsForSearchQuery('2123123')!.as).toEqual(
      '/reports/101002123123'
    );
  });

  it('is null for another number', () => {
    expect(RequestSearch.caseUrlsForSearchQuery('1989')).toEqual(null);
  });

  it('is null in general', () => {
    expect(RequestSearch.caseUrlsForSearchQuery('sidewalk')).toEqual(null);
  });
});
