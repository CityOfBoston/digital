import Handlebars from 'handlebars';
import wrap from 'word-wrap';

Handlebars.registerHelper('wrap', function(options) {
  return wrap(options.fn(this as any), {
    width: 60,
    indent: '',
  });
});

// http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44
Handlebars.registerHelper('compare', function(
  lvalue,
  operator,
  rvalue,
  options
) {
  let operators, result;

  if (arguments.length < 3) {
    throw new Error('Handlebars Helper “compare” needs 2 parameters');
  }

  if (options === undefined) {
    options = rvalue;
    rvalue = operator;
    operator = '===';
  }

  operators = {
    '==': function(l, r) {
      return l == r;
    },
    '===': function(l, r) {
      return l === r;
    },
    '!=': function(l, r) {
      return l != r;
    },
    '!==': function(l, r) {
      return l !== r;
    },
    '<': function(l, r) {
      return l < r;
    },
    '>': function(l, r) {
      return l > r;
    },
    '<=': function(l, r) {
      return l <= r;
    },
    '>=': function(l, r) {
      return l >= r;
    },
    typeof: function(l, r) {
      return typeof l == r;
    },
  };

  if (!operators[operator]) {
    throw new Error(
      'Handlebars Helper “compare” doesn’t know the operator ' + operator
    );
  }

  result = operators[operator](lvalue, rvalue);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
