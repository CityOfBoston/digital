import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import moment from 'moment-timezone';

import { PACKAGE_SRC_ROOT } from '../util';

require('./handlebars-helpers');

const readFile = promisify(fs.readFile);

const TEMPLATES_DIR = path.resolve(PACKAGE_SRC_ROOT, `./server/email`);

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
    date: Date | null;
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

  birthReceipt(receipt: ReceiptData): RenderedEmail {
    return this.receiptEmailRenderer(
      {
        ...receipt,

        heading: 'Thank you for your order!',
        orderDate: formatOrderDate(receipt.orderDate),
        registryEmail: 'birth@boston.gov',
        subtotal: null,

        items: receipt.items.map(({ cost, quantity, name, date }) => ({
          quantity,
          cost,
          description: `Birth certificate for ${name} (${moment(date).format(
            'l'
          )})`,
        })),

        belowOrderText: [
          'We have received your order. You will be charged when your certificates ship.',
          'We will contact you if we need more information to fulfill the order. If we contact you but do not hear back within 3 business days we will cancel the order without charge.',
        ],
      },
      `City of Boston Birth Certificate Order #${receipt.orderId}`
    );
  }

  birthShipped(receipt: ReceiptData): RenderedEmail {
    return this.receiptEmailRenderer(
      {
        ...receipt,

        heading: 'Your birth certificate order is on its way!',
        orderDate: formatOrderDate(receipt.orderDate),
        registryEmail: 'birth@boston.gov',
        subtotal: null,

        items: receipt.items.map(({ cost, quantity, name, date }) => ({
          quantity,
          cost,
          description: `Birth certificate for ${name} (${moment(date).format(
            'l'
          )})`,
        })),

        aboveOrderText: [
          'We’ve processed your order and charged your card. Your order is being shipped via U.S. Postal Service to the shipping address you provided.',
        ],
      },
      `City of Boston Birth Certificate Order #${receipt.orderId}`
    );
  }

  birthExpired(orderId: string, orderDate: Date) {
    return this.expiredEmailRenderer(
      {
        orderDate: formatOrderDate(orderDate),
        orderId: orderId,
        registryEmail: 'birth@boston.gov',
      },
      `City of Boston Birth Certificate Order #${orderId}`
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
