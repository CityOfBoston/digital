// @flow

import type { SearchDeathCertificatesQuery } from './queries/graphql-types';

export type DeathCertificate = $ArrayElement<$PropertyType<$PropertyType<SearchDeathCertificatesQuery, 'deathCertificates'>, 'search'>>
