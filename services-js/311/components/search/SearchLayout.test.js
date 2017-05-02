// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import { AppStore } from '../../data/store';
import { makeServerContext } from '../../lib/test/make-context';

import SearchLayout from './SearchLayout';

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
