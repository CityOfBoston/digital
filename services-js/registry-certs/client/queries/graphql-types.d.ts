/* tslint:disable */
//  This file was automatically generated and should not be edited.

export interface CertificateOrderItemInput {
  id: string;
  name: string;
  quantity: number;
}

export interface FetchDeathCertificatesQueryVariables {
  ids: Array<string>;
}

export interface FetchDeathCertificatesQuery {
  deathCertificates: {
    certificates: Array<{
      id: string;
      firstName: string;
      lastName: string;
      deathYear: string;
      deathDate: string | null;
      pending: boolean | null;
      age: string | null;
      birthDate: string | null;
    } | null>;
  };
}

export interface LookupDeathCertificateOrderQueryVariables {
  id: string;
  contactEmail: string;
}

export interface LookupDeathCertificateOrderQuery {
  deathCertificates: {
    order: {
      id: string;
      date: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
      shippingName: string;
      shippingCompanyName: string;
      shippingAddress1: string;
      shippingAddress2: string;
      shippingCity: string;
      shippingState: string;
      shippingZip: string;
      items: Array<{
        certificate: {
          id: string;
          firstName: string;
          lastName: string;
        } | null;
        quantity: number;
        cost: number;
      }>;
      certificateCost: number;
      subtotal: number;
      serviceFee: number;
      total: number;
    } | null;
  };
}

export interface SearchDeathCertificatesQueryVariables {
  query: string;
  page: number;
  startYear?: string | null;
  endYear?: string | null;
}

export interface SearchDeathCertificatesQuery {
  deathCertificates: {
    search: {
      page: number;
      pageSize: number;
      pageCount: number;
      resultCount: number;
      results: Array<{
        id: string;
        firstName: string;
        lastName: string;
        deathYear: string;
        deathDate: string | null;
        pending: boolean | null;
        age: string | null;
        birthDate: string | null;
      }>;
    };
  };
}

export interface SubmitDeathCertificateOrderMutationVariables {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2?: string | null;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  cardToken: string;
  cardLast4: string;
  cardholderName: string;
  billingAddress1: string;
  billingAddress2?: string | null;
  billingCity: string;
  billingState: string;
  billingZip: string;
  items: Array<CertificateOrderItemInput>;
  idempotencyKey: string;
}

export interface SubmitDeathCertificateOrderMutation {
  submitDeathCertificateOrder: {
    id: string;
  };
}
