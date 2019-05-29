// Wrapper controller for the separate pages along the checkout flow

import React from 'react';
import { observer } from 'mobx-react';
import Router from 'next/router';

import { getParam } from '@cityofboston/next-client-common';

import { PageDependencies, GetInitialProps } from '../../../pages/_app';
import Order, { OrderInfo } from '../../models/Order';

import { CERTIFICATE_COST } from '../../../lib/costs';

import ShippingContent from '../../common/checkout/ShippingContent';
import PaymentContent from '../../common/checkout/PaymentContent';
import ReviewContent from '../../common/checkout/ReviewContent';
import ConfirmationContent from './ConfirmationContent';
import CheckoutPageLayout from '../../common/checkout/CheckoutPageLayout';

const DEATH_CERTIFICATE_COST = CERTIFICATE_COST.DEATH;

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
  | 'deathCertificateCart'
  | 'siteAnalytics'
  | 'orderProvider'
  | 'checkoutDao'
  | 'stripe'
>;

interface Props extends InitialProps, PageDependenciesProps {
  orderForTest?: Order;
}

type State = {
  /**
   * This will be null on the server and during the first client render.
   */
  order: Order | null;
};

@observer
export default class CheckoutPageController extends React.Component<
  Props,
  State
> {
  state: State = {
    order: this.props.orderForTest || null,
  };

  static getInitialProps: GetInitialProps<InitialProps, 'query'> = ({
    query,
  }) => {
    let info: PageInfo;

    const page = query.page || '';

    switch (page) {
      case '':
      case 'shipping':
        info = { page: 'shipping' };
        break;
      case 'payment':
        info = { page: 'payment' };
        break;
      case 'review':
        info = { page: 'review' };
        break;
      case 'confirmation':
        info = {
          page: 'confirmation',
          orderId: getParam(query.orderId, ''),
          contactEmail: getParam(query.contactEmail, ''),
        };
        break;
      default:
        info = { page: 'shipping' };
        break;
    }

    return { info };
  };

  async componentDidMount() {
    this.reportCheckoutStep(this.props);

    const { orderProvider } = this.props;

    // We won’t have an Order until we’re mounted in the browser because it’s
    // dependent on sessionStorage / localStorage data.
    const order = await orderProvider.get();
    await new Promise(resolve => this.setState({ order }, resolve));
  }

  componentWillReceiveProps(newProps: Props) {
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

  advanceToPayment = async (shippingInfo: Partial<OrderInfo>) => {
    const { order } = this.state;

    if (!order) {
      return;
    }

    order.updateInfo(shippingInfo);

    await Router.push('/death/checkout?page=payment');

    window.scroll(0, 0);
  };

  advanceToReview = async (
    cardElement: stripe.elements.Element | null,
    billingInfo: Partial<OrderInfo>
  ) => {
    const { checkoutDao } = this.props;
    const { order } = this.state;

    if (!order) {
      return;
    }

    order.updateInfo(billingInfo);

    // This may throw, in which case the payment page will catch it and display
    // the error.
    if (cardElement) {
      await checkoutDao.tokenizeCard(order, cardElement);
    }

    await Router.push('/death/checkout?page=review');

    window.scroll(0, 0);
  };

  /**
   * Submits the order.
   *
   * Will throw exceptions if things didn’t go well.
   */
  submitOrder = async () => {
    const {
      deathCertificateCart,
      checkoutDao,
      siteAnalytics,
      orderProvider,
    } = this.props;

    const { order } = this.state;

    if (!order) {
      return;
    }

    const orderId = await checkoutDao.submitDeathCertificateCart(
      deathCertificateCart,
      order
    );

    deathCertificateCart.trackCartItems();

    siteAnalytics.setProductAction('purchase', {
      id: orderId,
      revenue: (deathCertificateCart.size * DEATH_CERTIFICATE_COST) / 100,
    });

    siteAnalytics.sendEvent('click', {
      category: 'UX',
      label: 'submit order',
    });

    deathCertificateCart.clear();
    orderProvider.clear();

    this.setState({
      order: await orderProvider.get(),
    });

    await Router.push(
      `/death/checkout?page=confirmation&orderId=${encodeURIComponent(
        orderId
      )}&contactEmail=${encodeURIComponent(order.info.contactEmail)}`,
      '/death/checkout?page=confirmation'
    );

    window.scroll(0, 0);
  };

  render() {
    const { info, deathCertificateCart, stripe } = this.props;
    const { order } = this.state;

    // This happens during server side rendering
    if (!order) {
      return <CheckoutPageLayout certificateType="death" />;
    }

    switch (info.page) {
      case 'shipping':
        return (
          <ShippingContent
            certificateType="death"
            deathCertificateCart={deathCertificateCart}
            order={order}
            submit={this.advanceToPayment}
          />
        );

      case 'payment':
        return (
          <PaymentContent
            certificateType="death"
            stripe={stripe}
            deathCertificateCart={deathCertificateCart}
            order={order}
            submit={this.advanceToReview}
          />
        );

      case 'review':
        return (
          <ReviewContent
            certificateType="death"
            deathCertificateCart={deathCertificateCart}
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
