import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import moment from 'moment-timezone';

import { capitalize } from '../../lib/helpers';

import { PACKAGE_SRC_ROOT } from '../util';

require('./handlebars-helpers');

const readFile = promisify(fs.readFile);

const TEMPLATES_DIR = path.resolve(PACKAGE_SRC_ROOT, `./server/email`);

export type OrderType = 'birth' | 'marriage';

export type ReceiptData = {
  orderDate: Date;
  orderId: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  /** Cost in cents */
  subtotal: number;
  /** Cost in cents */
  serviceFee: number;
  /** Cost in cents */
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    cost: number;
    date: Date | null | string;
  }>;
  /** Cost in cents */
  fixedFee: number;
  /** Percentage between 0–1 */
  percentageFee: number;
  serviceFeeUri: string;
};

/**
 * The data required by the receipt templates
 */
type ReceiptTemplateData = {
  heading: string;
  orderDate: string;
  orderId: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  /**
   * Can be null to not display a subtotal
   */
  subtotal: number | null;
  serviceFee: number;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    cost: number;
  }>;
  fixedFee: number;
  percentageFee: number;
  serviceFeeUri: string;
  registryEmail: string;

  aboveOrderText?: string[];
  belowOrderText?: string[];
};

type ExpiredTemplateData = {
  orderType: OrderType;
  orderDate: string;
  orderId: string;
  registryEmail: string;
};

export type RenderedEmail = {
  text: string;
  html: string;
  subject: string;
};

type EmailRenderer<D> = (d: D, subject: string) => RenderedEmail;
type ReceiptEmailRenderer = EmailRenderer<ReceiptTemplateData>;
type ExpiredEmailRenderer = EmailRenderer<ExpiredTemplateData>;

const formatOrderDate = (d: Date) =>
  moment(d)
    .tz('America/New_York')
    .format('l h:mmA');

export class EmailTemplates {
  private readonly receiptEmailRenderer: ReceiptEmailRenderer;
  private readonly expiredEmailRenderer: ExpiredEmailRenderer;

  constructor(
    receiptEmailRenderer: ReceiptEmailRenderer,
    expiredEmailRenderer: ExpiredEmailRenderer
  ) {
    this.receiptEmailRenderer = receiptEmailRenderer;
    this.expiredEmailRenderer = expiredEmailRenderer;
  }

  deathReceipt(receipt: ReceiptData): RenderedEmail {
    return this.receiptEmailRenderer(
      {
        ...receipt,

        heading: 'Thank you for your order!',
        orderDate: formatOrderDate(receipt.orderDate),
        registryEmail: 'registry@boston.gov',

        items: receipt.items.map(({ cost, quantity, name }) => ({
          quantity,
          cost,
          description: `Death certificate for ${name}`,
        })),

        belowOrderText: [
          'Your order will be shipped within 1–2 business days via the U.S. Postal Service.',
        ],
      },
      `City of Boston Death Certificates Order #${receipt.orderId}`
    );
  }

  // shared by Birth and Marriage
  requestReceipt(orderType: OrderType, receipt: ReceiptData): RenderedEmail {
    return this.requestReceiptCommon(
      orderType,
      receipt,
      'Thank you for your order!',
      {
        belowOrderText: [
          `We have received your order. You will be charged when the ${
            receipt.items[0].quantity > 1
              ? 'certificates ship'
              : 'certificate ships'
          }.`,
          'We will contact you if we need more information to fulfill the order. If we contact you but do not hear back within 3 business days, we will cancel the order without charge.',
        ],
      }
    );
  }

  requestShipped(orderType: OrderType, receipt: ReceiptData): RenderedEmail {
    return this.requestReceiptCommon(
      orderType,
      receipt,
      `Your ${orderType} certificate order is on its way!`,
      {
        aboveOrderText: [
          'We’ve processed your order and charged your card. Your order is being shipped via U.S. Postal Service to the shipping address you provided.',
        ],
      }
    );
  }

  requestReceiptCommon(
    orderType,
    receipt: ReceiptData,
    heading: string,
    orderText: object
  ): RenderedEmail {
    const registryEmail = `${orderType}@boston.gov`;

    // returns date string inside parentheses
    const dateString = (date): string => {
      return `(${moment(date)
        // Database times are midnight UTC. We need to specify UTC or else
        // we’ll print the day before, because midnight UTC is the day
        // before in Boston.
        .tz('UTC')
        .format('l')})`;
    };

    return this.receiptEmailRenderer(
      {
        ...receipt,

        heading,
        orderDate: formatOrderDate(receipt.orderDate),
        registryEmail,
        subtotal: null,

        // todo: provide enhanced information for marriage orders
        items: receipt.items.map(({ cost, quantity, name, date }) => ({
          quantity,
          cost,
          description: `Certified ${orderType} certificate ${
            orderType === 'birth' ? `for ${name} ${dateString(date)}` : ''
          }`,
        })),

        ...orderText,
      },
      `City of Boston ${capitalize(orderType)} Certificate Order #${
        receipt.orderId
      }`
    );
  }

  requestExpired(orderType: OrderType, orderId: string, orderDate: Date) {
    const registryEmail = `${orderType}@boston.gov`;

    return this.expiredEmailRenderer(
      {
        orderType,
        orderDate: formatOrderDate(orderDate),
        orderId,
        registryEmail,
      },
      `City of Boston ${capitalize(orderType)} Certificate Order #${orderId}`
    );
  }
}

export async function makeEmailTemplates(): Promise<EmailTemplates> {
  return new EmailTemplates(
    await makeEmailRenderer('receipt', 'order'),
    await makeEmailRenderer('expired', 'order')
  );
}

async function makeEmailRenderer<D>(
  templatePrefix: string,
  dataKey: string
): Promise<EmailRenderer<D>> {
  type TemplateFunc = (d: { [k: string]: D }) => string;

  const mjmlTemplateP = readFile(
    path.resolve(TEMPLATES_DIR, `${templatePrefix}.mjml.hbs`),
    'utf-8'
  );

  const textTemplateP = readFile(
    path.resolve(TEMPLATES_DIR, `${templatePrefix}.txt.hbs`),
    'utf-8'
  );

  const mjmlFunc: TemplateFunc = Handlebars.compile(await mjmlTemplateP);
  const textFunc: TemplateFunc = Handlebars.compile(await textTemplateP);

  return (d: D, subject: string) => ({
    html: mjml2html(mjmlFunc({ [dataKey]: d })).html,
    text: textFunc({ [dataKey]: d }).trim(),
    subject,
  });
}
