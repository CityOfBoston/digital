import { gql } from '@cityofboston/next-client-common';
import { DeathCertificateOrder } from '../types';
import { LoopbackGraphql } from '../lib/loopback-graphql';

import {
  LookupDeathCertificateOrderQuery,
  LookupDeathCertificateOrderQueryVariables,
} from './graphql-types';

const QUERY = gql`
  query LookupDeathCertificateOrder($id: String!, $contactEmail: String!) {
    deathCertificates {
      order(id: $id, contactEmail: $contactEmail) {
        id
        date
        contactName
        contactEmail
        contactPhone
        shippingName
        shippingCompanyName
        shippingAddress1
        shippingAddress2
        shippingCity
        shippingState
        shippingZip
        items {
          certificate {
            id
            firstName
            lastName
          }
          quantity
          cost
        }
        certificateCost
        subtotal
        serviceFee
        total
      }
    }
  }
`;

// Look up a death certificate order by id and email address
export default async function lookupDeathCertificateOrder(
  loopbackGraphql: LoopbackGraphql,
  id: string,
  contactEmail: string
): Promise<DeathCertificateOrder | null> {
  const queryVariables: LookupDeathCertificateOrderQueryVariables = {
    id,
    contactEmail,
  };
  const response: LookupDeathCertificateOrderQuery = await loopbackGraphql(
    QUERY,
    queryVariables
  );

  return response.deathCertificates.order;
}
