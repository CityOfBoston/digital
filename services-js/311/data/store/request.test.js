// @flow

import type { Service } from '../types';
import type { SubmitRequestMutationVariables } from '../graphql/schema.flow';
import SubmitRequestGraphql from '../graphql/SubmitRequest.graphql';

import reducer, {
  DEFAULT_STATE,
  setAttribute,
  setRequestDescription,
  setRequestLastName,
  resetRequestForService,
  submitRequest,
  conditionsApply,
} from './request';
import type { State } from './request';

const COSMIC_SERVICE: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  hasMetadata: true,
  metadata: {
    attributes: [{
      required: false,
      type: 'TEXT',
      code: 'ST-CMTS',
      description: 'Please provide any other relevant information:',
      values: null,
      conditionalValues: null,
    }, {
      required: false,
      type: 'INFORMATIONAL',
      code: 'INFO-NEDRMV1',
      description: '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
      conditionalValues: null,
    }, {
      required: true,
      type: 'SINGLEVALUELIST',
      code: 'SR-AVENG',
      description: 'Which Avengers team do you need?',
      values: [{ key: 'mcu', name: 'Cinematic' }, { key: 'great-lakes', name: 'Great Lakes' }, { key: 'us-avengers', name: 'US Avengers' }],
      conditionalValues: [],
    }, {
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
          conditions: [{ attribute: 'SR-AVENG', op: 'eq', value: 'mcu' }],
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
          conditions: [{ attribute: 'SR-AVENG', op: 'eq', value: 'great-lakes' }],
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
          conditions: [{ attribute: 'SR-AVENG', op: 'eq', value: 'us-avengers' }],
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
    }],
  },
};

const OTHER_SERVICE: Service = {
  name: 'Other Service',
  code: 'other',
  hasMetadata: true,
  metadata: {
    attributes: [{
      required: false,
      type: 'TEXT',
      code: 'ST-CMTS',
      description: 'Please provide any other relevant information:',
      values: null,
      conditionalValues: null,
    }],
  },
};

describe('resetRequestForService', () => {
  it('sets the request code, adds non-informational attributes, and picklist default', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    expect(state.code).toEqual('CSMCINC');
    expect(state.attributeValues['ST-CMTS']).toEqual('');
    expect(state.attributeValues['INFO-NEDRMV1']).toBeUndefined();
    expect(state.attributeValues['SR-AVENG']).toEqual(null);
    expect(state.attributeValues['MR-WHO']).toEqual([]);
  });

  it('sets the calculated attributes', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    const { calculatedAttributes } = state;
    expect(calculatedAttributes.map((a) => a.code)).toEqual(['ST-CMTS', 'INFO-NEDRMV1', 'SR-AVENG', 'MR-WHO']);
    expect((calculatedAttributes.find((a) => a.code === 'MR-WHO') || {}).values).toEqual([{ key: 'anyone', name: 'Anyone' }]);
  });

  it('preserves description and contact information', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, setRequestDescription('Thanos is attacking'));
    state = reducer(state, setRequestLastName('Danvers'));
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    expect(state.description).toEqual('Thanos is attacking');
    expect(state.lastName).toEqual('Danvers');
  });

  it('clears out existing attributes', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    state = reducer(state, setAttribute('ST-CMTS', 'Requesting Alpha Flight'));
    state = reducer(state, resetRequestForService(OTHER_SERVICE));
    expect(state.attributeValues['ST-CMTS']).toEqual('');
    expect(state.attributeValues['SR-AVENG']).toBeUndefined();
  });

  it('does nothing if the code is the same', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    state = reducer(state, setAttribute('ST-CMTS', 'Requesting Alpha Flight'));
    state = reducer(state, setAttribute('SR-AVENG', 'two'));
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    expect(state.attributeValues['ST-CMTS']).toEqual('Requesting Alpha Flight');
    expect(state.attributeValues['SR-AVENG']).toEqual('two');
  });
});

describe('setAttribute', () => {
  it('sets the attribute', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    state = reducer(state, setAttribute('ST-CMTS', 'Requesting Alpha Flight'));
    expect(state.attributeValues['ST-CMTS']).toEqual('Requesting Alpha Flight');
  });

  it('throws if the code doesn’t match an attribute', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    expect(() => {
      reducer(state, setAttribute('UNKNOWN-CODE', 'Requesting Alpha Flight'));
    }).toThrowErrorMatchingSnapshot();
  });

  it('updates calculated values', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    state = reducer(state, setAttribute('SR-AVENG', 'great-lakes'));
    const { calculatedAttributes } = state;
    expect(calculatedAttributes.map((a) => a.code)).toEqual(['ST-CMTS', 'INFO-NEDRMV1', 'SR-AVENG', 'MR-WHO']);
    expect((calculatedAttributes[3].values || []).map((v) => v.key)).toEqual(['anyone', 'flatman', 'big-bertha', 'doorman', 'mr-invincible', 'good-boy']);
  });

  it('preserves checked items', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    state = reducer(state, setAttribute('SR-AVENG', 'great-lakes'));
    state = reducer(state, setAttribute('MR-WHO', ['anyone', 'big-bertha', 'good-boy']));
    state = reducer(state, setAttribute('SR-AVENG', 'us-avengers'));

    const { attributeValues } = state;
    expect(attributeValues['MR-WHO']).toEqual(['anyone', 'big-bertha', 'good-boy']);
  });
});

