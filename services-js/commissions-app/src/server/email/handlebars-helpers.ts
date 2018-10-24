import Handlebars from 'handlebars';
import wrap from 'word-wrap';

Handlebars.registerHelper('wrap', function(options) {
  return wrap(options.fn(this as any), {
    width: 60,
    indent: '',
  });
});
