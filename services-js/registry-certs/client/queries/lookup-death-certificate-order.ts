import { gql, FetchGraphql } from '@cityofboston/next-client-common';
import { DeathCertificateOrder } from '../types';

import {
  LookupDeathCertificateOrder,
  LookupDeathCertificateOrderVariables,
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
  fetchGraphql: FetchGraphql,
  id: string,
  contactEmail: string
): Promise<DeathCertificateOrder | null> {
  const queryVariables: LookupDeathCertificateOrderVariables = {
    id,
    contactEmail,
  };
  const response: LookupDeathCertificateOrder = await fetchGraphql(
    QUERY,
    queryVariables
  );

  return response.deathCertificates.order;
}
