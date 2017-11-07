// @flow

import Router from 'next/router';

import CheckoutPage, { wrapCheckoutPageController } from './CheckoutPage';
import CheckoutDao from '../../dao/CheckoutDao';
import Order from '../../store/Order';

jest.mock('next/router');
jest.mock('../../dao/CheckoutDao');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('integration', () => {
  it('renders shipping', () => {
    expect(new CheckoutPage({ page: 'shipping' }).render()).toMatchSnapshot();
  });

  it('renders payment', () => {
    expect(new CheckoutPage({ page: 'payment' }).render()).toMatchSnapshot();
  });

  it('renders confirmation', () => {
    expect(
      new CheckoutPage({
        page: 'confirmation',
        orderId: '123-456-7',
        contactEmail: 'ttoe@squirrelzone.net',
      }).render()
    ).toMatchSnapshot();
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

    it('passes confirm props along', () => {
      const initialProps = CheckoutPageController.getInitialProps(
        ({
          query: {
            page: 'confirmation',
            orderId: '123-456-7',
            contactEmail: 'ttoe@squirrelzone.net',
          },
        }: any)
      );

      expect(initialProps).toEqual({
        page: 'confirmation',
        orderId: '123-456-7',
        contactEmail: 'ttoe@squirrelzone.net',
      });
    });
  });

  describe('operations', () => {
    let dependencies: any;
    let checkoutDao: CheckoutDao;
    let order: Order;
    let controller;

    beforeEach(() => {
      order = new Order();
      checkoutDao = new CheckoutDao((null: any), null);

      dependencies = {
        checkoutDao,
        order,
      };

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

      it('redirects on success', async () => {
        checkoutDao.submit.mockReturnValue(Promise.resolve('test-order-id'));
        await controller.submitOrder(null);
        expect(Router.push).toHaveBeenCalled();
      });

      it('stays on the same page on failure', async () => {
        checkoutDao.submit.mockReturnValue(Promise.resolve(null));
        await controller.submitOrder(null);
        expect(Router.push).not.toHaveBeenCalled();
      });

      it('clears the cart on success');
    });
  });
});
