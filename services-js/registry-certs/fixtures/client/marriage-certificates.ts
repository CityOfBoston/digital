import { MarriageCertificateRequestInformation } from '../../client/types';

export const TYPICAL_REQUEST: MarriageCertificateRequestInformation = {
  forSelf: true,
  howRelated: '',
  filedInBoston: 'yes',
  dateOfMarriage: new Date(Date.UTC(2015, 5, 10)),
  firstName1: 'Laurel',
  lastName1: 'Johnson',
  maidenName1: 'Smith',
  firstName2: 'Terry',
  lastName2: 'Johnson',
  maidenName2: 'Doe',
  parentsMarried1: 'yes',
  parentsMarried2: 'yes',
  idImageBack: null,
  idImageFront: null,
  supportingDocuments: [],
};
