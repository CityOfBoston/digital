import {
  FetchDeathCertificatesQuery,
  SearchDeathCertificatesQuery,
  LookupDeathCertificateOrderQuery,
} from './queries/graphql-types';

export interface DeathCertificate
  extends NonNullable<
      FetchDeathCertificatesQuery['deathCertificates']['certificates'][0]
    > {}

export interface DeathCertificateSearchResults
  extends NonNullable<
      SearchDeathCertificatesQuery['deathCertificates']['search']
    > {}

export interface DeathCertificateOrder
  extends NonNullable<
      LookupDeathCertificateOrderQuery['deathCertificates']['order']
    > {}
