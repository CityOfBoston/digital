// @flow
import React from 'react';
import { shallow } from 'enzyme';

import Router from 'next/router';

import { DeathCertificate, DeathCertificateSearchResults } from '../../types';
import DeathCertificatesDao from '../../dao/DeathCertificatesDao';
import SiteAnalytics from '../../lib/SiteAnalytics';

import SearchPage from './SearchPage';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

jest.mock('next/router');
jest.mock('../../dao/DeathCertificatesDao');
jest.mock('../../lib/SiteAnalytics');

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
  let siteAnalytics;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao(null as any);
    siteAnalytics = new SiteAnalytics();
  });

  it('works with no query', async () => {
    const initialProps = await SearchPage.getInitialProps(
      { query: {} } as any,
      { deathCertificatesDao, siteAnalytics } as any
    );

    expect(initialProps).toMatchSnapshot();
  });

  it('searches when given a query', async () => {
    deathCertificatesDao.search.mockReturnValue(TEST_SEARCH_RESULTS);

    const initialProps = await SearchPage.getInitialProps(
      { query: { q: 'Monkey Joe' } } as any,
      { deathCertificatesDao, siteAnalytics } as any
    );

    expect(initialProps).toMatchSnapshot();
    expect(deathCertificatesDao.search).toHaveBeenCalledWith('Monkey Joe', 1);
  });
});

describe('operations', () => {
  let component;

  beforeEach(() => {
    component = new SearchPage({} as any);
  });

  describe('submitSearch', () => {
    it('redirects to search for a query', () => {
      component.submitSearch('Monkey Joe');
      expect(Router.push).toHaveBeenCalledWith('/death?q=Monkey%20Joe');
    });

    it('trims the query', () => {
      component.submitSearch('Monkey Joe   ');
      expect(Router.push).toHaveBeenCalledWith('/death?q=Monkey%20Joe');
    });
  });
});

describe('content', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <SearchPage query={'Jayn Doe'} page={1} results={null} />
    );
  });

  it('defaults to the passed-in query', () => {
    const queryField = wrapper.find('input[name="q"]');
    expect(queryField.prop('value')).toEqual('Jayn Doe');
  });

  it('changes query input and submits it', () => {
    const form = wrapper.find('form');
    const queryField = wrapper.find('input[name="q"]');

    queryField.simulate('change', { target: { value: 'Monkey Joe' } });
    form.simulate('submit', { preventDefault: jest.fn() });

    expect(Router.push).toHaveBeenCalledWith('/death?q=Monkey%20Joe');
  });
});
