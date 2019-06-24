import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import Order from '../models/Order';

import {
  SubmitBirthCertificateOrder,
  SubmitBirthCertificateOrderVariables,
} from './graphql-types';
import BirthCertificateRequest from '../store/BirthCertificateRequest';
import { BirthCertificateOrderResult } from '../types';

const QUERY = gql`
  mutation SubmitBirthCertificateOrder(
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
    $item: BirthCertificateOrderItemInput!
    $idempotencyKey: String!
  ) {
    submitBirthCertificateOrder(
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

export default async function submitBirthCertificateOrder(
  fetchGraphql: FetchGraphql,
  birthCertificateRequest: BirthCertificateRequest,
  order: Order
): Promise<BirthCertificateOrderResult> {
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
      howRelated,
      bornInBoston,
      parentsLivedInBoston,
      parentsMarried,
      birthDate,
      firstName,
      lastName,
      altSpelling,
      parent1FirstName,
      parent1LastName,
      parent2FirstName,
      parent2LastName,
    },
  } = birthCertificateRequest;

  if (!cardToken || !cardLast4) {
    throw new Error(
      'submitBirthCertificateOrder called before card tokenization'
    );
  }

  if (!idempotencyKey) {
    throw new Error(
      'submitBirthCertificateOrder called before setting idempotencyKey'
    );
  }

  if (!birthDate) {
    throw new Error('birthDate was not set');
  }

  // Birth Certificate Request Questions:
  const requestDetails = `
Relation: ${forSelf ? 'self' : howRelated || 'unknown'}
| Born in BOS: ${bornInBoston}${
    bornInBoston !== 'yes'
      ? `
| Parents lived in BOS: ${parentsLivedInBoston}`
      : ''
  }
| Parents married: ${parentsMarried}
  `.trim();

  const queryVariables: SubmitBirthCertificateOrderVariables = {
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
      birthDate: birthDate!.toISOString(),
      firstName,
      lastName,
      uploadSessionId,
      alternateSpellings: altSpelling || '',
      parent1FirstName,
      parent1LastName: parent1LastName || '',
      parent2FirstName: parent2FirstName || '',
      parent2LastName: parent2LastName || '',
      quantity,
      requestDetails,
    },
    idempotencyKey,
  };

  const response: SubmitBirthCertificateOrder = await fetchGraphql(
    QUERY,
    queryVariables
  );

  return response.submitBirthCertificateOrder;
}
