// Handlebars helpers are global, so we make a global file so that they're
// shared across all templates;

import Handlebars from 'handlebars';
import moment from 'moment';
import wrap from 'word-wrap';

Handlebars.registerHelper('formatDate', (date: Date) =>
  moment(date).format('l h:mmA')
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
