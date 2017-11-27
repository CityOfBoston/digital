// @flow

import Router from 'next/router';

import CheckoutPage, { wrapCheckoutPageController } from './CheckoutPage';
import CheckoutDao from '../../dao/CheckoutDao';
import OrderProvider from '../../store/OrderProvider';

jest.mock('next/router');
jest.mock('../../dao/CheckoutDao');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('integration', () => {
  // We have to componentWillMount in all of these to initialize the
  // Order object.
  it('renders shipping', () => {
    const page = new CheckoutPage({ page: 'shipping' });
    page.componentWillMount();
    expect(page.render()).toMatchSnapshot();
  });

  it('renders payment', () => {
    const page = new CheckoutPage({ page: 'payment' });
    page.componentWillMount();
    expect(page.render()).toMatchSnapshot();
  });

  it('renders confirmation', () => {
    const page = new CheckoutPage({
      page: 'confirmation',
      orderId: '123-456-7',
      contactEmail: 'ttoe@squirrelzone.net',
    });
    page.componentWillMount();
    expect(page.render()).toMatchSnapshot();
  });
});

describe('controller', () => {
  describe('getInitialProps', () => {
    let CheckoutPageController;
    let dependencies: any;
    let res: ServerResponse;

    beforeEach(() => {
      dependencies = {};
      res = {
        writeHead: jest.fn(),
        end: jest.fn(),
        finished: false,
      };

      CheckoutPageController = wrapCheckoutPageController(
        () => dependencies,
        () => null
      );
    });

    it('treats no page query param as shipping', () => {
      const initialProps = CheckoutPageController.getInitialProps(
        ({ res, query: {} }: any)
      );

      expect(initialProps.page).toEqual('shipping');
    });

    it('process payment on server', () => {
      const initialProps = CheckoutPageController.getInitialProps(
        ({ query: { page: 'payment' } }: any)
      );

      expect(initialProps.page).toEqual('payment');
    });

    it('redirects payment on server back to shipping', () => {
      CheckoutPageController.getInitialProps(
        ({ res, query: { page: 'payment' } }: any)
      );

      expect(res.writeHead).toHaveBeenCalled();
      expect(res.finished).toBe(true);
    });

    it('redirects unknown page query param to shipping on server', () => {
      CheckoutPageController.getInitialProps(
        ({ res, query: { page: 'not-a-real-page' } }: any)
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
    let orderProvider: OrderProvider;
    let controller;

    beforeEach(() => {
      orderProvider = new OrderProvider();
      checkoutDao = new CheckoutDao((null: any), null);

      dependencies = {
        checkoutDao,
        orderProvider,
      };

      const CheckoutPageController = wrapCheckoutPageController(
        () => dependencies,
        () => null
      );

      // page doesn't really matter for this
      controller = new CheckoutPageController({ page: 'shipping' });
      controller.componentWillMount();
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
    });
  });
});
