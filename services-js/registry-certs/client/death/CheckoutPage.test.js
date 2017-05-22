// @flow
import React from 'react';
import { runInAction } from 'mobx';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import type { DeathCertificate } from '../types';
import Cart from '../store/Cart';

import CheckoutPage from './CheckoutPage';

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

describe('rendering', () => {
  let cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('renders loading for unhydrated cart', () => {
    runInAction(() => {
      cart.pendingFetches = 2;
      cart.items = ([{
        id: TEST_DEATH_CERTIFICATES[0].id,
        cert: null,
        quantity: 5,
      }, {
        id: TEST_DEATH_CERTIFICATES[1].id,
        cert: null,
        quantity: 3,
      }]: any);
    });

    expect(renderer.create(<CheckoutPage cart={cart} />).toJSON()).toMatchSnapshot();
  });

  it('renders a hydrated cart', () => {
    cart.add(TEST_DEATH_CERTIFICATES[0], 5);
    cart.add(TEST_DEATH_CERTIFICATES[1], 2);

    expect(renderer.create(<CheckoutPage cart={cart} />).toJSON()).toMatchSnapshot();
  });
});

describe('submit', () => {
  let cart;
  let wrapper;

  beforeEach(() => {
    cart = new Cart();
    cart.add(TEST_DEATH_CERTIFICATES[0], 5);
    cart.add(TEST_DEATH_CERTIFICATES[1], 2);

    wrapper = shallow(<CheckoutPage cart={cart} />);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('submits', () => {
    const form = wrapper.find('form');
    const preventDefault = jest.fn();

    form.simulate('submit', { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
  });
});
