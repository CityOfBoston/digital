import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { PACKAGE_SRC_ROOT } from '../util';

require('./handlebars-helpers');

const readFile = promisify(fs.readFile);

const TEMPLATES_DIR = path.resolve(PACKAGE_SRC_ROOT, `./server/email`);

export interface DeathReceiptData {
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

export type RenderedEmail = {
  text: string;
  html: string;
  subject: string;
};

export interface EmailTemplates {
  deathReceipt(d: DeathReceiptData): RenderedEmail;
}

export async function makeEmailTemplates(): Promise<EmailTemplates> {
  return {
    deathReceipt: await makeEmailRenderer('death-receipt', 'order'),
  };
}

async function makeEmailRenderer<D>(
  templatePrefix: string,
  dataKey: string
): Promise<(d: D) => RenderedEmail> {
  type TemplateFunc = (d: { [k: string]: D }) => string;

  const mjmlTemplateP = readFile(
    path.resolve(TEMPLATES_DIR, `${templatePrefix}.mjml.hbs`),
    'utf-8'
  );

  const textTemplateP = readFile(
    path.resolve(TEMPLATES_DIR, `${templatePrefix}.txt.hbs`),
    'utf-8'
  );

  const subjectTemplateP = readFile(
    path.resolve(TEMPLATES_DIR, `${templatePrefix}.subject.hbs`),
    'utf-8'
  );

  const mjmlFunc: TemplateFunc = Handlebars.compile(await mjmlTemplateP);
  const textFunc: TemplateFunc = Handlebars.compile(await textTemplateP);
  const subjectFunc: TemplateFunc = Handlebars.compile(await subjectTemplateP);

  return (d: D) => ({
    html: mjml2html(mjmlFunc({ [dataKey]: d })).html,
    text: textFunc({ [dataKey]: d }).trim(),
    subject: subjectFunc({ [dataKey]: d }).trim(),
  });
}
