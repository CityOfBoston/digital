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
      birthYear: string,
      deathYear: string,
      causeOfDeath: ?string,
    |} >,
  |},
|};

export type SearchDeathCertificatesQueryVariables = {|
  query: string,
|};

export type SearchDeathCertificatesQuery = {|
  deathCertificates: {|
    search: Array< {|
      id: string,
      firstName: string,
      lastName: string,
      birthYear: string,
      deathYear: string,
      causeOfDeath: ?string,
    |} >,
  |},
|};