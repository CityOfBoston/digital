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

describe('interface', () => {
  let siteAnalytics;
  let wrapper;

  beforeEach(() => {
    siteAnalytics = new GaSiteAnalytics();

    wrapper = mount(
      <CertificatePage
        siteAnalytics={siteAnalytics}
        deathCertificateCart={new DeathCertificateCart()}
        certificate={TYPICAL_CERTIFICATE}
        id={TYPICAL_CERTIFICATE.id}
        backUrl={'/search?q=jayne'}
      />
    );

    wrapper.instance().setCartQuantity = jest.fn();
  });

  it('clears text field when other is selected', () => {
    const quantityField = wrapper.find('[name="quantity"]');
    const quantityMenu = wrapper.find('[name="quantityMenu"]');

    expect(quantityField.props().value).toEqual(1);

    quantityMenu.simulate('change', { target: { value: 'other' } });

    wrapper.update();
    const updatedQuantityField = wrapper.find('[name="quantity"]');
    expect(updatedQuantityField.props().value).toEqual('');
  });

  it('changes quantity via text field and adds to cart', () => {
    const form = wrapper.find('form');
    const quantityField = wrapper.find('[name="quantity"]');

    quantityField.simulate('change', { target: { value: '5' } });
    form.simulate('submit', { preventDefault: jest.fn() });

    expect(wrapper.instance().setCartQuantity).toHaveBeenCalledWith(5);
  });

  it('disables submit if there’s no quantity', () => {
    const quantityField = wrapper.find('[name="quantity"]');

    quantityField.simulate('change', { target: { value: '' } });

    const addToCartButton = wrapper.find('button[type="submit"]');
    expect(addToCartButton.prop('disabled')).toBe(true);
  });

  it('changes quantity via menu and adds to cart', () => {
    const form = wrapper.find('form');
    const quantityMenu = wrapper.find('[name="quantityMenu"]');

    quantityMenu.simulate('change', { target: { value: '8' } });
    form.simulate('submit', { preventDefault: jest.fn() });

    expect(wrapper.instance().setCartQuantity).toHaveBeenCalledWith(8);
  });
});
