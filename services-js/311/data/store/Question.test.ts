import { ServiceAttribute } from '../types';
import Question from './Question';
import {
  ServiceAttributeDatatype,
  ServiceAttributeConditionalClause,
  ServiceAttributeConditionalOp,
  ServiceAttributeConditionValueType,
} from '../queries/types';

const TEXT_FIELD: ServiceAttribute = {
  required: false,
  type: ServiceAttributeDatatype.TEXT,
  code: 'ST-CMTS',
  description: 'Please provide any other relevant information:',
  values: null,
  conditionalValues: null,
  dependencies: null,
  validations: [],
};

const SIMPLE_LIST: ServiceAttribute = {
  required: true,
  type: ServiceAttributeDatatype.SINGLEVALUELIST,
  code: 'SR-AVENG',
  description: 'Which Avengers team do you need?',
  values: [
    { key: 'mcu', name: 'Cinematic' },
    { key: 'great-lakes', name: 'Great Lakes' },
    { key: 'us-avengers', name: 'US Avengers' },
  ],
  conditionalValues: [],
  dependencies: null,
  validations: [],
};

const DEPENDENT_VALUES_LIST: ServiceAttribute = {
  required: false,
  type: ServiceAttributeDatatype.MULTIVALUELIST,
  code: 'MR-WHO',
  description: 'Who would you like?',
  values: [{ key: 'anyone', name: 'Anyone' }],
  validations: [],
  conditionalValues: [
    {
      dependentOn: {
        clause: ServiceAttributeConditionalClause.AND,
        conditions: [
          {
            attribute: 'SR-AVENG',
            op: ServiceAttributeConditionalOp.eq,
            value: {
              type: ServiceAttributeConditionValueType.STRING,
              string: 'mcu',
              array: null,
              number: null,
            },
          },
        ],
      },
      values: [
        { key: 'iron-man', name: 'Iron Man' },
        { key: 'thor', name: 'Thor' },
        { key: 'hulk', name: 'Hulk' },
        { key: 'black-widow', name: 'Black Widow' },
        { key: 'captain-america', name: 'Captain America' },
        { key: 'hawkeye', name: 'Hawkeye' },
      ],
    },
    {
      dependentOn: {
        clause: ServiceAttributeConditionalClause.AND,
        conditions: [
          {
            attribute: 'SR-AVENG',
            op: ServiceAttributeConditionalOp.eq,
            value: {
              type: ServiceAttributeConditionValueType.STRING,
              string: 'great-lakes',
              array: null,
              number: null,
            },
          },
        ],
      },
      values: [
        { key: 'flatman', name: 'Flatman' },
        { key: 'big-bertha', name: 'Big Bertha' },
        { key: 'doorman', name: 'Doorman' },
        { key: 'mr-invincible', name: 'Mr. Invincible' },
        { key: 'good-boy', name: 'Good Boy' },
      ],
    },
    {
      dependentOn: {
        clause: ServiceAttributeConditionalClause.AND,
        conditions: [
          {
            attribute: 'SR-AVENG',
            op: ServiceAttributeConditionalOp.eq,
            value: {
              type: ServiceAttributeConditionValueType.STRING,
              string: 'us-avengers',
              array: null,
              number: null,
            },
          },
        ],
      },
      values: [
        { key: 'citizen-v', name: 'Citizen V' },
        { key: 'red-hulk', name: 'Red Hulk' },
        { key: 'squirrel-girl', name: 'Squirrel Girl' },
        { key: 'cannonball', name: 'Cannonball' },
        { key: 'iron-patriot', name: 'Iron Patriot' },
        { key: 'enigma', name: 'Enigma' },
      ],
    },
  ],
  dependencies: null,
};

const DEPENDENT_TEXT: ServiceAttribute = {
  required: true,
  type: ServiceAttributeDatatype.STRING,
  code: 'SR-CAP',
  description: 'Which Captain America are you looking for?',
  validations: [],
  dependencies: {
    clause: ServiceAttributeConditionalClause.AND,
    conditions: [
      {
        attribute: 'MR-WHO',
        op: ServiceAttributeConditionalOp.in,
        value: {
          type: ServiceAttributeConditionValueType.STRING,
          string: 'captain-america',
          array: null,
          number: null,
        },
      },
    ],
  },
  values: null,
  conditionalValues: null,
};

