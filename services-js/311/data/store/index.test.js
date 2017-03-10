// @flow

import type { Service } from '../types';
import type { SubmitRequestMutationVariables } from '../graphql/schema.flow';
import SubmitRequestGraphql from '../graphql/SubmitRequest.graphql';

import inBrowser from '../../lib/test/in-browser';
import getStore, { AppStore } from '.';

const COSMIC_SERVICE: Service = {
  name: 'Cosmic Incursion',
  code: 'CSMCINC',
  contactRequired: true,
  locationRequired: true,
  attributes: [{
    required: false,
    type: 'TEXT',
    code: 'ST-CMTS',
    description: 'Please provide any other relevant information:',
    values: null,
    conditionalValues: null,
    dependencies: null,
  }, {
    required: false,
    type: 'INFORMATIONAL',
    code: 'INFO-NEDRMV1',
    description: '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
    values: null,
    conditionalValues: null,
    dependencies: null,
  }, {
    required: true,
    type: 'SINGLEVALUELIST',
    code: 'SR-AVENG',
    description: 'Which Avengers team do you need?',
    values: [{ key: 'mcu', name: 'Cinematic' }, { key: 'great-lakes', name: 'Great Lakes' }, { key: 'us-avengers', name: 'US Avengers' }],
    conditionalValues: [],
    dependencies: null,
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
  }, {
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
  }],
};

describe('getStore', () => {
  it('returns the same instance twice in browser', async () => {
    await inBrowser(() => {
      const store = getStore();
      expect(getStore()).toBe(store);
    });
  });

  it('returns different instances on the server', () => {
    const store = getStore();
    expect(getStore()).not.toBe(store);
  });
});

describe('questionRequirementsMet', () => {
  let store;

  beforeEach(() => {
    store = new AppStore();
  });

  it('is true when there are no questions', () => {
    expect(store.questionRequirementsMet).toEqual(true);
  });

  it('is false if required questions don’t have values', () => {
    store.currentService = COSMIC_SERVICE;
    expect(store.questionRequirementsMet).toEqual(false);
  });

  it('is true if required questions have valid values', () => {
    store.currentService = COSMIC_SERVICE;

    const avengersQuestion = store.questions.find(({ code }) => code === 'SR-AVENG');
    if (!avengersQuestion) {
      throw new Error('missing');
    }

    avengersQuestion.value = 'great-lakes';

    expect(store.questionRequirementsMet).toEqual(true);
  });

  it('is false if required questions have invalid values', () => {
    store.currentService = COSMIC_SERVICE;

    const avengersQuestion = store.questions.find(({ code }) => code === 'SR-AVENG');
    if (!avengersQuestion) {
      throw new Error('missing');
    }

    avengersQuestion.value = 'fantastic-four';

    expect(store.questionRequirementsMet).toEqual(false);
  });

  test('visibility of required question', () => {
    store.currentService = COSMIC_SERVICE;

    const avengersQuestion = store.questions.find(({ code }) => code === 'SR-AVENG');
    if (!avengersQuestion) {
      throw new Error('missing');
    }

    const whoQuestion = store.questions.find(({ code }) => code === 'MR-WHO');
    if (!whoQuestion) {
      throw new Error('missing');
    }

    const capQuestion = store.questions.find(({ code }) => code === 'SR-CAP');
    if (!capQuestion) {
      throw new Error('missing');
    }

    expect(store.questionRequirementsMet).toEqual(false);

    avengersQuestion.value = 'mcu';
    expect(store.questionRequirementsMet).toEqual(true);

    whoQuestion.value = ['captain-america'];
    expect(store.questionRequirementsMet).toEqual(false);

    capQuestion.value = 'Danielle Cage';
    expect(store.questionRequirementsMet).toEqual(true);
  });
});

test('submitRequest', async () => {
  const store = new AppStore();
  store.currentService = COSMIC_SERVICE;

  store.description = 'Things are bad';
  store.contactInfo.firstName = 'Carol';
  store.contactInfo.lastName = 'Danvers';
  store.contactInfo.email = 'marvel@alphaflight.gov';

  store.questions[0].value = 'Thanos is here';
  store.questions[2].value = 'us-avengers';
  // This should get filtered to Squrrel Girl and Enigma
  store.questions[3].value = ['thor', 'squirrel-girl', 'enigma'];
  // This should not appear at all because Captain America is not picked
  store.questions[4].value = 'Danielle Cage';

  const loopbackGraphql = jest.fn();

  store.submitRequest(loopbackGraphql);

  const mutationVariables: SubmitRequestMutationVariables = {
    code: 'CSMCINC',
    description: 'Things are bad',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'marvel@alphaflight.gov',
    phone: '',
    address: '',
    location: null,
    attributes: [
      { code: 'ST-CMTS', value: 'Thanos is here' },
      { code: 'SR-AVENG', value: 'us-avengers' },
      { code: 'MR-WHO', value: 'squirrel-girl' },
      { code: 'MR-WHO', value: 'enigma' },
    ],
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(SubmitRequestGraphql, mutationVariables);
});
