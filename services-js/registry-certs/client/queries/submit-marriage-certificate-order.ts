import { gql, FetchGraphql } from '@cityofboston/next-client-common';

import Order from '../models/Order';

import {
  SubmitMarriageCertificateOrder,
  SubmitMarriageCertificateOrderVariables,
} from './graphql-types';

import MarriageCertificateRequest from '../store/MarriageCertificateRequest';
import { MarriageCertificateOrderResult } from '../types';

const QUERY = gql`
  mutation SubmitMarriageCertificateOrder(
    $contactName: String!
    $contactEmail: String!
    $contactPhone: String!
    $shippingName: String!
    $shippingCompanyName: String!
    $shippingAddress1: String!
    $shippingAddress2: String!
    $shippingCity: String!
    $shippingState: String!
    $shippingZip: String!
    $cardToken: String!
    $cardLast4: String!
    $cardholderName: String!
    $billingAddress1: String!
    $billingAddress2: String!
    $billingCity: String!
    $billingState: String!
    $billingZip: String!
    $item: MarriageCertificateOrderItemInput!
    $idempotencyKey: String!
  ) {
    submitMarriageCertificateOrder(
      contactName: $contactName
      contactEmail: $contactEmail
      contactPhone: $contactPhone
      shippingName: $shippingName
      shippingCompanyName: $shippingCompanyName
      shippingAddress1: $shippingAddress1
      shippingAddress2: $shippingAddress2
      shippingCity: $shippingCity
      shippingState: $shippingState
      shippingZip: $shippingZip
      cardToken: $cardToken
      cardLast4: $cardLast4
      cardholderName: $cardholderName
      billingAddress1: $billingAddress1
      billingAddress2: $billingAddress2
      billingCity: $billingCity
      billingState: $billingState
      billingZip: $billingZip
      item: $item
      idempotencyKey: $idempotencyKey
    ) {
      order {
        id
      }
      error {
        message
        cause
      }
    }
  }
`;

export default async function submitMarriageCertificateOrder(
  fetchGraphql: FetchGraphql,
  marriageCertificateRequest: MarriageCertificateRequest,
  order: Order
): Promise<MarriageCertificateOrderResult> {
  const {
    info: {
      contactName,
      contactEmail,
      contactPhone,
      shippingName,
      shippingCompanyName,
      shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingState,
      shippingZip,
      cardholderName,
      cardLast4,
      cardToken,
    },
    billingAddress1,
    billingAddress2,
    billingCity,
    billingState,
    billingZip,
    idempotencyKey,
  } = order;

  const {
    quantity,
    uploadSessionId,
    requestInformation: {
      forSelf,
      filedInBoston,
      dateOfMarriageExact,
      dateOfMarriageUnsure,
      fullName1,
      fullName2,
      maidenName1,
      maidenName2,
      altSpellings1,
      altSpellings2,
      parentsMarried1,
      parentsMarried2,
      customerNotes,
    },
  } = marriageCertificateRequest;

  if (!cardToken || !cardLast4) {
    throw new Error(
      'submitMarriageCertificateOrder called before card tokenization'
    );
  }

  if (!idempotencyKey) {
    throw new Error(
      'submitMarriageCertificateOrder called before setting idempotencyKey'
    );
  }

  // Marriage Certificate Request Questions:
  const requestDetails = `
Ordering for self: ${forSelf ? 'yes' : 'no'}
| Person1 parents married: ${parentsMarried1}
| Person2 parents married: ${parentsMarried2}
${filedInBoston === 'unknown' ? '*Unsure if filed in Boston*' : ''}
  `.trim();

  const queryVariables: SubmitMarriageCertificateOrderVariables = {
    contactName,
    contactEmail,
    contactPhone,
    shippingName,
    shippingCompanyName,
    shippingAddress1,
    shippingAddress2,
    shippingCity,
    shippingState,
    shippingZip,
    cardholderName,
    cardToken,
    cardLast4,
    billingAddress1,
    billingAddress2,
    billingState,
    billingCity,
    billingZip,
    item: {
      dateOfMarriageExact: dateOfMarriageExact
        ? dateOfMarriageExact.toISOString()
        : '',
      dateOfMarriageUnsure: dateOfMarriageUnsure || '',
      fullName1,
      fullName2,
      maidenName1: maidenName1 || '',
      maidenName2: maidenName2 || '',
      altSpellings1: altSpellings1 || '',
      altSpellings2: altSpellings2 || '',
      uploadSessionId,
      quantity,
      requestDetails,
      customerNotes: customerNotes || '',
    },
    idempotencyKey,
  };

  const response: SubmitMarriageCertificateOrder = await fetchGraphql(
    QUERY,
    queryVariables
  );

  return response.submitMarriageCertificateOrder;
}
