import Router from 'next/router';

import CheckoutPage from './CheckoutPage';
import CheckoutDao from '../../dao/CheckoutDao';
import OrderProvider from '../../store/OrderProvider';

jest.mock('next/router');
jest.mock('../../dao/CheckoutDao');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getInitialProps', () => {
  let res: any;

  beforeEach(() => {
    res = {
      writeHead: jest.fn(),
      end: jest.fn(),
      finished: false,
    };
  });

  it('treats no page query param as shipping', () => {
    const initialProps = CheckoutPage.getInitialProps({
      res,
      query: {},
    } as any);

    expect(initialProps.info.page).toEqual('shipping');
  });

  it('process payment on server', () => {
    const initialProps = CheckoutPage.getInitialProps({
      query: { page: 'payment' },
    } as any);

    expect(initialProps.info.page).toEqual('payment');
  });

  it('redirects payment on server back to shipping', () => {
    CheckoutPage.getInitialProps({ res, query: { page: 'payment' } } as any);

    expect(res.writeHead).toHaveBeenCalled();
    expect(res.finished).toBe(true);
  });

  it('redirects unknown page query param to shipping on server', () => {
    CheckoutPage.getInitialProps({
      res,
      query: { page: 'not-a-real-page' },
    } as any);

    expect(res.writeHead).toHaveBeenCalled();
    expect(res.finished).toBe(true);
  });

  it('treats unknown page query param as shipping on client', () => {
    const initialProps = CheckoutPage.getInitialProps({
      query: { page: 'not-a-real-page' },
    } as any);

    expect(initialProps.info.page).toEqual('shipping');
  });

  it('passes confirm props along', () => {
    const initialProps = CheckoutPage.getInitialProps({
      query: {
        page: 'confirmation',
        orderId: '123-456-7',
        contactEmail: 'ttoe@squirrelzone.net',
      },
    } as any);

    expect(initialProps.info).toEqual({
      page: 'confirmation',
      orderId: '123-456-7',
      contactEmail: 'ttoe@squirrelzone.net',
    });
  });
});

describe('rendering', () => {
  it('renders shipping', () => {
    expect(
      new CheckoutPage({
        info: { page: 'shipping' },
        ...CheckoutPage.defaultProps,
      }).render()
    ).toMatchSnapshot();
  });

  it('renders payment', () => {
    expect(
      new CheckoutPage({
        info: { page: 'payment' },
        ...CheckoutPage.defaultProps,
      }).render()
    ).toMatchSnapshot();
  });

  it('renders review', () => {
    expect(
      new CheckoutPage({
        info: { page: 'review' },
        ...CheckoutPage.defaultProps,
      }).render()
    ).toMatchSnapshot();
  });

  it('renders confirmation', () => {
    expect(
      new CheckoutPage({
        info: {
          page: 'confirmation',
          orderId: '123-456-7',
          contactEmail: 'ttoe@squirrelzone.net',
        },
        ...CheckoutPage.defaultProps,
      }).render()
    ).toMatchSnapshot();
  });
});

describe('operations', () => {
  let checkoutDao: CheckoutDao;
  let orderProvider: OrderProvider;
  let component;
  let scrollSpy;

  beforeEach(() => {
    scrollSpy = jest.spyOn(window, 'scroll').mockImplementation(() => {});

    orderProvider = new OrderProvider();
    checkoutDao = new CheckoutDao(null as any, null);

    // page doesn't really matter for this
    component = new CheckoutPage({
      ...CheckoutPage.defaultProps,
      info: { page: 'shipping' },
      orderProvider,
      checkoutDao,
    });

    component.componentWillMount();
  });

  afterEach(() => {
    scrollSpy.mockRestore();
  });

  describe('advanceToPayment', () => {
    it('routes to next stage', () => {
      component.advanceToPayment();
      expect(Router.push).toHaveBeenCalled();
    });
  });

  describe('advanceToReview', () => {
    it('routes to next stage if tokenization is successful', async () => {
      (checkoutDao.tokenizeCard as jest.Mock).mockReturnValue(
        Promise.resolve(true)
      );

      await component.advanceToReview(null);
      expect(Router.push).toHaveBeenCalled();
    });

    it('does not route if tokenization is unsuccessful', async () => {
      (checkoutDao.tokenizeCard as jest.Mock).mockReturnValue(
        Promise.resolve(false)
      );

      await component.advanceToReview(null);
      expect(Router.push).not.toHaveBeenCalled();
    });
  });

  describe('submitOrder', () => {
    it('redirects on success', async () => {
      (checkoutDao.submit as jest.Mock).mockReturnValue(
        Promise.resolve('test-order-id')
      );
      await component.submitOrder();
      expect(Router.push).toHaveBeenCalled();
    });

    it('stays on the same page on failure', async () => {
      (checkoutDao.submit as jest.Mock).mockReturnValue(Promise.resolve(null));
      await component.submitOrder();
      expect(Router.push).not.toHaveBeenCalled();
    });
  });
});
