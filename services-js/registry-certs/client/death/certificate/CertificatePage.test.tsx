import React from 'react';
import { mount } from 'enzyme';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import DeathCertificatesDao from '../../dao/DeathCertificatesDao';

import CertificatePage from './CertificatePage';

import { TYPICAL_CERTIFICATE } from '../../../fixtures/client/death-certificates';

jest.mock('next/router');
jest.mock('../../dao/DeathCertificatesDao');

describe('getInitialProps', () => {
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao(null as any);
  });

  it('loads the cert passed in query', async () => {
    deathCertificatesDao.get.mockReturnValue(TYPICAL_CERTIFICATE);

    const initialProps = await CertificatePage.getInitialProps(
      { query: { id: '000002' }, res: undefined },
      { deathCertificatesDao }
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });

  it('handles a 404', async () => {
    deathCertificatesDao.get.mockReturnValue(null);

    const initialProps = await CertificatePage.getInitialProps(
      { query: { id: '000002' }, res: undefined },
      { deathCertificatesDao }
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });

  describe('operations', () => {
    let scrollSpy;

    beforeEach(() => {
      scrollSpy = jest.spyOn(window, 'scroll').mockImplementation(() => {});
    });

    afterEach(() => {
      scrollSpy.mockRestore();
    });

    describe('setCartQuantity', () => {
      let cart;
      let siteAnalytics;
      let component;

      beforeEach(() => {
        cart = new DeathCertificateCart();
        siteAnalytics = new GaSiteAnalytics();

        component = mount(
          <CertificatePage
            deathCertificateCart={cart}
            siteAnalytics={siteAnalytics}
            id="0002"
            certificate={TYPICAL_CERTIFICATE}
            backUrl="/search?q=jayne"
          />
        ).instance();
      });

      it('adds 5 things to the cart', () => {
        component.setCartQuantity(5);
        expect(cart.size).toEqual(5);
      });

      it('removes certificates when set to 0', () => {
        cart.setQuantity(TYPICAL_CERTIFICATE, 5);
        expect(cart.entries.length).toBe(1);

        component.setCartQuantity(0);
        expect(cart.entries.length).toBe(0);
      });
    });
  });
});
