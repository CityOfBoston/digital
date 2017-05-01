// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../data/store';
import type { Request } from '../../data/types';
import { makeServerContext } from '../../lib/test/make-context';

import SearchLayout from './SearchLayout';

export const MOCK_REQUEST: Request = {
  id: '17-000000001',
  service: {
    name: 'Cosmic Intervention',
  },
  description: 'I think that Thanos is here',
  status: 'open',
  address: 'City Hall Plaza, Boston, MA 02131',
  requestedAtString: 'March 7, 2017, 12:59 PM',
  updatedAtString: 'April 8, 2017, 12:59 PM',
};

describe('search form', () => {
  let data;

  beforeEach(async () => {
    const ctx = makeServerContext('/lookup', { q: 'Alpha Flight' });
    data = (await SearchLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    expect(data.view).toEqual('search');
    expect(data.query).toEqual('Alpha Flight');
  });

  test('rendering', () => {
    const component = renderer.create(
      <SearchLayout store={new AppStore()} data={data} />,
      {
        createNodeMock: () => document.createElement('div'),
      },
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
