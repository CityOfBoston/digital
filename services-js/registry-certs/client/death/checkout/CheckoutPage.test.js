// @flow

import CheckoutPage, { wrapCheckoutPageController } from './CheckoutPage';

import Router from 'next/router';

jest.mock('next/router');

describe('integration', () => {
  it('renders shipping', () => {
    expect(new CheckoutPage({ page: 'shipping' }).render()).toMatchSnapshot();
  });

  it('renders payment', () => {
    expect(new CheckoutPage({ page: 'payment' }).render()).toMatchSnapshot();
  });
});

describe('controller', () => {
  describe('getInitialProps', () => {
    let CheckoutPageController;
    let dependencies: any;

    beforeEach(() => {
      dependencies = {};
      CheckoutPageController = wrapCheckoutPageController(
        () => dependencies,
        () => null
      );
    });

    it('treats no page query param as shipping', () => {
      const initialProps = CheckoutPageController.getInitialProps(
        ({
          query: {},
        }: any)
      );

      expect(initialProps.page).toEqual('shipping');
    });

    it('passes payment query param through', () => {
      const initialProps = CheckoutPageController.getInitialProps(
        ({
          query: { page: 'payment' },
        }: any)
      );

      expect(initialProps.page).toEqual('payment');
    });

    it('redirects unknown page query param to shipping on server', () => {
      const res: ServerResponse = {
        writeHead: jest.fn(),
        end: jest.fn(),
        finished: false,
      };

      CheckoutPageController.getInitialProps(
        ({
          query: { page: 'not-a-real-page' },
          res,
        }: any)
      );

      expect(res.writeHead).toHaveBeenCalled();
      expect(res.finished).toBe(true);
    });

    it('treats unknown page query param as shipping on client', () => {
      const initialProps = CheckoutPageController.getInitialProps(
        ({
          query: { page: 'not-a-real-page' },
        }: any)
      );

      expect(initialProps.page).toEqual('shipping');
    });
  });

  describe('operations', () => {
    let dependencies: any;
    let controller;

    beforeEach(() => {
      dependencies = {};

      const CheckoutPageController = wrapCheckoutPageController(
        () => dependencies,
        () => null
      );

      // page doesn't really matter for this
      controller = new CheckoutPageController({ page: 'shipping' });
    });

    describe('advanceToPayment', () => {
      it('routes to next stage', () => {
        controller.advanceToPayment();
        expect(Router.push).toHaveBeenCalled();
      });
    });

    describe('submitOrder', () => {
      it('exists', () => {
        expect(controller.submitOrder).toBeDefined();
      });
    });
  });
});