const ERROR_VALIDATION: ServiceAttribute = {
  required: true,
  type: ServiceAttributeDatatype.NUMBER,
  code: 'INT-AVG',
  description: 'How many Avengers do you need?',
  validations: [
    {
      dependentOn: {
        clause: ServiceAttributeConditionalClause.OR,
        conditions: [
          {
            attribute: 'INT-AVG',
            op: ServiceAttributeConditionalOp.gt,
            value: {
              type: ServiceAttributeConditionValueType.NUMBER,
              string: null,
              array: null,
              number: 0,
            },
          },
        ],
      },
      message: 'Must have at least 1 Avenger',
      reportOnly: false,
    },
  ],
  dependencies: null,
  values: null,
  conditionalValues: null,
};

const REPORT_VALIDATION: ServiceAttribute = {
  required: true,
  type: ServiceAttributeDatatype.NUMBER,
  code: 'INT-FF',
  description: 'How many Fantastic Four do you need?',
  validations: [
    {
      dependentOn: {
        clause: ServiceAttributeConditionalClause.OR,
        conditions: [
          {
            attribute: 'INT-FF',
            op: ServiceAttributeConditionalOp.gt,
            value: {
              type: ServiceAttributeConditionValueType.NUMBER,
              string: null,
              array: null,
              number: 0,
            },
          },
        ],
      },
      message: 'Must have at least 1 member',
      reportOnly: false,
    },
    {
      dependentOn: {
        clause: ServiceAttributeConditionalClause.OR,
        conditions: [
          {
            attribute: 'INT-FF',
            op: ServiceAttributeConditionalOp.lte,
            value: {
              type: ServiceAttributeConditionValueType.NUMBER,
              string: null,
              array: null,
              number: 4,
            },
          },
        ],
      },
      message: 'Beyond 4 Fantastic Four we will need to dig into some AUs',
      reportOnly: true,
    },
  ],
  dependencies: null,
  values: null,
  conditionalValues: null,
};

let textFieldQuestion: Question;
let simpleListQuestion: Question;
let dependentValuesQuestion: Question;
let dependentTextQuestion: Question;
let errorValidationQuestion: Question;
let reportValidationQuestion: Question;

beforeEach(() => {
  const questionsMap = {};

  textFieldQuestion = new Question(TEXT_FIELD, questionsMap);
  questionsMap[textFieldQuestion.code] = textFieldQuestion;

  simpleListQuestion = new Question(SIMPLE_LIST, questionsMap);
  questionsMap[simpleListQuestion.code] = simpleListQuestion;

  dependentValuesQuestion = new Question(DEPENDENT_VALUES_LIST, questionsMap);
  questionsMap[dependentValuesQuestion.code] = dependentValuesQuestion;

  dependentTextQuestion = new Question(DEPENDENT_TEXT, questionsMap);
  questionsMap[dependentTextQuestion.code] = dependentTextQuestion;

  errorValidationQuestion = new Question(ERROR_VALIDATION, questionsMap);
  questionsMap[errorValidationQuestion.code] = errorValidationQuestion;

  reportValidationQuestion = new Question(REPORT_VALIDATION, questionsMap);
  questionsMap[reportValidationQuestion.code] = reportValidationQuestion;
});

describe('valueOptions', () => {
  test('no values returns null', () => {
    expect(textFieldQuestion.valueOptions).toEqual(null);
  });

  test('non-conditional values appear', () => {
    expect(simpleListQuestion.valueOptions).toEqual(SIMPLE_LIST.values);
  });

  test('conditional values are static when other question is not answered', () => {
    expect(
      (dependentValuesQuestion.valueOptions || []).map(({ key }) => key)
    ).toEqual(['anyone']);
  });

  test('adds in conditional values', () => {
    simpleListQuestion.value = 'great-lakes';
    expect(
      (dependentValuesQuestion.valueOptions || []).map(({ key }) => key)
    ).toEqual([
      'anyone',
      'flatman',
      'big-bertha',
      'doorman',
      'mr-invincible',
      'good-boy',
    ]);
  });
});

