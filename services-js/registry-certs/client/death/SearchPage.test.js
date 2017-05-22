// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import Router from 'next/router';

import type { DeathCertificate } from '../types';
import Cart from '../store/Cart';

import SearchPage from './SearchPage';
import type { InitialProps } from './SearchPage';

jest.mock('next/router');

jest.mock('../queries/search-death-certificates');
const searchDeathCertificates: JestMockFn = (require('../queries/search-death-certificates'): any).default;

const TEST_DEATH_CERTIFICATES: DeathCertificate[] = [
  {
    id: '000001',
    firstName: 'Logan',
    lastName: 'Howlett',
    birthYear: '1974',
    deathYear: '2014',
    causeOfDeath: 'Adamantium suffocation',
  },
  {
    id: '000002',
    firstName: 'Bruce',
    lastName: 'Banner',
    birthYear: '1962',
    deathYear: '2016',
    causeOfDeath: 'Hawkeye',
  },
];


const renderFromInitialProps = async (query: {[key: string]: string}) => {
  const cart = new Cart();
  const initialProps: InitialProps = await SearchPage.getInitialProps((({
    query,
  }): any));

  return renderer.create(<SearchPage cart={cart} {...initialProps} />);
};

describe('rendering', () => {
  it('shows empty search box', async () => {
    expect((await renderFromInitialProps({})).toJSON()).toMatchSnapshot();
  });

  it('shows search results', async () => {
    searchDeathCertificates.mockReturnValue(TEST_DEATH_CERTIFICATES);

    expect((await renderFromInitialProps({ q: 'Monkey Joe' })).toJSON()).toMatchSnapshot();
    expect(searchDeathCertificates).toHaveBeenCalledWith(expect.anything(), 'Monkey Joe');
  });
});

describe('searching', () => {
  it('redirects to search for a query', () => {
    const cart = new Cart();
    const wrapper = shallow(<SearchPage cart={cart} query="" results={null} />);
    wrapper.find('input[name="q"]').simulate('change', { target: { value: 'Monkey Joe' } });
    wrapper.find('form[action="/death"]').simulate('submit', { preventDefault: jest.fn() });

    expect(Router.push).toHaveBeenCalledWith('/death?q=Monkey%20Joe');
  });
});
