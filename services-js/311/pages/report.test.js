// @flow

import React from 'react';
import renderer from 'react-test-renderer';

import Report from './report';

import { makeServerContext } from '../lib/test/make-context';
import inBrowser from '../lib/test/in-browser';
import getStore from '../store';
import { navigate } from '../store/modules/route';

jest.mock('../store/modules/services');

test('request flow', async () => {
  const ctx = makeServerContext('/report', { step: 'report' });
  const props = await Report.getInitialProps(ctx);

  await inBrowser(async () => {
    const component = renderer.create(<Report {...props} />);
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    const store = getStore();
    await store.dispatch(navigate('/report', { step: 'contact' }, '/report/contact'));

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
