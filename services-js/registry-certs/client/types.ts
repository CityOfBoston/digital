import {
  FetchDeathCertificates,
  SearchDeathCertificates,
  LookupDeathCertificateOrder,
} from './queries/graphql-types';

export interface DeathCertificate
  extends NonNullable<
      FetchDeathCertificates['deathCertificates']['certificates'][0]
    > {}

export interface DeathCertificateSearchResults
  extends NonNullable<SearchDeathCertificates['deathCertificates']['search']> {}

export interface DeathCertificateOrder
  extends NonNullable<
      LookupDeathCertificateOrder['deathCertificates']['order']
    > {}
