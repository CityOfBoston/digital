// @flow

import RECEIPT_MJML_TEMPLATE from './receipt.mjml.hbs';
import RECEIPT_TEXT_TEMPLATE from './receipt.txt.hbs';

import Handlebars from 'handlebars';
import mjml2html from 'mjml';

require('./handlebars-helpers');

export type TemplateData = {
  orderDate: Date,
  orderId: string,
  shippingName: string,
  shippingCompanyName: string,
  shippingAddress1: string,
  shippingAddress2: string,
  shippingCity: string,
  shippingState: string,
  shippingZip: string,
  subtotal: number,
  serviceFee: number,
  total: number,
  items: Array<{
    name: string,
    quantity: number,
    id: string,
    cost: number,
  }>,
  fixedFee: number,
  percentageFee: number,
  serviceFeeUri: string,
};

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
