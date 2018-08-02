import fs from 'fs';

const RECEIPT_MJML_TEMPLATE = fs.readFileSync(
  'server/email/receipt.mjml.hbs',
  'utf-8'
);

const RECEIPT_TEXT_TEMPLATE = fs.readFileSync(
  'server/email/receipt.txt.hbs',
  'utf-8'
);

import Handlebars from 'handlebars';
import mjml2html from 'mjml';

require('./handlebars-helpers');

export interface TemplateData {
  // already-formatted date
  orderDate: string;
  orderId: string;
  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  // all these costs are in cents, matching Stripe
  subtotal: number;
  serviceFee: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    id: string;
    cost: number;
  }>;
  fixedFee: number;
  percentageFee: number;
  serviceFeeUri: string;
}

export default class ReceiptEmail {
  handlebarsHtmlTemplate: any;
  handlebarsTextTemplate: any;

  constructor() {
    this.handlebarsHtmlTemplate = Handlebars.compile(RECEIPT_MJML_TEMPLATE);
    this.handlebarsTextTemplate = Handlebars.compile(RECEIPT_TEXT_TEMPLATE);
  }

  renderHtmlBody(order: TemplateData): string {
    const mjmlTemplate = this.handlebarsHtmlTemplate({ order });
    return mjml2html(mjmlTemplate).html;
  }

  renderTextBody(order: TemplateData): string {
    return this.handlebarsTextTemplate({ order });
  }
}