// Pulling this out as its own test to get good coverage, rather than setting
// up a mock service that handles all cases.
describe('conditionsApply', () => {
  test('single condition equals', () => {
    expect(conditionsApply({ code: 'value' }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'eq', value: 'value' }] })).toEqual(true);
    expect(conditionsApply({ code: 'not-value' }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'eq', value: 'value' }] })).toEqual(false);
  });

  test('single condition not-equals', () => {
    expect(conditionsApply({ code: 'value' }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'neq', value: 'value' }] })).toEqual(false);
    expect(conditionsApply({ code: 'not-value' }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'neq', value: 'value' }] })).toEqual(true);
  });

  test('single condition contains', () => {
    expect(conditionsApply({ code: ['value-1', 'value-2'] }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'eq', value: 'value-2' }] })).toEqual(true);
    expect(conditionsApply({ code: ['value-1', 'value-3'] }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'eq', value: 'value-2' }] })).toEqual(false);
  });

  test('single condition not contains', () => {
    expect(conditionsApply({ code: ['value-1', 'value-2'] }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'neq', value: 'value-2' }] })).toEqual(false);
    expect(conditionsApply({ code: ['value-1', 'value-3'] }, { clause: 'AND', conditions: [{ attribute: 'code', op: 'neq', value: 'value-2' }] })).toEqual(true);
  });

  test('and condition success', () => {
    expect(conditionsApply(
      { code1: 'value-1', code2: 'value-2' },
      {
        clause: 'AND',
        conditions: [
          { attribute: 'code1', op: 'eq', value: 'value-1' },
          { attribute: 'code2', op: 'eq', value: 'value-2' },
        ],
      })).toEqual(true);
  });

  test('and condition failure', () => {
    expect(conditionsApply(
      { code1: 'value-1', code2: 'not-value-2' },
      {
        clause: 'AND',
        conditions: [
          { attribute: 'code1', op: 'eq', value: 'value-1' },
          { attribute: 'code2', op: 'eq', value: 'value-2' },
        ],
      })).toEqual(false);
  });

  test('or condition all true', () => {
    expect(conditionsApply(
      { code1: 'value-1', code2: 'value-2' },
      {
        clause: 'OR',
        conditions: [
          { attribute: 'code1', op: 'eq', value: 'value-1' },
          { attribute: 'code2', op: 'eq', value: 'value-2' },
        ],
      })).toEqual(true);
  });

  test('or condition one true', () => {
    expect(conditionsApply(
      { code1: 'value-1', code2: 'not-value-2' },
      {
        clause: 'OR',
        conditions: [
          { attribute: 'code1', op: 'eq', value: 'value-1' },
          { attribute: 'code2', op: 'eq', value: 'value-2' },
        ],
      })).toEqual(true);
  });

  test('or condition none true', () => {
    expect(conditionsApply(
      { code1: 'not-value-1', code2: 'not-value-2' },
      {
        clause: 'OR',
        conditions: [
          { attribute: 'code1', op: 'eq', value: 'value-1' },
          { attribute: 'code2', op: 'eq', value: 'value-2' },
        ],
      })).toEqual(false);
  });
});

test('submitRequest', async () => {
  const state: State = {
    code: 'CSMCINC',
    description: 'Things are bad',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'marvel@alphaflight.gov',
    phone: '',
    location: null,
    address: '',
    attributeValues: {
      DIMENSIONS: '3',
      AVENGERS: ['ms-marvel', 'thor', 'captain-america', 'howard-the-duck'],
      HIDDEN_ATTRIBUTE: 'This value should not be sent',
    },
    rawAttributes: [],
    calculatedAttributes: [
      { code: 'DIMENSIONS', description: '', required: true, type: 'STRING', values: null },
      { code: 'AVENGERS',
        description: '',
        required: true,
        type: 'MULTIVALUELIST',
        values: [
          { key: 'ms-marvel', name: 'Ms. Marvel' },
          { key: 'thor', name: 'Thor' },
          { key: 'captain-america', name: 'Captain America' },
          { key: 'captain-marvel', name: 'Captain Marvel' },
        ],
      },
    ],
  };

  const loopbackGraphql = jest.fn();

  submitRequest(state, loopbackGraphql);

  const mutationVariables: SubmitRequestMutationVariables = {
    code: 'CSMCINC',
    description: 'Things are bad',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'marvel@alphaflight.gov',
    phone: '',
    address: '',
    location: null,
    // These should be filtered down to the calculated attributes above
    attributes: [
      { code: 'DIMENSIONS', value: '3' },
      { code: 'AVENGERS', value: 'ms-marvel' },
      { code: 'AVENGERS', value: 'thor' },
      { code: 'AVENGERS', value: 'captain-america' },
    ],
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(SubmitRequestGraphql, mutationVariables);
});
