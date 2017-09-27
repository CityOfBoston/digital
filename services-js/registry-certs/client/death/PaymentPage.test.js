// @flow
import React from 'react';
import { shallow } from 'enzyme';

import Cart from '../store/Cart';

import PaymentPage, {
  wrapPaymentPageController,
  PaymentPageContent,
} from './PaymentPage';

describe('integration', () => {
  it('renders', () => {
    expect(new PaymentPage({}).render()).toBeDefined();
  });
});

describe('controller', () => {
  describe('operations', () => {
    let dependencies: any;
    let PaymentPageController;

    beforeEach(() => {
      dependencies = {};
      PaymentPageController = wrapPaymentPageController(
        () => dependencies,
        () => null
      );
    });

    describe('submit', () => {
      it('exists', () => {
        const controller = new PaymentPageController({});
        expect(typeof controller.submit).toBe('function');
      });
    });
  });
});

describe('content', () => {
  let cart;
  let submit;
  let wrapper;

  beforeEach(() => {
    cart = new Cart();
    submit = jest.fn();
    wrapper = shallow(<PaymentPageContent cart={cart} submit={submit} />);
  });

  it('submits', () => {
    const form = wrapper.find('form');
    form.simulate('submit', { preventDefault: jest.fn() });
    expect(submit).toHaveBeenCalled();
  });
});
