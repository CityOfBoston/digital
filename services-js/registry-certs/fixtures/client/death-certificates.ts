import { DeathCertificate } from '../../client/types';

export const TYPICAL_CERTIFICATE: DeathCertificate = {
  id: '000002',
  firstName: 'BRUCE',
  lastName: 'BANNER',
  deathYear: '2016',
  deathDate: '3/4/2016',
  pending: false,
  age: '53',
  birthDate: '5/1/1962',
};

export const PENDING_CERTIFICATE: DeathCertificate = {
  id: '000001',
  firstName: 'JAMES',
  lastName: 'HOWLETT (LOGAN)',
  deathYear: '2014',
  deathDate: '4/15/2014',
  pending: true,
  age: '44 yrs. 2 mos. 10 dys',
  birthDate: null,
};

export const NO_DATE_CERTIFICATE: DeathCertificate = {
  id: '000003',
  firstName: 'MONKEY',
  lastName: 'JOE',
  deathYear: '2004',
  deathDate: null,
  pending: false,
  age: '6',
  birthDate: null,
};
