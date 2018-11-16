import Question from './Question';
import ConditionGroup from './ConditionGroup';
import {
  ServiceAttributeConditionalClause,
  ServiceAttributeConditionalOp,
  ServiceAttributeConditionValueType,
  ServiceAttributeDatatype,
} from '../queries/types';

const makeString = string => ({
  type: ServiceAttributeConditionValueType.STRING,
  string,
  array: null,
  number: null,
});

describe('holds', () => {
  let question1;
  let question2;
  let questionMap;

  beforeEach(() => {
    question1 = new Question({
      code: 'question-1',
      type: ServiceAttributeDatatype.INFORMATIONAL,
      required: false,
      description: '',
      dependencies: null,
      values: null,
      conditionalValues: null,
      validations: [],
    });

    question2 = new Question({
      code: 'question-1',
      type: ServiceAttributeDatatype.INFORMATIONAL,
      required: false,
      description: '',
      dependencies: null,
      values: null,
      conditionalValues: null,
      validations: [],
    });

    questionMap = {
      'question-1': question1,
      'question-2': question2,
    };
  });

  test('and condition success', () => {
    question1.value = 'value-1';
    question2.value = 'value-2';

    expect(
      new ConditionGroup(
        {
          clause: ServiceAttributeConditionalClause.AND,
          conditions: [
            {
              attribute: 'question-1',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-1'),
            },
            {
              attribute: 'question-2',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-2'),
            },
          ],
        },
        questionMap
      ).holds
    ).toEqual(true);
  });

  test('and condition failure', () => {
    question1.value = 'value-1';
    question2.value = 'not-value-2';

    expect(
      new ConditionGroup(
        {
          clause: ServiceAttributeConditionalClause.AND,
          conditions: [
            {
              attribute: 'question-1',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-1'),
            },
            {
              attribute: 'question-2',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-2'),
            },
          ],
        },
        questionMap
      ).holds
    ).toEqual(false);
  });

  test('or condition all true', () => {
    question1.value = 'value-1';
    question2.value = 'value-2';

    expect(
      new ConditionGroup(
        {
          clause: ServiceAttributeConditionalClause.OR,
          conditions: [
            {
              attribute: 'question-1',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-1'),
            },
            {
              attribute: 'question-2',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-2'),
            },
          ],
        },
        questionMap
      ).holds
    ).toEqual(true);
  });

  test('or condition one true', () => {
    question1.value = 'value-1';
    question2.value = 'not-value-2';

    expect(
      new ConditionGroup(
        {
          clause: ServiceAttributeConditionalClause.OR,
          conditions: [
            {
              attribute: 'question-1',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-1'),
            },
            {
              attribute: 'question-2',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-2'),
            },
          ],
        },
        questionMap
      ).holds
    ).toEqual(true);
  });

  test('or condition none true', () => {
    question1.value = 'not-value-1';
    question2.value = 'not-value-2';

    expect(
      new ConditionGroup(
        {
          clause: ServiceAttributeConditionalClause.OR,
          conditions: [
            {
              attribute: 'question-1',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-1'),
            },
            {
              attribute: 'question-2',
              op: ServiceAttributeConditionalOp.eq,
              value: makeString('value-2'),
            },
          ],
        },
        questionMap
      ).holds
    ).toEqual(false);
  });
});
