// @flow

import type {
  FetchDeathCertificatesQuery,
  SearchDeathCertificatesQuery,
  LookupDeathCertificateOrderQuery,
} from './queries/graphql-types';

export type DeathCertificate = $NonMaybeType<
  $ArrayElement<
    $PropertyType<
      $PropertyType<FetchDeathCertificatesQuery, 'deathCertificates'>,
      'certificates'
    >
  >
>;

export type DeathCertificateSearchResults = $PropertyType<
  $PropertyType<SearchDeathCertificatesQuery, 'deathCertificates'>,
  'search'
>;

export type DeathCertificateOrder = $PropertyType<
  $PropertyType<LookupDeathCertificateOrderQuery, 'deathCertificates'>,
  'order'
>;
