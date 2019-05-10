import moment from 'moment-timezone';

import {
  Resolvers,
  ResolvableWith,
  Int,
  Omit,
} from '@cityofboston/graphql-typescript';

import { Context } from './index';
import RegistryDb, {
  DeathCertificateSearchResult,
  DeathCertificate as DbDeathCertificate,
  FindOrderResult,
} from '../services/RegistryDb';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 500;

export interface DeathCertificates extends ResolvableWith<{}> {
  search(args: {
    query: string;
    page?: Int;
    pageSize?: Int;
    startYear?: string;
    endYear?: string;
  }): DeathCertificateSearch;

  certificate(args: { id: string }): DeathCertificate | null;
  certificates(args: { ids: string[] }): (DeathCertificate | null)[];

  order(args: {
    id: string;
    contactEmail: string;
  }): DeathCertificateOrder | null;
}

export interface DeathCertificate {
  id: string;
  firstName: string;
  lastName: string;
  deathDate: string | null;
  deathYear: string;
  pending: boolean;
  age: string | null;
  birthDate: string | null;
}

interface DeathCertificateSearch {
  page: Int;
  pageSize: Int;
  pageCount: Int;
  results: DeathCertificate[];
  resultCount: Int;
}

interface CertificateOrderItem
  extends ResolvableWith<AsyncCertificateOrderItem> {
  id: string;
  quantity: Int;
  cost: number;
  certificate: DeathCertificate | null;
}

interface DeathCertificateOrder
  extends ResolvableWith<AsyncDeathCertificateOrder> {
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

  items: CertificateOrderItem[];

  certificateCost: number;
  subtotal: number;
  serviceFee: number;
  total: number;
}

interface AsyncCertificateOrderItem
  extends Omit<CertificateOrderItem, 'certificate'> {
  certificate: () => Promise<DeathCertificate | null>;
}

interface AsyncDeathCertificateOrder
  extends Omit<DeathCertificateOrder, 'items'> {
  items: AsyncCertificateOrderItem[];
}

const DATE_REGEXP = /\(?\s*(\d\d?\/\d\d?\/\d\d\d\d)\s*\)?/;

export function parseAgeOrDateOfBirth(
  deathDate: string | null,
  str: string | null
): { age: string | null; birthDate: string | null } {
  const dateMatch = (str || '').match(DATE_REGEXP);
  const deathDateMatch = (deathDate || '').match(DATE_REGEXP);

  const deathMoment = deathDateMatch
    ? moment(deathDateMatch[1], 'MM/DD/YYYY')
    : null;

  let age: string | number = (str || '')
    .replace(/^0+/, '')
    .replace(DATE_REGEXP, '')
    .trim();

  if (dateMatch && !age && deathMoment) {
    age = deathMoment.diff(moment(dateMatch[1], 'MM/DD/YYYY'), 'years');
  }

  return {
    age: age ? `${age}` : null,
    birthDate: dateMatch ? dateMatch[1] : null,
  };
}

function searchResultToDeathCertificate(
  res: DeathCertificateSearchResult | DbDeathCertificate
): DeathCertificate {
  const { age, birthDate } = parseAgeOrDateOfBirth(
    res['Date of Death'],
    res.AgeOrDateOfBirth
  );

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
export function orderToReceiptInfo(id: string, order: FindOrderResult) {
  return {
    id,
    date: order.OrderDate,
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

    subtotal: Math.floor(order.CertificateCost * 100),
    serviceFee: Math.floor(order.ServiceFee * 100),
    total: Math.floor(order.TotalCost * 100),
  };
}

export const loadDeathCertificateItems = (
  registryDb: RegistryDb,
  order: FindOrderResult
) => {
  const certificateIds = order.CertificateIDs.split(',');
  const certificateQuantities = order.CertificateQuantities.split(',').map(q =>
    parseInt(q, 10)
  );

  const certificateCount = certificateQuantities.reduce((sum, q) => q + sum, 0);

  const certificateCost = Math.floor(
    (order.CertificateCost * 100) / certificateCount
  );

  const items = certificateIds.map((id, idx) => {
    const quantity = certificateQuantities[idx];

    return {
      id,
      quantity,
      cost: quantity * certificateCost,
      // Will only be executed if dereferenced.
      certificate: async () => {
        const cert = await registryDb.lookupDeathCertificate(id);
        return cert ? searchResultToDeathCertificate(cert) : null;
      },
    };
  });

  return {
    items,
    certificateCost,
  };
};

const deathCertificatesResolvers: Resolvers<DeathCertificates, Context> = {
  search: async (
    _root,
    { query, pageSize, page, startYear, endYear },
    { registryDb }
  ) => {
    const queryPageSize = Math.min(
      pageSize || DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );
    const queryPage = (page || 1) - 1;

    const results: Array<
      DeathCertificateSearchResult
    > = await registryDb.searchDeathCertificates(
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
  certificate: async (_root, { id }, { registryDb }) => {
    const res = await registryDb.lookupDeathCertificate(id);

    if (res) {
      return searchResultToDeathCertificate(res);
    } else {
      return null;
    }
  },
  certificates: (_root, { ids }, { registryDb }) =>
    Promise.all(
      ids.map(
        async (id): Promise<DeathCertificate | null> => {
          const res = await registryDb.lookupDeathCertificate(id);
          if (res) {
            return searchResultToDeathCertificate(res);
          } else {
            return null;
          }
        }
      )
    ),
  order: async (_root, { id, contactEmail }, { registryDb }) => {
    const dbOrder = await registryDb.findOrder(id);
    if (!dbOrder) {
      return null;
    }

    const receiptInfo = orderToReceiptInfo(id, dbOrder);

    const order = {
      ...receiptInfo,
      date: moment(receiptInfo.date)
        .tz('America/New_York')
        .format('l h:mmA'),
      ...loadDeathCertificateItems(registryDb, dbOrder),
    };

    // Safety check so that you can't easily iterate through all the receipt
    // IDs to get sensitive information.
    if (order.contactEmail.toLowerCase() !== contactEmail.toLowerCase()) {
      return null;
    }

    return order;
  },
};

export const resolvers = {
  DeathCertificates: deathCertificatesResolvers,
};