describe('visible', () => {
  it('is true for questions without dependencies', () => {
    expect(textFieldQuestion.visible).toEqual(true);
  });

  it('is false when dependency not set', () => {
    expect(dependentTextQuestion.visible).toEqual(false);
  });

  it('is true when dependency is set', () => {
    simpleListQuestion.value = 'mcu';
    dependentValuesQuestion.value = ['captain-america'];
    expect(dependentTextQuestion.visible).toEqual(true);
  });

  it('is false when dependency’s value is invalid', () => {
    simpleListQuestion.value = 'great-lakes';
    dependentValuesQuestion.value = ['captain-america'];
    expect(dependentTextQuestion.visible).toEqual(false);
  });
});

describe('safeValue', () => {
  it('returns the value when no valueOptions are set', () => {
    textFieldQuestion.value = 'Everything’s ok';
    expect(textFieldQuestion.safeValue).toEqual('Everything’s ok');
  });

  it('returns a raw array, not an observable, so isArray works', () => {
    textFieldQuestion.value = ['chipmunk-hunk', 'koi-boi'];
    expect(Array.isArray(textFieldQuestion.safeValue)).toEqual(true);
  });

  it('preserves the value if it’s in valueOptions', () => {
    simpleListQuestion.value = 'us-avengers';
    expect(simpleListQuestion.safeValue).toEqual('us-avengers');
  });

  it('returns null if the value’s not in valueOptions', () => {
    simpleListQuestion.value = 'uncanny-avengers';
    expect(simpleListQuestion.safeValue).toEqual(null);
  });

  it('returns values valid by the dependency', () => {
    simpleListQuestion.value = 'great-lakes';
    dependentValuesQuestion.value = ['anyone', 'good-boy', 'big-bertha'];
    expect(dependentValuesQuestion.safeValue).toEqual([
      'anyone',
      'good-boy',
      'big-bertha',
    ]);
  });

  it('filters down to allowed values when dependency is different', () => {
    simpleListQuestion.value = 'mcu';
    dependentValuesQuestion.value = [
      'anyone',
      'good-boy',
      'big-bertha',
      'thor',
    ];
    expect(dependentValuesQuestion.safeValue).toEqual(['anyone', 'thor']);
  });

  it('returns null for not visible questions', () => {
    dependentTextQuestion.value = 'Danielle Cage';
    expect(dependentTextQuestion.safeValue).toEqual(null);
  });
});

describe('requirementsMet', () => {
  describe('no specified values', () => {
    it('is false if there’s no value', () => {
      expect(textFieldQuestion.requirementsMet).toEqual(false);
    });

    it('is true if there’s a value', () => {
      textFieldQuestion.value = 'value';
      expect(textFieldQuestion.requirementsMet).toEqual(true);
    });
  });

  describe('multivalue', () => {
    it('is false if none are checked', () => {
      textFieldQuestion.value = [];
      expect(textFieldQuestion.requirementsMet).toEqual(false);
    });

    it('is true if one is checked', () => {
      textFieldQuestion.value = ['value'];
      expect(textFieldQuestion.requirementsMet).toEqual(true);
    });
  });

  describe('with validations', () => {
    it('is false if the question fails the validation', () => {
      errorValidationQuestion.value = '0';
      expect(errorValidationQuestion.requirementsMet).toBe(false);
    });

    it('is true if the question meets the validations', () => {
      errorValidationQuestion.value = '4';
      expect(errorValidationQuestion.requirementsMet).toBe(true);
    });

    it('is true if the question fails a report-only validation', () => {
      reportValidationQuestion.value = '8';
      expect(reportValidationQuestion.requirementsMet).toBe(true);
    });
  });
});

describe('failing validations', () => {
  it('is empty for no validations', () => {
    expect(textFieldQuestion.failingValidations).toEqual([]);
  });

  it('returns failing validations when failing', () => {
    errorValidationQuestion.value = '0';
    expect(errorValidationQuestion.failingValidations.length).toEqual(1);
  });

  it('returns no validations when successful', () => {
    errorValidationQuestion.value = '3';
    expect(errorValidationQuestion.failingValidations).toEqual([]);
  });

  it('reportOnly validations are returned', () => {
    reportValidationQuestion.value = '8';
    expect(reportValidationQuestion.failingValidations.length).toEqual(1);
  });
});
