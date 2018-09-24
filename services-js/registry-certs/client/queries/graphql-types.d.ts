/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: FetchDeathCertificates
// ====================================================

export interface FetchDeathCertificates_deathCertificates_certificates {
  id: string;
  firstName: string;
  lastName: string;
  deathYear: string;
  deathDate: string | null;
  pending: boolean;
  age: string | null;
  birthDate: string | null;
}

export interface FetchDeathCertificates_deathCertificates {
  certificates: (FetchDeathCertificates_deathCertificates_certificates | null)[];
}

export interface FetchDeathCertificates {
  deathCertificates: FetchDeathCertificates_deathCertificates;
}

export interface FetchDeathCertificatesVariables {
  ids: string[];
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LookupDeathCertificateOrder
// ====================================================

export interface LookupDeathCertificateOrder_deathCertificates_order_items_certificate {
  id: string;
  firstName: string;
  lastName: string;
}

export interface LookupDeathCertificateOrder_deathCertificates_order_items {
  certificate: LookupDeathCertificateOrder_deathCertificates_order_items_certificate | null;
  quantity: number;
  cost: number;
}

export interface LookupDeathCertificateOrder_deathCertificates_order {
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
  items: LookupDeathCertificateOrder_deathCertificates_order_items[];
  certificateCost: number;
  subtotal: number;
  serviceFee: number;
  total: number;
}

export interface LookupDeathCertificateOrder_deathCertificates {
  order: LookupDeathCertificateOrder_deathCertificates_order | null;
}

export interface LookupDeathCertificateOrder {
  deathCertificates: LookupDeathCertificateOrder_deathCertificates;
}

export interface LookupDeathCertificateOrderVariables {
  id: string;
  contactEmail: string;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDeathCertificates
// ====================================================

export interface SearchDeathCertificates_deathCertificates_search_results {
  id: string;
  firstName: string;
  lastName: string;
  deathYear: string;
  deathDate: string | null;
  pending: boolean;
  age: string | null;
  birthDate: string | null;
}

export interface SearchDeathCertificates_deathCertificates_search {
  page: number;
  pageSize: number;
  pageCount: number;
  resultCount: number;
  results: SearchDeathCertificates_deathCertificates_search_results[];
}

export interface SearchDeathCertificates_deathCertificates {
  search: SearchDeathCertificates_deathCertificates_search;
}

export interface SearchDeathCertificates {
  deathCertificates: SearchDeathCertificates_deathCertificates;
}

export interface SearchDeathCertificatesVariables {
  query: string;
  page: number;
  startYear?: string | null;
  endYear?: string | null;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitDeathCertificateOrder
// ====================================================

export interface SubmitDeathCertificateOrder_submitDeathCertificateOrder {
  id: string;
}

export interface SubmitDeathCertificateOrder {
  submitDeathCertificateOrder: SubmitDeathCertificateOrder_submitDeathCertificateOrder;
}

export interface SubmitDeathCertificateOrderVariables {
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
  cardToken: string;
  cardLast4: string;
  cardholderName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  items: CertificateOrderItemInput[];
  idempotencyKey: string;
}

/* tslint:disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

// undefined
export interface CertificateOrderItemInput {
  id: string;
  name: string;
  quantity: number;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
