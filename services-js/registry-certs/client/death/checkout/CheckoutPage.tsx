// Wrapper controller for the separate pages along the checkout flow

import React from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import Router from 'next/router';

import { PageDependencies, GetInitialProps } from '../../../pages/_app';
import Order from '../../models/Order';

import ShippingContent from './ShippingContent';
import PaymentContent from './PaymentContent';
import ReviewContent from './ReviewContent';
import ConfirmationContent from './ConfirmationContent';
import { DEATH_CERTIFICATE_COST } from '../../../lib/costs';

type PageInfo =
  | {
      page: 'shipping';
    }
  | {
      page: 'payment';
    }
  | {
      page: 'review';
    }
  | {
      page: 'confirmation';
      orderId: string;
      contactEmail: string;
    };

interface InitialProps {
  info: PageInfo;
}

export type PageDependenciesProps = Pick<
  PageDependencies,
  | 'screenReaderSupport'
  | 'deathCertificateCart'
  | 'siteAnalytics'
  | 'orderProvider'
  | 'checkoutDao'
  | 'stripe'
>;

interface Props extends InitialProps, PageDependenciesProps {}

@observer
export default class CheckoutPageController extends React.Component<Props> {
  static getInitialProps: GetInitialProps<InitialProps, 'query' | 'res'> = ({
    query,
    res,
  }) => {
    let info: PageInfo;
    let redirectToShippingIfServer = false;

    const page = query.page || '';

    switch (page) {
      case '':
      case 'shipping':
        info = { page: 'shipping' };
        break;
      case 'payment':
        info = { page: 'payment' };

        // We know that we won't have shipping information if someone visits
        // the payment page directly from the server (since this component's
        // internal state will be blank), so redirect.
        redirectToShippingIfServer = true;
        break;
      case 'review':
        info = { page: 'review' };

        // We know that we won't have shipping information if someone visits
        // the payment page directly from the server (since this component's
        // internal state will be blank), so redirect.
        redirectToShippingIfServer = true;
        break;
      case 'confirmation':
        info = {
          page: 'confirmation',
          orderId: query.orderId || '',
          contactEmail: query.contactEmail || '',
        };
        break;
      default:
        info = { page: 'shipping' };
        redirectToShippingIfServer = true;
    }

    if (redirectToShippingIfServer && res) {
      res.writeHead(301, {
        Location: '/death/checkout',
      });
      res.end();
    }

    return { info };
  };

  // This wil persist across different sub-pages since React will preserve the
  // component instance. This will keep the form fields filled out as the user
  // goes forward and back in the interface, and it will get automatically
  // disposed of if the user leaves the flow, which is the behavior that we
  // want.
  //
  // Set in componentWillMount, so it always is non-null;
  private order: Order = null as any;

  componentWillMount() {
    const { orderProvider } = this.props;

    this.reportCheckoutStep(this.props);

    // This will be populated from localStorage, and changes to it will get
    // written back there.
    const order = orderProvider.get();
    this.order = order;
  }

  componentDidMount() {
    this.redirectIfMissingOrderInfo(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    this.redirectIfMissingOrderInfo(newProps);

    if (newProps.info.page !== this.props.info.page) {
      this.reportCheckoutStep(newProps);
    }
  }

  reportCheckoutStep({ info, deathCertificateCart, siteAnalytics }: Props) {
    let checkoutStep: number | null = null;
    switch (info.page) {
      case 'shipping':
        checkoutStep = 1;
        break;
      case 'payment':
        checkoutStep = 2;
        break;
      case 'review':
        checkoutStep = 3;
        break;
    }

    if (checkoutStep) {
      deathCertificateCart.trackCartItems();
      siteAnalytics.setProductAction('checkout', { step: checkoutStep });
    }
  }

  // In the case of reloading from the browser, for example, or clicking
  // "back" from the confirmation page.
  async redirectIfMissingOrderInfo(props: Props) {
    if (
      (props.info.page === 'payment' && !this.order.shippingIsComplete) ||
      (props.info.page === 'review' &&
        (!this.order.shippingIsComplete || !this.order.paymentIsComplete))
    ) {
      await Router.push('/death/checkout?page=shipping', '/death/checkout');
      window.scroll(0, 0);
    }
  }

  advanceToPayment = async () => {
    await Router.push('/death/checkout?page=payment', '/death/checkout');
    window.scroll(0, 0);
  };

  advanceToReview = async (cardElement: stripe.elements.Element | null) => {
    const { order } = this;
    const { checkoutDao } = this.props;

    // This may throw, in which case the payment page will catch it and display
    // the error.
    await checkoutDao.tokenizeCard(order, cardElement);

    await Router.push('/death/checkout?page=review', '/death/checkout');
    window.scroll(0, 0);
  };

  /**
   * Submits the order.
   *
   * Will throw exceptions if things didn’t go well.
   */
  submitOrder = async () => {
    const { order } = this;
    const {
      deathCertificateCart,
      checkoutDao,
      siteAnalytics,
      orderProvider,
    } = this.props;

    const orderId = await checkoutDao.submit(deathCertificateCart, order);

    deathCertificateCart.trackCartItems();
    siteAnalytics.setProductAction('purchase', {
      id: orderId,
      revenue: deathCertificateCart.size * DEATH_CERTIFICATE_COST / 100,
    });
    siteAnalytics.sendEvent('click', {
      category: 'UX',
      label: 'submit order',
    });

    runInAction(() => {
      deathCertificateCart.clear();
      orderProvider.clear();

      this.order = orderProvider.get();
    });

    await Router.push(
      `/death/checkout?page=confirmation&orderId=${encodeURIComponent(
        orderId
      )}&contactEmail=${encodeURIComponent(order.info.contactEmail)}`,
      '/death/checkout'
    );

    window.scroll(0, 0);
  };

  render() {
    const { order } = this;
    const { info, deathCertificateCart, stripe } = this.props;

    switch (info.page) {
      case 'shipping':
        return (
          <ShippingContent
            cart={deathCertificateCart}
            order={order}
            submit={this.advanceToPayment}
          />
        );

      case 'payment':
        return (
          <PaymentContent
            stripe={stripe}
            cart={deathCertificateCart}
            order={order}
            submit={this.advanceToReview}
          />
        );

      case 'review':
        return (
          <ReviewContent
            cart={deathCertificateCart}
            order={order}
            submit={this.submitOrder}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationContent
            orderId={info.orderId}
            contactEmail={info.contactEmail}
            cart={deathCertificateCart}
          />
        );
    }
  }
}
