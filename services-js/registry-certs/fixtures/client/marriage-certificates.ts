import { MarriageCertificateRequestInformation } from '../../client/types';

export const TYPICAL_REQUEST: MarriageCertificateRequestInformation = {
  forSelf: true,
  howRelated: '',
  filedInBoston: 'yes',
  dateOfMarriageExact: new Date(Date.UTC(2015, 5, 10)),
  fullName1: 'Laurel Johnson',
  fullName2: 'Terry Johnson',
  maidenName1: 'Laurel Smith',
  maidenName2: 'Terry Doe',
  parentsMarried1: 'yes',
  parentsMarried2: 'yes',
  idImageBack: null,
  idImageFront: null,
  supportingDocuments: [],
};
