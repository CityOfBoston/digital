// @flow
import React from 'react';
import { shallow } from 'enzyme';
import Router from 'next/router';

import type { DeathCertificate, DeathCertificateSearchResults } from '../types';
import Cart from '../store/Cart';
import DeathCertificatesDao from '../dao/DeathCertificatesDao';

import SearchPage from './SearchPage';
import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../fixtures/client/death-certificates';

jest.mock('next/router');
jest.mock('../dao/DeathCertificatesDao');

const TEST_DEATH_CERTIFICATES: DeathCertificate[] = [
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
];

const TEST_SEARCH_RESULTS: DeathCertificateSearchResults = {
  results: TEST_DEATH_CERTIFICATES,
  resultCount: 50,
  page: 0,
  pageSize: 5,
  pageCount: 10,
};

describe('getInitialProps', () => {
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao((null: any));
  });

  it('works with no query', async () => {
    const initialProps = await SearchPage.getInitialProps(
      ({
        query: {},
      }: any),
      ({ deathCertificatesDao }: any),
    );

    expect(initialProps).toMatchSnapshot();
  });

  it('searches when given a query', async () => {
    deathCertificatesDao.search.mockReturnValue(TEST_SEARCH_RESULTS);
    const initialProps = await SearchPage.getInitialProps(
      ({
        query: { q: 'Monkey Joe' },
      }: any),
      ({ deathCertificatesDao }: any),
    );

    expect(initialProps).toMatchSnapshot();
    expect(deathCertificatesDao.search).toHaveBeenCalledWith('Monkey Joe', 1);
  });
});

describe('searching', () => {
  it('redirects to search for a query', () => {
    const cart = new Cart();
    const wrapper = shallow(<SearchPage cart={cart} query="" results={null} />);

    wrapper
      .find('input[name="q"]')
      .simulate('change', { target: { value: 'Monkey Joe' } });
    wrapper
      .find('form[action="/death"]')
      .simulate('submit', { preventDefault: jest.fn() });

    expect(Router.push).toHaveBeenCalledWith('/death?q=Monkey%20Joe');
  });
});
