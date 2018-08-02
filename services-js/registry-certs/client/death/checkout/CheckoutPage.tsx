// Wrapper controller for the separate pages along the checkout flow

import React from 'react';
import { reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import Router from 'next/router';

import { getDependencies, ClientContext } from '../../app';

import CheckoutDao from '../../dao/CheckoutDao';
import Accessibility from '../../store/Accessibility';
import Cart from '../../store/Cart';
import OrderProvider from '../../store/OrderProvider';
import SiteAnalytics from '../../lib/SiteAnalytics';

import Order from '../../models/Order';

import ShippingContent from './ShippingContent';
import PaymentContent from './PaymentContent';
import ReviewContent from './ReviewContent';
import ConfirmationContent from './ConfirmationContent';
import { CERTIFICATE_COST } from '../../../lib/costs';

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

interface DefaultProps {
  accessibility: Accessibility;
  cart: Cart;
  siteAnalytics: SiteAnalytics;
  orderProvider: OrderProvider;
  checkoutDao: CheckoutDao;
  stripe: stripe.Stripe | null;
}

interface InitialProps {
  info: PageInfo;
}

interface Props extends InitialProps, Partial<DefaultProps> {}

@observer
class CheckoutPageController extends React.Component<Props & DefaultProps> {
  static get defaultProps(): DefaultProps {
    const {
      accessibility,
      cart,
      orderProvider,
      checkoutDao,
      stripe,
      siteAnalytics,
    } = getDependencies();

    return {
      accessibility,
      cart,
      orderProvider,
      checkoutDao,
      stripe,
      siteAnalytics,
    };
  }

  static getInitialProps({ query, res }: ClientContext): InitialProps {
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
      res.finished = true;
    }

    return { info };
  }

  // This wil persist across different sub-pages since React will preserve the
  // component instance. This will keep the form fields filled out as the user
  // goes forward and back in the interface, and it will get automatically
  // disposed of if the user leaves the flow, which is the behavior that we
  // want.
  //
  // Set in componentWillMount, so it always is non-null;
  order: Order = null as any;

  errorAccessibilityDisposer: Function | null = null;

  componentWillMount() {
    const { orderProvider, accessibility } = this.props;

    this.reportCheckoutStep(this.props);

    // This will be populated from localStorage, and changes to it will get
    // written back there.
    const order = orderProvider.get();
    this.order = order;

    this.errorAccessibilityDisposer = reaction(
      () => order.processingError,
      processingError => {
        if (processingError) {
          accessibility.message = `There’s a problem: ${processingError}. You can try again. If this keeps happening, please email digital@boston.gov.`;
          accessibility.interrupt = true;
        }
      }
    );
  }

  componentDidMount() {
    this.redirectIfMissingOrderInfo(this.props);
  }

  componentWillUnmount() {
    if (this.errorAccessibilityDisposer) {
      this.errorAccessibilityDisposer();
    }
  }

  componentWillReceiveProps(newProps: Props & DefaultProps) {
    this.redirectIfMissingOrderInfo(newProps);

    if (newProps.info.page !== this.props.info.page) {
      this.reportCheckoutStep(newProps);
    }
  }

  reportCheckoutStep({ info, cart, siteAnalytics }: Props & DefaultProps) {
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
      cart.trackCartItems();
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

    const success = await checkoutDao.tokenizeCard(order, cardElement);

    if (success) {
      await Router.push('/death/checkout?page=review', '/death/checkout');
      window.scroll(0, 0);
    }
  };

  submitOrder = async () => {
    const { order } = this;
    const { cart, checkoutDao, siteAnalytics } = this.props;

    const orderId = await checkoutDao.submit(cart, order);

    if (orderId) {
      cart.trackCartItems();
      siteAnalytics.setProductAction('purchase', {
        id: orderId,
        revenue: cart.size * CERTIFICATE_COST / 100,
      });
      siteAnalytics.sendEvent('UX', 'click', 'submit order');

      runInAction(() => {
        cart.clear();
        this.order = new Order();
      });

      await Router.push(
        `/death/checkout?page=confirmation&orderId=${encodeURIComponent(
          orderId
        )}&contactEmail=${encodeURIComponent(order.info.contactEmail)}`,
        '/death/checkout'
      );

      window.scroll(0, 0);

      return true;
    } else {
      return false;
    }
  };

  render() {
    const { order } = this;
    const { info, cart, stripe } = this.props;

    switch (info.page) {
      case 'shipping':
        return (
          <ShippingContent
            cart={cart}
            order={order}
            submit={this.advanceToPayment}
          />
        );

      case 'payment':
        return (
          <PaymentContent
            stripe={stripe}
            cart={cart}
            order={order}
            submit={this.advanceToReview}
          />
        );

      case 'review':
        return (
          <ReviewContent cart={cart} order={order} submit={this.submitOrder} />
        );

      case 'confirmation':
        return (
          <ConfirmationContent
            orderId={info.orderId}
            contactEmail={info.contactEmail}
          />
        );
    }
  }
}

export default (CheckoutPageController as any) as React.ComponentClass<
  Props
> & {
  getInitialProps: (typeof CheckoutPageController)['getInitialProps'];
};
