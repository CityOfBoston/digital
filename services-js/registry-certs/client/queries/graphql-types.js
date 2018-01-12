/* @flow */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CertificateOrderItemInput = {|
  id: string,
  name: string,
  quantity: number,
|};

export type FetchDeathCertificatesQueryVariables = {|
  ids: Array< string >,
|};

export type FetchDeathCertificatesQuery = {|
  deathCertificates: {|
    certificates:  Array<? {|
      id: string,
      firstName: string,
      lastName: string,
      deathYear: string,
      deathDate: ?string,
      pending: ?boolean,
      age: ?string,
      birthDate: ?string,
    |} >,
  |},
|};

export type LookupDeathCertificateOrderQueryVariables = {|
  id: string,
  contactEmail: string,
|};

export type LookupDeathCertificateOrderQuery = {|
  deathCertificates: {|
    order: ? {|
      id: string,
      date: string,
      contactName: string,
      contactEmail: string,
      contactPhone: string,
      shippingName: string,
      shippingCompanyName: string,
      shippingAddress1: string,
      shippingAddress2: string,
      shippingCity: string,
      shippingState: string,
      shippingZip: string,
      items:  Array< {|
        certificate: ? {|
          id: string,
          firstName: string,
          lastName: string,
        |},
        quantity: number,
        cost: number,
      |} >,
      certificateCost: number,
      subtotal: number,
      serviceFee: number,
      total: number,
    |},
  |},
|};

export type SearchDeathCertificatesQueryVariables = {|
  query: string,
  page: number,
  startYear?: ?string,
  endYear?: ?string,
|};

export type SearchDeathCertificatesQuery = {|
  deathCertificates: {|
    search: {|
      page: number,
      pageSize: number,
      pageCount: number,
      resultCount: number,
      results:  Array< {|
        id: string,
        firstName: string,
        lastName: string,
        deathYear: string,
        deathDate: ?string,
        pending: ?boolean,
        age: ?string,
        birthDate: ?string,
      |} >,
    |},
  |},
|};

export type SubmitDeathCertificateOrderMutationVariables = {|
  contactName: string,
  contactEmail: string,
  contactPhone: string,
  shippingName: string,
  shippingCompanyName: string,
  shippingAddress1: string,
  shippingAddress2?: ?string,
  shippingCity: string,
  shippingState: string,
  shippingZip: string,
  cardToken: string,
  cardLast4: string,
  cardholderName: string,
  billingAddress1: string,
  billingAddress2?: ?string,
  billingCity: string,
  billingState: string,
  billingZip: string,
  items: Array< CertificateOrderItemInput >,
  idempotencyKey: string,
|};

export type SubmitDeathCertificateOrderMutation = {|
  submitDeathCertificateOrder: {|
    id: string,
  |},
|};