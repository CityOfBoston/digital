import moment from 'moment-timezone';
import { Context } from './index';
import RegistryOrders from '../services/RegistryOrders';
import RegistryData, {
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

interface SearchArgs {
  query: string;
  page?: number;
  pageSize?: number;
  startYear?: string;
  endYear?: string;
}

type CertificateArgs = {
  id: string;
};

type CertificatesArgs = {
  ids: string[];
};

interface OrderLookupArgs {
  id: string;
  contactEmail: string;
}

type DeathCertificate = {
  id: string;
  firstName: string;
  lastName: string;
  deathDate: string | null;
  deathYear: string;
  pending: boolean;
  age: string | null;
  birthDate: string | null;
};

type DeathCertificateSearch = {
  page: number;
  pageSize: number;
  pageCount: number;
  results: DeathCertificate[];
  resultCount: number;
};

type CertificateOrderItem = {
  id: string;
  quantity: number;
  cost: number;
  certificate: () => Promise<DeathCertificate | null | undefined>;
};

type DeathCertificateOrder = {
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

  cardholderName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;

  items: Array<CertificateOrderItem>;

  certificateCost: number;
  subtotal: number;
  serviceFee: number;
  total: number;
};

const DATE_REGEXP = /\(?\s*(\d\d?\/\d\d?\/\d\d\d\d)\s*\)?/;

export function parseAgeOrDateOfBirth(
  str: string | null
): { age: string | null; birthDate: string | null } {
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

// We export this function so that other places can take advantage of how it
// parses out ids and amounts. That's a little wonky, since this is still fairly
// GraphQL-specific in its return values.
export async function loadOrder(
  registryData: RegistryData,
  registryOrders: RegistryOrders,
  id: string
): Promise<DeathCertificateOrder | null> {
  const order = await registryOrders.findOrder(id);
  if (!order) {
    return null;
  }

  const certificateIds = order.CertificateIDs.split(',');
  const certificateQuantities = order.CertificateQuantities.split(',').map(q =>
    parseInt(q, 10)
  );

  const certificateCount = certificateQuantities.reduce((sum, q) => q + sum, 0);

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
    date: moment(order.OrderDate)
      .tz('America/New_York')
      .format('l h:mmA'),
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
}

export const resolvers = {
  DeathCertificates: {
    search: async (
      _root: unknown,
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
      _root: unknown,
      { id }: CertificateArgs,
      { registryData }: Context
    ): Promise<DeathCertificate | null> => {
      const res = await registryData.lookup(id);

      if (res) {
        return searchResultToDeathCertificate(res);
      } else {
        return null;
      }
    },
    certificates: (
      _root: unknown,
      { ids }: CertificatesArgs,
      { registryData }: Context
    ): Promise<Array<DeathCertificate | null>> =>
      Promise.all(
        ids.map(async (id): Promise<DeathCertificate | null> => {
          const res = await registryData.lookup(id);
          if (res) {
            return searchResultToDeathCertificate(res);
          } else {
            return null;
          }
        })
      ),
    order: async (
      _root: unknown,
      { id, contactEmail }: OrderLookupArgs,
      { registryData, registryOrders }: Context
    ): Promise<DeathCertificateOrder | null> => {
      const order = await loadOrder(registryData, registryOrders, id);
      if (!order) {
        return null;
      }

      // Safety check so that you can't easily iterate through all the receipt
      // IDs to get sensitive information.
      if (order.contactEmail.toLowerCase() !== contactEmail.toLowerCase()) {
        return null;
      }

      return order;
    },
  },
};
