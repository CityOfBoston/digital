// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import type { DeathCertificate } from '../types';
import Cart from '../store/Cart';

import CertificatePage from './CertificatePage';
import type { InitialProps } from './CertificatePage';

jest.mock('../queries/fetch-death-certificates');
const fetchDeathCertificates: JestMockFn = (require('../queries/fetch-death-certificates'): any).default;

const TEST_DEATH_CERTIFICATE: DeathCertificate = {
  id: '000002',
  firstName: 'Bruce',
  lastName: 'Banner',
  birthYear: '1962',
  deathYear: '2016',
  causeOfDeath: 'Hawkeye',
};

const renderFromInitialProps = async (query: {[key: string]: string}) => {
  const cart = new Cart();
  const initialProps: InitialProps = await CertificatePage.getInitialProps((({
    query,
  }): any));

  return renderer.create(<CertificatePage cart={cart} {...initialProps} />);
};

describe('rendering', () => {
  it('renders a certificate', async () => {
    fetchDeathCertificates.mockReturnValue(TEST_DEATH_CERTIFICATE);
    expect((await renderFromInitialProps({ id: '000002' })).toJSON()).toMatchSnapshot();
    expect(fetchDeathCertificates).toHaveBeenCalledWith(expect.anything(), ['000002']);
  });

  it('renders a 404', async () => {
    fetchDeathCertificates.mockReturnValue([null]);

    expect((await renderFromInitialProps({ id: '000002' })).toJSON()).toMatchSnapshot();
    expect(fetchDeathCertificates).toHaveBeenCalledWith(expect.anything(), ['000002']);
  });
});

describe('searching', () => {
  it('redirects to search for a query', () => {
    const cart = new Cart();
    const wrapper = shallow(<CertificatePage cart={cart} id="00002" certificate={TEST_DEATH_CERTIFICATE} />);

    wrapper.find('select[name="quantity"]').simulate('change', { target: { value: '5' } });
    wrapper.find('form.js-add-to-cart-form').simulate('submit', { preventDefault: jest.fn() });

    expect(cart.size).toEqual(5);
  });
});
