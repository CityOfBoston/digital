// @flow
import React from 'react';
import { shallow } from 'enzyme';

import Cart from '../store/Cart';
import DeathCertificatesDao from '../dao/DeathCertificatesDao';

import CertificatePage from './CertificatePage';

import { TYPICAL_CERTIFICATE } from '../../fixtures/client/death-certificates';

jest.mock('../dao/DeathCertificatesDao');

describe('getInitialProps', () => {
  let deathCertificatesDao;

  beforeEach(() => {
    deathCertificatesDao = new DeathCertificatesDao((null: any));
  });

  it('loads the cert passed in query', async () => {
    deathCertificatesDao.get.mockReturnValue(TYPICAL_CERTIFICATE);

    const initialProps = await CertificatePage.getInitialProps(
      ({
        query: { id: '000002' },
      }: any),
      ({ deathCertificatesDao }: any)
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });

  it('handles a 404', async () => {
    deathCertificatesDao.get.mockReturnValue(null);

    const initialProps = await CertificatePage.getInitialProps(
      ({
        query: { id: '000002' },
      }: any),
      ({ deathCertificatesDao }: any)
    );

    expect(deathCertificatesDao.get).toHaveBeenCalledWith('000002');
    expect(initialProps).toMatchSnapshot();
  });
});

describe('searching', () => {
  it('redirects to search for a query', () => {
    const cart = new Cart();
    const wrapper = shallow(
      <CertificatePage
        cart={cart}
        id="00002"
        certificate={TYPICAL_CERTIFICATE}
      />
    );

    wrapper
      .find('select[name="quantity"]')
      .simulate('change', { target: { value: '5' } });
    wrapper
      .find('form.js-add-to-cart-form')
      .simulate('submit', { preventDefault: jest.fn() });

    expect(cart.size).toEqual(5);
  });
});
