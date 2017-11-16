// @flow

import type { LoopbackGraphql } from '../lib/loopback-graphql';
import type Cart from '../store/Cart';
import type Order from '../models/Order';

import type {
  SubmitDeathCertificateOrderMutation,
  SubmitDeathCertificateOrderMutationVariables,
} from './graphql-types';
import SubmitDeathCertificateOrderMutationGraphql from './SubmitDeathCertificateOrder.graphql';

export default async function submitDeathCertificateOrder(
  loopbackGraphql: LoopbackGraphql,
  cart: Cart,
  order: Order,
  cardToken: string,
  cardLast4: string
): Promise<string> {
  const {
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
  } = order.info;

  const {
    billingAddress1,
    billingAddress2,
    billingCity,
    billingState,
    billingZip,
  } = order;

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
  };

  const response: SubmitDeathCertificateOrderMutation = await loopbackGraphql(
    SubmitDeathCertificateOrderMutationGraphql,
    queryVariables
  );

  return response.submitDeathCertificateOrder.id;
}
