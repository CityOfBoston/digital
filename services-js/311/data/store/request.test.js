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
    }, {
      required: false,
      type: 'INFORMATIONAL',
      code: 'INFO-NEDRMV1',
      description: '**All cosmic incursion cases should be followed up with a phone call to Alpha Flight.**',
      values: null,
    }, {
      required: true,
      type: 'SINGLEVALUELIST',
      code: 'SR-NEDRMV1',
      description: 'How many dimensions were breached?',
      values: [{ key: 'one', name: 'One' }, { key: 'two', name: 'Two' }, { key: 'three', name: 'Three' }, { key: 'more-than-three', name: 'More than Three' }],
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
    }],
  },
};

describe('resetRequestForService', () => {
  it('sets the request code, adds non-informational attributes, and picklist default', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    expect(state.code).toEqual('CSMCINC');
    expect(state.attributes['ST-CMTS']).toEqual('');
    expect(state.attributes['INFO-NEDRMV1']).toBeUndefined();
    expect(state.attributes['SR-NEDRMV1']).toEqual('one');
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
    expect(state.attributes['ST-CMTS']).toEqual('');
    expect(state.attributes['SR-NEDRMV1']).toBeUndefined();
  });

  it('does nothing if the code is the same', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    state = reducer(state, setAttribute('ST-CMTS', 'Requesting Alpha Flight'));
    state = reducer(state, setAttribute('SR-NEDRMV1', 'two'));
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    expect(state.attributes['ST-CMTS']).toEqual('Requesting Alpha Flight');
    expect(state.attributes['SR-NEDRMV1']).toEqual('two');
  });
});

describe('setAttribute', () => {
  it('sets the attribute', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    state = reducer(state, setAttribute('ST-CMTS', 'Requesting Alpha Flight'));
    expect(state.attributes['ST-CMTS']).toEqual('Requesting Alpha Flight');
  });

  it('throws if the code doesn’t match an attribute', () => {
    let state = DEFAULT_STATE;
    state = reducer(state, resetRequestForService(COSMIC_SERVICE));
    expect(() => {
      reducer(state, setAttribute('UNKNOWN-CODE', 'Requesting Alpha Flight'));
    }).toThrowErrorMatchingSnapshot();
  });
});

test('submitRquest', async () => {
  const state: State = {
    code: 'CSMCINC',
    description: 'Things are bad',
    firstName: 'Carol',
    lastName: 'Danvers',
    email: 'marvel@alphaflight.gov',
    phone: '',
    location: null,
    address: '',
    attributes: {
      DIMENSIONS: '3',
      AVENGERS: ['ms-marvel', 'thor', 'captain-america'],
    },
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
    attributes: [
      { code: 'DIMENSIONS', value: '3' },
      { code: 'AVENGERS', value: 'ms-marvel' },
      { code: 'AVENGERS', value: 'thor' },
      { code: 'AVENGERS', value: 'captain-america' },
    ],
  };

  expect(loopbackGraphql).toHaveBeenCalledWith(SubmitRequestGraphql, mutationVariables);
});
