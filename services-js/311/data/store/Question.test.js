// @flow

import Question from './Question';

const TEXT_FIELD = {
  required: false,
  type: 'TEXT',
  code: 'ST-CMTS',
  description: 'Please provide any other relevant information:',
  values: null,
  conditionalValues: null,
  dependencies: null,
};

const SIMPLE_LIST = {
  required: true,
  type: 'SINGLEVALUELIST',
  code: 'SR-AVENG',
  description: 'Which Avengers team do you need?',
  values: [{ key: 'mcu', name: 'Cinematic' }, { key: 'great-lakes', name: 'Great Lakes' }, { key: 'us-avengers', name: 'US Avengers' }],
  conditionalValues: [],
  dependencies: null,
};

const DEPENDENT_VALUES_LIST = {
  required: false,
  type: 'MULTIVALUELIST',
  code: 'MR-WHO',
  description: 'Who would you like?',
  values: [
      { key: 'anyone', name: 'Anyone' },
  ],
  conditionalValues: [{
    dependentOn: {
      clause: 'AND',
      conditions: [{ attribute: 'SR-AVENG', op: 'eq', value: { type: 'STRING', string: 'mcu', array: null, number: null } }],
    },
    values: [
        { key: 'iron-man', name: 'Iron Man' },
        { key: 'thor', name: 'Thor' },
        { key: 'hulk', name: 'Hulk' },
        { key: 'black-widow', name: 'Black Widow' },
        { key: 'captain-america', name: 'Captain America' },
        { key: 'hawkeye', name: 'Hawkeye' },
    ],
  }, {
    dependentOn: {
      clause: 'AND',
      conditions: [{ attribute: 'SR-AVENG', op: 'eq', value: { type: 'STRING', string: 'great-lakes', array: null, number: null } }],
    },
    values: [
        { key: 'flatman', name: 'Flatman' },
        { key: 'big-bertha', name: 'Big Bertha' },
        { key: 'doorman', name: 'Doorman' },
        { key: 'mr-invincible', name: 'Mr. Invincible' },
        { key: 'good-boy', name: 'Good Boy' },
    ],
  }, {
    dependentOn: {
      clause: 'AND',
      conditions: [{ attribute: 'SR-AVENG', op: 'eq', value: { type: 'STRING', string: 'us-avengers', array: null, number: null } }],
    },
    values: [
        { key: 'citizen-v', name: 'Citizen V' },
        { key: 'red-hulk', name: 'Red Hulk' },
        { key: 'squirrel-girl', name: 'Squirrel Girl' },
        { key: 'cannonball', name: 'Cannonball' },
        { key: 'iron-patriot', name: 'Iron Patriot' },
        { key: 'enigma', name: 'Enigma' },
    ],
  }],
  dependencies: null,
};

const DEPENDENT_TEXT = {
  required: true,
  type: 'STRING',
  code: 'SR-CAP',
  description: 'Which Captain America are you looking for?',
  dependencies: {
    clause: 'AND',
    conditions: [{ attribute: 'MR-WHO', op: 'in', value: { type: 'STRING', string: 'captain-america', array: null, number: null } }],
  },
  values: null,
  conditionalValues: null,

};

let textFieldQuestion;
let simpleListQuestion;
let dependentValuesQuestion;
let dependentTextQuestion;

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
});

describe('valueOptions', () => {
  test('no values returns null', () => {
    expect(textFieldQuestion.valueOptions).toEqual(null);
  });

  test('non-conditional values appear', () => {
    expect(simpleListQuestion.valueOptions).toEqual(SIMPLE_LIST.values);
  });

  test('conditional values are static when other question is not answered', () => {
    expect(dependentValuesQuestion.valueOptions.map(({ key }) => key)).toEqual(['anyone']);
  });

  test('adds in conditional values', () => {
    simpleListQuestion.value = 'great-lakes';
    expect(dependentValuesQuestion.valueOptions.map(({ key }) => key)).toEqual(['anyone', 'flatman', 'big-bertha', 'doorman', 'mr-invincible', 'good-boy']);
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

describe('validatedValue', () => {
  it('returns the value when no valueOptions are set', () => {
    textFieldQuestion.value = 'Everything’s ok';
    expect(textFieldQuestion.validatedValue).toEqual('Everything’s ok');
  });

  it('returns a raw array, not an observable, so isArray works', () => {
    textFieldQuestion.value = ['chipmunk-hunk', 'koi-boi'];
    expect(Array.isArray(textFieldQuestion.validatedValue)).toEqual(true);
  });

  it('preserves the value if it’s in valueOptions', () => {
    simpleListQuestion.value = 'us-avengers';
    expect(simpleListQuestion.validatedValue).toEqual('us-avengers');
  });

  it('returns null if the value’s not in valueOptions', () => {
    simpleListQuestion.value = 'uncanny-avengers';
    expect(simpleListQuestion.validatedValue).toEqual(null);
  });

  it('returns values valid by the dependency', () => {
    simpleListQuestion.value = 'great-lakes';
    dependentValuesQuestion.value = ['anyone', 'good-boy', 'big-bertha'];
    expect(dependentValuesQuestion.validatedValue).toEqual(['anyone', 'good-boy', 'big-bertha']);
  });

  it('filters down to allowed values when dependency is different', () => {
    simpleListQuestion.value = 'mcu';
    dependentValuesQuestion.value = ['anyone', 'good-boy', 'big-bertha', 'thor'];
    expect(dependentValuesQuestion.validatedValue).toEqual(['anyone', 'thor']);
  });

  it('returns null for not visible questions', () => {
    dependentTextQuestion.value = 'Danielle Cage';
    expect(dependentTextQuestion.validatedValue).toEqual(null);
  });
});
