// @flow
/* eslint no-underscore-dangle: 0 */

import type { Service } from '../types';

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

describe('Live Agent', () => {
  const cleanup = () => {
    window.LIVE_AGENT_AVAILABLE = undefined;
    window.liveagent = undefined;
    window._laq = undefined;
  };

  beforeEach(cleanup);
  afterEach(cleanup);

  describe('liveAgentAvailable', () => {
    it('is false if not set on the window', () => {
      expect((new AppStore()).liveAgentAvailable).toBe(false);
    });

    it('is true if already set on the window', () => {
      window.LIVE_AGENT_AVAILABLE = true;
      expect((new AppStore()).liveAgentAvailable).toBe(true);
    });
  });

  describe('liveAgentButtonId', () => {
    it('is returned after setting', () => {
      const store = new AppStore();
      store.liveAgentButtonId = 'buttonId';
      expect(store.liveAgentButtonId).toEqual('buttonId');
    });

    it('registers if liveagent isn’t available', () => {
      const store = new AppStore();
      store.liveAgentButtonId = 'buttonId';
      expect(window._laq).toHaveLength(1);
    });

    it('listens for button availability', () => {
      window.liveagent = {
        addButtonEventHandler: jest.fn(),
      };

      const store = new AppStore();
      store.liveAgentButtonId = 'buttonId';

      expect(window.liveagent.addButtonEventHandler).toHaveBeenCalledWith('buttonId', expect.any(Function));

      const eventHandler = window.liveagent.addButtonEventHandler.mock.calls[0][1];

      eventHandler('BUTTON_AVAILABLE');
      expect(store.liveAgentAvailable).toEqual(true);

      eventHandler('OTHER_EVENT');
      expect(store.liveAgentAvailable).toEqual(true);

      eventHandler('BUTTON_UNAVAILABLE');
      expect(store.liveAgentAvailable).toEqual(false);
    });
  });
});
