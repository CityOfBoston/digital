/* @flow */
//  This file was automatically generated and should not be edited.

export type FetchDeathCertificatesQueryVariables = {|
  ids: Array< string >,
|};

export type FetchDeathCertificatesQuery = {|
  deathCertificates: {|
    certificates: Array< {|
      id: string,
      firstName: string,
      lastName: string,
      deathYear: string,
      deathDate: ?string,
      pending: ?boolean,
      age: ?string,
    |} >,
  |},
|};

export type SearchDeathCertificatesQueryVariables = {|
  query: string,
  page: number,
  startYear: ?string,
  endYear: ?string,
|};

export type SearchDeathCertificatesQuery = {|
  deathCertificates: {|
    search: {|
      page: number,
      pageSize: number,
      pageCount: number,
      resultCount: number,
      results: Array< {|
        id: string,
        firstName: string,
        lastName: string,
        deathYear: string,
        deathDate: ?string,
        pending: ?boolean,
        age: ?string,
      |} >,
    |},
  |},
|};