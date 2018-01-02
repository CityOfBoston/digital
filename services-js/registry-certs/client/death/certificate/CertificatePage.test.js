// @flow
import React from 'react';
import { shallow } from 'enzyme';

import Cart from '../../store/Cart';
import DeathCertificatesDao from '../../dao/DeathCertificatesDao';

import CertificatePage, {
  wrapCertificatePageController,
  CertificatePageContent,
} from './CertificatePage';

import { TYPICAL_CERTIFICATE } from '../../../fixtures/client/death-certificates';

jest.mock('../../dao/DeathCertificatesDao');

describe('integration', () => {
  it('renders', () => {
    expect(
      new CertificatePage({
        certificate: TYPICAL_CERTIFICATE,
        id: TYPICAL_CERTIFICATE.id,
        backUrl: '/search?q=jayne',
      }).render()
    ).toMatchSnapshot();
  });
});

describe('controller', () => {
  describe('getInitialProps', () => {
    let CertificatePageController;
    let deathCertificatesDao;

    beforeEach(() => {
      deathCertificatesDao = new DeathCertificatesDao((null: any));

      const dependencies: any = { deathCertificatesDao };
      CertificatePageController = wrapCertificatePageController(
        () => dependencies,
        () => null
      );
    });

    it('loads the cert passed in query', async () => {
      deathCertificatesDao.get.mockReturnValue(TYPICAL_CERTIFICATE);

      const initialProps = await CertificatePageController.getInitialProps(
        ({ query: { id: '000002' } }: any)
      );

      expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
      expect(initialProps).toMatchSnapshot();
    });

    it('handles a 404', async () => {
      deathCertificatesDao.get.mockReturnValue(null);

      const initialProps = await CertificatePageController.getInitialProps(
        ({ query: { id: '000002' } }: any)
      );

      expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
      expect(initialProps).toMatchSnapshot();
    });
  });

  describe('operations', () => {
    describe('addToCart', () => {
      let cart;
      let controller;

      beforeEach(() => {
        cart = new Cart();

        const dependencies: any = { cart };
        const CertificatePageController = wrapCertificatePageController(
          () => dependencies,
          () => null
        );

        controller = shallow(
          <CertificatePageController
            id="0002"
            certificate={TYPICAL_CERTIFICATE}
            backUrl="/search?q=jayne"
          />
        ).instance();

        controller.addToCart(5);
      });

      it('adds 5 things to the cart', () => {
        expect(cart.size).toEqual(5);
      });
    });
  });
});

describe('content', () => {
  let wrapper;
  let addToCart;

  beforeEach(() => {
    addToCart = jest.fn();

    wrapper = shallow(
      <CertificatePageContent
        certificate={TYPICAL_CERTIFICATE}
        id={TYPICAL_CERTIFICATE.id}
        backUrl={'/search?q=jayne'}
        addToCart={addToCart}
      />
    );
  });

  it('changes quantity and adds to cart', () => {
    const form = wrapper.find('form');
    const quantityMenu = wrapper.find('[name="quantity"]');

    quantityMenu.simulate('change', { target: { value: '5' } });
    form.simulate('submit', { preventDefault: jest.fn() });

    expect(addToCart).toHaveBeenCalledWith(5);
  });
});
