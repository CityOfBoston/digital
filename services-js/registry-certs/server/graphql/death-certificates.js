// @flow

import moment from 'moment';
import type { Context } from './index';
import type {
  DeathCertificateSearchResult,
  DeathCertificate as DbDeathCertificate,
} from '../services/RegistryData';

export const Schema = `
type DeathCertificate {
  id: String!
  firstName: String!
  lastName: String!
  deathDate: String
  deathYear: String!
  pending: Boolean
  age: String
  birthDate: String
}

# Pages are 1-indexed to make the UI look better
type DeathCertificateSearch {
  page: Int!
  pageSize: Int!
  pageCount: Int!
  results: [DeathCertificate!]!
  resultCount: Int!
}

type CertificateOrderItem {
  id: String!
  quantity: Int!
  cost: Int!
  certificate: DeathCertificate
}

type DeathCertificateOrder {
  id: String!
  date: String!

  contactName: String!
  contactEmail: String!
  contactPhone: String!

  shippingName: String!
  shippingCompanyName: String!
  shippingAddress1: String!
  shippingAddress2: String!
  shippingCity: String!
  shippingState: String!
  shippingZip: String!

  cardholderName: String!
  billingAddress1: String!
  billingAddress2: String!
  billingCity: String!
  billingState: String!
  billingZip: String!

  items: [CertificateOrderItem!]!

  certificateCost: Int!
  subtotal: Int!
  serviceFee: Int!
  total: Int!
}

type DeathCertificates {
  search(query: String!, page: Int, pageSize: Int, startYear: String, endYear: String): DeathCertificateSearch!
  certificate(id: String!): DeathCertificate
  certificates(ids: [String!]!): [DeathCertificate]!
  order(id: String!, contactEmail: String!): DeathCertificateOrder
}
`;

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 500;

type SearchArgs = {
  query: string,
  page?: number,
  pageSize?: number,
  startYear?: string,
  endYear?: string,
};

type CertificateArgs = {
  id: string,
};

type CertificatesArgs = {
  ids: string[],
};

type OrderLookupArgs = {|
  id: string,
  contactEmail: string,
|};

type DeathCertificate = {
  id: string,
  firstName: string,
  lastName: string,
  deathDate: ?string,
  deathYear: string,
  pending: boolean,
  age: ?string,
};

type DeathCertificateSearch = {
  page: number,
  pageSize: number,
  pageCount: number,
  results: DeathCertificate[],
  resultCount: number,
};

type CertificateOrderItem = {
  id: string,
  quantity: number,
  cost: number,
  certificate: () => Promise<?DeathCertificate>,
};

type DeathCertificateOrder = {
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

  cardholderName: string,
  billingAddress1: string,
  billingAddress2: string,
  billingCity: string,
  billingState: string,
  billingZip: string,

  items: Array<CertificateOrderItem>,

  certificateCost: number,
  subtotal: number,
  serviceFee: number,
  total: number,
};

const DATE_REGEXP = /\(?\s*(\d\d?\/\d\d?\/\d\d\d\d)\s*\)?/;

export function parseAgeOrDateOfBirth(
  str: ?string
): { age: ?string, birthDate: ?string } {
  const dateMatch = (str || '').match(DATE_REGEXP);

  let age = (str || '')
    .replace(/^0+/, '')
    .replace(DATE_REGEXP, '')
    .trim();

  if (dateMatch && !age) {
    age = moment().diff(moment(dateMatch[1], 'MM/DD/YYYY'), 'years');
  }

  return {
    age: age ? `${age}` : null,
    birthDate: dateMatch ? dateMatch[1] : null,
  };
}

function searchResultToDeathCertificate(
  res: DeathCertificateSearchResult | DbDeathCertificate
): DeathCertificate {
  const { age, birthDate } = parseAgeOrDateOfBirth(res.AgeOrDateOfBirth);

  return {
    id: res.CertificateID.toString(),
    firstName: res['First Name'],
    lastName: res['Last Name'],
    deathDate: res['Date of Death'],
    deathYear: res.RegisteredYear,
    pending: !!res.Pending,
    age,
    birthDate,
  };
}

