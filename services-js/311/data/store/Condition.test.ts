import Condition from './Condition';
import Question from './Question';
import {
  ServiceAttributeConditionalOp,
  ServiceAttributeConditionValueType,
  ServiceAttributeDatatype,
} from '../queries/types';

const makeStringValue = string => ({
  type: ServiceAttributeConditionValueType.STRING,
  string,
  array: null,
  number: null,
});
const makeArrayValue = array => ({
  type: 'STRING_ARRAY',
  string: null,
  array,
  number: null,
});
const makeNumberValue = number => ({
  type: 'NUMBER',
  string: null,
  array: null,
  number,
});

const makeCondition = ({ value, op, currentValue }) => {
  let graphQLValue;
  if (typeof value === 'string') {
    graphQLValue = makeStringValue(value);
  } else if (Array.isArray(value)) {
    graphQLValue = makeArrayValue(value);
  } else if (typeof value === 'number') {
    graphQLValue = makeNumberValue(value);
  } else {
    throw new Error(`Unexpected value type: ${value.toString()}`);
  }

  const question = new Question({
    code: 'code',
    type: ServiceAttributeDatatype.INFORMATIONAL,
    required: false,
    description: '',
    dependencies: null,
    values: null,
    conditionalValues: null,
    validations: [],
  });

  question.value = currentValue;

  return new Condition(
    {
      attribute: 'code',
      op,
      value: graphQLValue,
    },
    { code: question }
  );
};

