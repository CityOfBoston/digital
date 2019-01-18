import Router from 'next/router';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import CheckoutPage, { PageDependenciesProps } from './CheckoutPage';
import CheckoutDao, { SubmissionError } from '../../dao/CheckoutDao';
import OrderProvider from '../../store/OrderProvider';
import DeathCertificateCart from '../../store/DeathCertificateCart';
import { OrderErrorCause } from '../../queries/graphql-types';
import Order from '../../models/Order';

jest.mock('next/router');
jest.mock('../../dao/CheckoutDao');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getInitialProps', () => {
  it('treats no page query param as shipping', async () => {
    const initialProps = await CheckoutPage.getInitialProps({ query: {} }, {});
    expect(initialProps.info.page).toEqual('shipping');
  });

  it('process payment on server', async () => {
    const initialProps = await CheckoutPage.getInitialProps(
      { query: { page: 'payment' } },
      {}
    );

    expect(initialProps.info.page).toEqual('payment');
  });

  it('treats unknown page query param as shipping on client', async () => {
    const initialProps = await CheckoutPage.getInitialProps(
      {
        query: { page: 'not-a-real-page' },
      },
      {}
    );

    expect(initialProps.info.page).toEqual('shipping');
  });

  it('passes confirm props along', async () => {
    const initialProps = await CheckoutPage.getInitialProps(
      {
        query: {
          page: 'confirmation',
          orderId: '123-456-7',
          contactEmail: 'ttoe@squirrelzone.net',
        },
      },
      {}
    );

    expect(initialProps.info).toEqual({
      page: 'confirmation',
      orderId: '123-456-7',
      contactEmail: 'ttoe@squirrelzone.net',
    });
  });
});

describe('rendering', () => {
  let pageDependenciesProps: PageDependenciesProps;

  beforeEach(() => {
    pageDependenciesProps = {
      deathCertificateCart: new DeathCertificateCart(),
      checkoutDao: {} as any,
      orderProvider: new OrderProvider(),
      siteAnalytics: new GaSiteAnalytics(),
      stripe: null,
    };
  });

  it('renders shipping', () => {
    const page = new CheckoutPage({
      info: { page: 'shipping' },
      ...pageDependenciesProps,
    });

    page.state = {
      order: new Order(),
    };

    expect(page.render()).toMatchSnapshot();
  });

  it('renders payment', () => {
    const page = new CheckoutPage({
      info: { page: 'payment' },
      ...pageDependenciesProps,
    });

    page.state = {
      order: new Order(),
    };

    expect(page.render()).toMatchSnapshot();
  });

  it('renders review', () => {
    const page = new CheckoutPage({
      info: { page: 'review' },
      ...pageDependenciesProps,
    });

    page.state = {
      order: new Order(),
    };

    expect(page.render()).toMatchSnapshot();
  });

  it('renders confirmation', () => {
    const page = new CheckoutPage({
      info: {
        page: 'confirmation',
        orderId: '123-456-7',
        contactEmail: 'ttoe@squirrelzone.net',
      },
      ...pageDependenciesProps,
    });

    page.state = {
      order: new Order(),
    };

    expect(page.render()).toMatchSnapshot();
  });
});

describe('operations', () => {
  let checkoutDao: CheckoutDao;
  let orderProvider: OrderProvider;
  let component: CheckoutPage;
  let scrollSpy;

  beforeEach(async () => {
    scrollSpy = jest.spyOn(window, 'scroll').mockImplementation(() => {});

    orderProvider = new OrderProvider();
    orderProvider.attach(null, null);
    checkoutDao = new CheckoutDao(null as any, null);

    // page doesn't really matter for this
    component = new CheckoutPage({
      deathCertificateCart: new DeathCertificateCart(),
      siteAnalytics: new GaSiteAnalytics(),
      stripe: null,

      info: { page: 'shipping' },
      orderProvider,
      checkoutDao,
    });

    component.state = {
      order: await orderProvider.get(),
    };

    // Keeps us from setting state in the order succes case, since it will fail
    // (the component isn’t actually mounted)
    component.setState = jest.fn();
  });

  afterEach(() => {
    scrollSpy.mockRestore();
  });

  describe('advanceToPayment', () => {
    it('routes to next stage', () => {
      component.advanceToPayment({} as any);
      expect(Router.push).toHaveBeenCalled();
    });
  });

  describe('advanceToReview', () => {
    it('routes to next stage if tokenization is successful', async () => {
      (checkoutDao.tokenizeCard as jest.Mock).mockReturnValue(
        Promise.resolve()
      );

      await component.advanceToReview(null, {} as any);
      expect(Router.push).toHaveBeenCalled();
    });

    it('does not route if tokenization is unsuccessful', async () => {
      (checkoutDao.tokenizeCard as jest.Mock).mockReturnValue(
        Promise.reject(new Error('tokenization failed'))
      );

      await expect(
        component.advanceToReview({} as any, {} as any)
      ).rejects.toMatchObject({
        message: 'tokenization failed',
      });
      expect(Router.push).not.toHaveBeenCalled();
    });
  });

  describe('submitOrder', () => {
    it('redirects on success', async () => {
      (checkoutDao.submitDeathCertificateCart as jest.Mock).mockReturnValue(
        Promise.resolve('test-order-id')
      );
      await component.submitOrder();
      expect(Router.push).toHaveBeenCalled();
    });

    it('stays on the same page on failure', async () => {
      (checkoutDao.submitDeathCertificateCart as jest.Mock).mockReturnValue(
        Promise.reject(
          new SubmissionError(
            'The card is expired',
            OrderErrorCause.USER_PAYMENT
          )
        )
      );

      await expect(component.submitOrder()).rejects.toBeInstanceOf(
        SubmissionError
      );

      expect(Router.push).not.toHaveBeenCalled();
    });
  });
});
