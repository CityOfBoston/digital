import { gql } from '@cityofboston/next-client-common';
import { LoopbackGraphql } from '../lib/loopback-graphql';
import Cart from '../store/Cart';
import Order from '../models/Order';

import {
  SubmitDeathCertificateOrderMutation,
  SubmitDeathCertificateOrderMutationVariables,
} from './graphql-types';

const QUERY = gql`
  mutation SubmitDeathCertificateOrder(
    $contactName: String!
    $contactEmail: String!
    $contactPhone: String!
    $shippingName: String!
    $shippingCompanyName: String!
    $shippingAddress1: String!
    $shippingAddress2: String
    $shippingCity: String!
    $shippingState: String!
    $shippingZip: String!
    $cardToken: String!
    $cardLast4: String!
    $cardholderName: String!
    $billingAddress1: String!
    $billingAddress2: String
    $billingCity: String!
    $billingState: String!
    $billingZip: String!
    $items: [CertificateOrderItemInput!]!
    $idempotencyKey: String!
  ) {
    submitDeathCertificateOrder(
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
      items: $items
      idempotencyKey: $idempotencyKey
    ) {
      id
    }
  }
`;

export default async function submitDeathCertificateOrder(
  loopbackGraphql: LoopbackGraphql,
  cart: Cart,
  order: Order
): Promise<string> {
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
    },
    cardToken,
    billingAddress1,
    billingAddress2,
    billingCity,
    billingState,
    billingZip,
    idempotencyKey,
  } = order;

  if (!cardToken || !cardLast4) {
    throw new Error(
      'submitDeathCertificateOrder called before card tokenization'
    );
  }

  if (!idempotencyKey) {
    throw new Error(
      'submitDeathCertificateOrder called before setting idempotencyKey'
    );
  }

  const queryVariables: SubmitDeathCertificateOrderMutationVariables = {
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
    items: cart.entries.map(e => ({
      id: e.id,
      quantity: e.quantity,
      name: e.cert ? `${e.cert.firstName} ${e.cert.lastName}` : 'Unknown Name',
    })),
    idempotencyKey,
  };

  const response: SubmitDeathCertificateOrderMutation = await loopbackGraphql(
    QUERY,
    queryVariables
  );

  return response.submitDeathCertificateOrder.id;
}
