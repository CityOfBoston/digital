// @flow
/* eslint no-fallthrough: 0 */

import React from 'react';
import renderer from 'react-test-renderer';
import Router from 'next/router';

import type { Request } from '../../data/types';
import { makeServerContext } from '../../lib/test/make-context';

import LookupLayout from './LookupLayout';

jest.mock('next/router');
jest.mock('../../data/dao/load-request');

const loadRequest: JestMockFn = (require('../../data/dao/load-request'): any).default;

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
    const ctx = makeServerContext('/lookup');
    data = (await LookupLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    expect(data.view).toEqual('search');
  });

  test('rendering', () => {
    const component = renderer.create(
      <LookupLayout data={data} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('case', () => {
  let data;

  beforeEach(async () => {
    loadRequest.mockReturnValue(Promise.resolve(MOCK_REQUEST));
    const ctx = makeServerContext('/search', { q: 'case-id' });
    data = (await LookupLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    switch (data.view) {
      case 'case':
        expect(data.query).toEqual('case-id');
      default:
        expect(data.view).toEqual('case');
    }
  });

  test('rendering', () => {
    const component = renderer.create(
      <LookupLayout data={data} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('case not found', () => {
  let ctx;
  let data;

  beforeEach(async () => {
    loadRequest.mockReturnValue(Promise.resolve(null));
    ctx = makeServerContext('/search', { q: 'not-a-real-id' });
    data = (await LookupLayout.getInitialProps(ctx)).data;
  });

  test('getInitialProps', () => {
    // flow check
    if (ctx.res) {
      expect(ctx.res.statusCode).toEqual(404);
    } else {
      expect(ctx.res).toBeDefined();
    }

    switch (data.view) {
      case 'case':
        expect(data.request).toBeNull();
      default:
        expect(data.view).toEqual('case');
    }
  });

  test('rendering', () => {
    const component = renderer.create(
      <LookupLayout data={data} />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

test('search', () => {
  const lookupLayout = new LookupLayout({ data: { view: 'search' } });
  lookupLayout.search('query');
  expect(Router.push).toHaveBeenCalledWith('/search?q=query');
});