export const resolvers = {
  DeathCertificates: {
    search: async (
      root: mixed,
      { query, pageSize, page, startYear, endYear }: SearchArgs,
      { registryData }: Context
    ): Promise<DeathCertificateSearch> => {
      const queryPageSize = Math.min(
        pageSize || DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
      );
      const queryPage = (page || 1) - 1;

      const results: Array<
        DeathCertificateSearchResult
      > = await registryData.search(
        query,
        queryPage,
        queryPageSize,
        startYear,
        endYear
      );

      const resultCount = results.length > 0 ? results[0].ResultCount : 0;
      const pageCount = Math.ceil(resultCount / queryPageSize);

      return {
        page: queryPage + 1,
        pageSize: queryPageSize,
        pageCount,
        resultCount,
        results: results.map(searchResultToDeathCertificate),
      };
    },
    certificate: async (
      root: mixed,
      { id }: CertificateArgs,
      { registryData }: Context
    ): Promise<?DeathCertificate> => {
      const res = await registryData.lookup(id);

      if (res) {
        return searchResultToDeathCertificate(res);
      } else {
        return null;
      }
    },
    certificates: (
      root: mixed,
      { ids }: CertificatesArgs,
      { registryData }: Context
    ): Promise<Array<?DeathCertificate>> =>
      Promise.all(
        ids.map(async (id): Promise<?DeathCertificate> => {
          const res = await registryData.lookup(id);
          if (res) {
            return searchResultToDeathCertificate(res);
          } else {
            return null;
          }
        })
      ),
    order: async (
      root: mixed,
      { id, contactEmail }: OrderLookupArgs,
      { registryData, registryOrders }: Context
    ): Promise<?DeathCertificateOrder> => {
      const order = await registryOrders.findOrder(id);
      if (!order) {
        return null;
      }

      if (order.ContactEmail.toLowerCase() !== contactEmail.toLowerCase()) {
        return null;
      }

      const certificateIds = order.CertificateIDs.split(',');
      const certificateQuantities = order.CertificateQuantities
        .split(',')
        .map(q => parseInt(q, 10));

      const certificateCount = certificateQuantities.reduce(
        (sum, q) => q + sum,
        0
      );

      const certificateCost = Math.floor(
        order.CertificateCost * 100 / certificateCount
      );

      const items = certificateIds.map((id, idx) => {
        const quantity = certificateQuantities[idx];

        return {
          id,
          quantity,
          cost: quantity * certificateCost,
          // Will only be executed if dereferenced.
          certificate: async () => {
            const cert = await registryData.lookup(id);
            return cert ? searchResultToDeathCertificate(cert) : null;
          },
        };
      });

      return {
        id,
        date: moment(order.OrderDate).format('l h:mmA'),
        contactName: order.ContactName,
        contactEmail: order.ContactEmail,
        contactPhone: order.ContactPhone,
        shippingName: order.ShippingName,
        shippingCompanyName: order.ShippingCompany,
        shippingAddress1: order.ShippingAddr1,
        shippingAddress2: order.ShippingAddr2,
        shippingCity: order.ShippingCity,
        shippingState: order.ShippingState,
        shippingZip: order.ShippingZIP,
        cardholderName: order.BillingName,
        billingAddress1: order.BillingAddr1,
        billingAddress2: order.BillingAddr2,
        billingCity: order.BillingCity,
        billingState: order.BillingState,
        billingZip: order.BillingZIP,

        items,

        certificateCost,
        subtotal: Math.floor(order.CertificateCost * 100),
        serviceFee: Math.floor(order.ServiceFee * 100),
        total: Math.floor(order.TotalCost * 100),
      };
    },
  },
};
