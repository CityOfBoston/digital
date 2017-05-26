// @flow

import type { SearchResult } from '../Registry';

const TEST_SEARCH_RESULTS: SearchResult[] = [
  {
    CertificateID: 1,
    'Registered Number': '1001',
    InOut: 'I',
    'First Name': 'LOGAN',
    'Last Name': 'HOWLETT',
    'Decedent Name': 'LOGAN HOWLETT',
    birthYear: '1974',
    'Date of Death': '1/2/2014',
    RegisteredYear: '2014',
    causeOfDeath: 'Adamantium suffocation',
    AgeOrDateOfBirth: '058',
    ResultCount: 3,
  },
  {
    CertificateID: 2,
    'Registered Number': '1004',
    InOut: 'I',
    'First Name': 'BRUCE',
    'Last Name': 'BANNER',
    'Decedent Name': 'BRUCE BANNER',
    birthYear: '1962',
    'Date of Death': '12/31/2016',
    RegisteredYear: '2016',
    causeOfDeath: 'Hawkeye',
    AgeOrDateOfBirth: '61',
    ResultCount: 3,
  },
  {
    CertificateID: 3,
    'Registered Number': '1010',
    InOut: 'I',
    'First Name': 'MONKEY',
    'Last Name': 'JOE',
    'Decedent Name': 'MONKEY JOE',
    birthYear: '1991',
    'Date of Death': '8/16/2005',
    RegisteredYear: '2005',
    causeOfDeath: null,
    AgeOrDateOfBirth: '4 yrs. 2 mos. 10 dys',
    ResultCount: 3,
  },
];


export default class Registry {
  // eslint-disable-next-line no-unused-vars
  async search(name: string): Promise<Array<SearchResult>> {
    return TEST_SEARCH_RESULTS;
  }
}