describe('constructor', () => {
  it('throws if the question can’t be found', () => {
    expect(() => {
      new Condition(
        {
          attribute: 'CODE',
          op: ServiceAttributeConditionalOp.eq,
          value: makeStringValue('value'),
        },
        {}
      );
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('eq', () => {
  test('two strings equal is true', () => {
    expect(
      makeCondition({ value: 'value', op: 'eq', currentValue: 'value' }).holds
    ).toEqual(true);
  });

  test('two numbers equal is true', () => {
    expect(
      makeCondition({ value: 1, op: 'eq', currentValue: '1' }).holds
    ).toEqual(true);
  });

  test('two strings not equal is false', () => {
    expect(
      makeCondition({ value: 'value', op: 'eq', currentValue: 'not-value' })
        .holds
    ).toEqual(false);
  });

  test('two numbers not equal is false', () => {
    expect(
      makeCondition({ value: 1, op: 'eq', currentValue: '2' }).holds
    ).toEqual(false);
  });

  test('comparing to not a number is false', () => {
    expect(
      makeCondition({ value: 1, op: 'eq', currentValue: 'not-a-number' }).holds
    ).toEqual(false);
  });

  test('string compared to array is false', () => {
    expect(
      makeCondition({ value: 'value', op: 'eq', currentValue: ['value'] }).holds
    ).toEqual(false);
  });

  test('array compared to string is false', () => {
    expect(
      makeCondition({ value: ['value'], op: 'eq', currentValue: 'value' }).holds
    ).toEqual(false);
  });

  test('subarray compared to array is false', () => {
    expect(
      makeCondition({
        value: ['value-1'],
        op: 'eq',
        currentValue: ['value-1', 'value-2'],
      }).holds
    ).toEqual(false);
  });

  test('arrays in order is true', () => {
    expect(
      makeCondition({
        value: ['value-1', 'value-2'],
        op: 'eq',
        currentValue: ['value-1', 'value-2'],
      }).holds
    ).toEqual(true);
  });

  test('arrays out of order is true', () => {
    expect(
      makeCondition({
        value: ['value-1', 'value-2'],
        op: 'eq',
        currentValue: ['value-2', 'value-1'],
      }).holds
    ).toEqual(true);
  });

  test('compared to null is false', () => {
    expect(
      makeCondition({ value: 'value', op: 'eq', currentValue: null }).holds
    ).toEqual(false);
  });
});

describe('neq', () => {
  test('two strings equal is false', () => {
    expect(
      makeCondition({ value: 'value', op: 'neq', currentValue: 'value' }).holds
    ).toEqual(false);
  });

  test('two not equal strings is true', () => {
    expect(
      makeCondition({ value: 'value', op: 'neq', currentValue: 'not-value' })
        .holds
    ).toEqual(true);
  });

  test('array not equal to a string is true', () => {
    expect(
      makeCondition({ value: 'value', op: 'neq', currentValue: ['value'] })
        .holds
    ).toEqual(true);
  });

  test('subarray compared to array is true', () => {
    expect(
      makeCondition({
        value: ['value-1'],
        op: 'neq',
        currentValue: ['value-1', 'value-2'],
      }).holds
    ).toEqual(true);
  });

  test('arrays in order is false', () => {
    expect(
      makeCondition({
        value: ['value-1', 'value-2'],
        op: 'neq',
        currentValue: ['value-1', 'value-2'],
      }).holds
    ).toEqual(false);
  });

  test('arrays out of order is false', () => {
    expect(
      makeCondition({
        value: ['value-1', 'value-2'],
        op: 'neq',
        currentValue: ['value-2', 'value-1'],
      }).holds
    ).toEqual(false);
  });

  test('compared to null is true', () => {
    expect(
      makeCondition({ value: 'value', op: 'neq', currentValue: null }).holds
    ).toEqual(true);
  });
});

describe('in', () => {
  test('string in array is true', () => {
    expect(
      makeCondition({
        value: 'value-2',
        op: 'in',
        currentValue: ['value-1', 'value-2'],
      }).holds
    ).toEqual(true);
  });

  test('string not in array is false', () => {
    expect(
      makeCondition({
        value: 'value-3',
        op: 'in',
        currentValue: ['value-1', 'value-2'],
      }).holds
    ).toEqual(false);
  });

  test('array in array is false', () => {
    expect(
      makeCondition({
        value: ['value-2'],
        op: 'in',
        currentValue: ['value-1', 'value-2'],
      }).holds
    ).toEqual(false);
  });

  test('string in string is false', () => {
    expect(
      makeCondition({ value: 'value', op: 'in', currentValue: 'value' }).holds
    ).toEqual(false);
  });

  test('number in array is true', () => {
    expect(
      makeCondition({ value: 1, op: 'in', currentValue: ['1', '2'] }).holds
    ).toEqual(true);
  });

  test('string in null is false', () => {
    expect(
      makeCondition({ value: 'value', op: 'in', currentValue: null }).holds
    ).toEqual(false);
  });
});

describe('gt', () => {
  test('current value greater than condition is true', () => {
    expect(
      makeCondition({ value: 1, op: 'gt', currentValue: '100' }).holds
    ).toEqual(true);
  });

  test('current value not greater than condition is false', () => {
    expect(
      makeCondition({ value: 100, op: 'gt', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('string is always false', () => {
    expect(
      makeCondition({ value: '100', op: 'gt', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('greater than null is false', () => {
    expect(
      makeCondition({ value: 1, op: 'gt', currentValue: null }).holds
    ).toEqual(false);
  });
});

describe('gte', () => {
  test('current value greater than condition is true', () => {
    expect(
      makeCondition({ value: 1, op: 'gte', currentValue: '100' }).holds
    ).toEqual(true);
  });

  test('current value equal is true', () => {
    expect(
      makeCondition({ value: 100, op: 'gte', currentValue: '100' }).holds
    ).toEqual(true);
  });

  test('current value not greater than condition is false', () => {
    expect(
      makeCondition({ value: 200, op: 'gte', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('string is always false', () => {
    expect(
      makeCondition({ value: '1', op: 'gte', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('greater than or equal to null is false', () => {
    expect(
      makeCondition({ value: 1, op: 'gte', currentValue: null }).holds
    ).toEqual(false);
  });
});

describe('lt', () => {
  test('current value less than condition is true', () => {
    expect(
      makeCondition({ value: 101, op: 'lt', currentValue: '100' }).holds
    ).toEqual(true);
  });

  test('current value not less than condition is false', () => {
    expect(
      makeCondition({ value: 1, op: 'lt', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('string is always false', () => {
    expect(
      makeCondition({ value: '1000', op: 'lt', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('less than null is false', () => {
    expect(
      makeCondition({ value: 1, op: 'lt', currentValue: null }).holds
    ).toEqual(false);
  });
});

describe('lte', () => {
  test('current value less than condition is true', () => {
    expect(
      makeCondition({ value: 101, op: 'lte', currentValue: '100' }).holds
    ).toEqual(true);
  });

  test('current value equal is true', () => {
    expect(
      makeCondition({ value: 100, op: 'lte', currentValue: '100' }).holds
    ).toEqual(true);
  });

  test('current value not less than condition is false', () => {
    expect(
      makeCondition({ value: 1, op: 'lte', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('string is always false', () => {
    expect(
      makeCondition({ value: '1000', op: 'lte', currentValue: '100' }).holds
    ).toEqual(false);
  });

  test('less than or equal to null is false', () => {
    expect(
      makeCondition({ value: 1, op: 'lte', currentValue: null }).holds
    ).toEqual(false);
  });
});
