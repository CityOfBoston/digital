// @flow

import type {
  FetchDeathCertificatesQuery,
  SearchDeathCertificatesQuery,
} from './queries/graphql-types';

export type DeathCertificate = $ArrayElement<
  $PropertyType<
    $PropertyType<FetchDeathCertificatesQuery, 'deathCertificates'>,
    'certificates',
  >,
>;
export type DeathCertificateSearchResults = $PropertyType<
  $PropertyType<SearchDeathCertificatesQuery, 'deathCertificates'>,
  'search',
>;
