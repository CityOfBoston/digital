// Handlebars helpers are global, so we make a global file so that they're
// shared across all templates;

import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';
import moment from 'moment';
import wrap from 'word-wrap';
import { PACKAGE_SRC_ROOT } from '../util';

const TEMPLATES_DIR = path.resolve(PACKAGE_SRC_ROOT, `./server/email`);

Handlebars.registerPartial(
  'layout',
  fs.readFileSync(path.resolve(TEMPLATES_DIR, 'layout.mjml.hbs'), 'utf-8')
);

Handlebars.registerHelper('formatDate', (date: Date) =>
  moment(date).format('l')
);

Handlebars.registerHelper(
  'formatPercentage',
  (percentage: number) =>
    `${(Math.round(percentage * 10000) / 100).toFixed(2)}%`
);

Handlebars.registerHelper(
  'formatCents',
  (cents: number) => `$${(cents / 100).toFixed(2)}`
);

Handlebars.registerHelper('wrap', function(options) {
  return wrap(options.fn(this as any), {
    width: 60,
    indent: '',
  });
});
