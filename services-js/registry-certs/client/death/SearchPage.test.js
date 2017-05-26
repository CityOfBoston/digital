// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import Router from 'next/router';

import type { DeathCertificate } from '../types';
import Cart from '../store/Cart';
import DeathCertificatesDao from '../dao/DeathCertificatesDao';

import SearchPage from './SearchPage';
import type { InitialProps } from './SearchPage';

jest.mock('next/router');
jest.mock('../dao/DeathCertificatesDao');

const TEST_DEATH_CERTIFICATES: DeathCertificate[] = [
  {
    id: '000001',
    firstName: 'Logan',
    lastName: 'Howlett',
    birthYear: '1974',
    deathYear: '2014',
    causeOfDeath: 'Adamantium suffocation',
    age: '4 yrs. 2 mos. 10 dys',
  },
  {
    id: '000002',
    firstName: 'Bruce',
    lastName: 'Banner',
    birthYear: '1962',
    deathYear: '2016',
    causeOfDeath: 'Hawkeye',
    age: '4 yrs. 2 mos. 10 dys',
  },
];

const renderFromInitialProps = async (query: {[key: string]: string}, dependencies: Object) => {
  const cart = new Cart();

  const initialProps: InitialProps = await SearchPage.getInitialProps((({
    query,
  }): any), dependencies);

  return renderer.create(<SearchPage cart={cart} {...initialProps} />);
};

describe('rendering', () => {
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao((null: any));
  });

  it('shows empty search box', async () => {
    expect((await renderFromInitialProps({}, { deathCertificatesDao })).toJSON()).toMatchSnapshot();
  });

  it('shows search results', async () => {
    deathCertificatesDao.search.mockReturnValue(TEST_DEATH_CERTIFICATES);

    expect((await renderFromInitialProps({ q: 'Monkey Joe' }, { deathCertificatesDao })).toJSON()).toMatchSnapshot();
    expect(deathCertificatesDao.search).toHaveBeenCalledWith('Monkey Joe');
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
