// @flow
import Router from 'next/router';

import type { DeathCertificate, DeathCertificateSearchResults } from '../types';
import DeathCertificatesDao from '../dao/DeathCertificatesDao';

import { wrapSearchPageController } from './SearchPage';

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
  let SearchPageController;
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao((null: any));

    const dependencies: any = { deathCertificatesDao };
    SearchPageController = wrapSearchPageController(
      () => dependencies,
      () => null
    );
  });

  it('works with no query', async () => {
    const initialProps = await SearchPageController.getInitialProps(
      ({ query: {} }: any)
    );

    expect(initialProps).toMatchSnapshot();
  });

  it('searches when given a query', async () => {
    deathCertificatesDao.search.mockReturnValue(TEST_SEARCH_RESULTS);

    const initialProps = await SearchPageController.getInitialProps(
      ({ query: { q: 'Monkey Joe' } }: any)
    );

    expect(initialProps).toMatchSnapshot();
    expect(deathCertificatesDao.search).toHaveBeenCalledWith('Monkey Joe', 1);
  });
});

describe('contentProps', () => {
  let contentProps;

  beforeEach(() => {
    const SearchPageController = wrapSearchPageController(
      () => ({}: any),
      p => {
        contentProps = p;
      }
    );

    new SearchPageController(({}: any)).render();
  });

  describe('submitSearch', () => {
    it('redirects to search for a query', () => {
      contentProps.submitSearch('Monkey Joe');
      expect(Router.push).toHaveBeenCalledWith('/death?q=Monkey%20Joe');
    });
  });
});
