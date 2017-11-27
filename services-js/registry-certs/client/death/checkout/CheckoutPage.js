// @flow
// Wrapper controller for ShippingContent and PaymentContent

import React, { type Element as ReactElement } from 'react';
import Router from 'next/router';

import {
  getDependencies,
  type ClientContext,
  type ClientDependencies,
} from '../../app';

import AppLayout from '../../AppLayout';

import Order from '../../models/Order';

import PaymentContent, {
  type Props as PaymentContentProps,
} from './PaymentContent';

import ShippingContent, {
  type Props as ShippingContentProps,
} from './ShippingContent';

import ConfirmationContent, {
  type Props as ConfirmationContentProps,
} from './ConfirmationContent';

type InitialProps =
  | {
      page: 'shipping',
    }
  | {
      page: 'payment',
    }
  | {
      page: 'confirmation',
      orderId: string,
      contactEmail: string,
    };

type CheckoutContentProps =
  | {
      page: 'shipping',
      props: ShippingContentProps,
    }
  | {
      page: 'payment',
      props: PaymentContentProps,
    }
  | {
      page: 'confirmation',
      props: ConfirmationContentProps,
    };

export function wrapCheckoutPageController(
  getDependencies: (ctx?: ClientContext) => ClientDependencies,
  renderContent: (ClientDependencies, CheckoutContentProps) => ?ReactElement<*>
) {
  return class CheckoutPageController extends React.Component<InitialProps> {
    static getInitialProps({ query, res }: ClientContext): InitialProps {
      let props: InitialProps;
      let redirectToShippingIfServer = false;

      switch (query.page || '') {
        case '':
        case 'shipping':
          props = { page: 'shipping' };
          break;
        case 'payment':
          props = { page: 'payment' };

          // We know that we won't have shipping information if someone visits
          // the payment page directly from the server (since this component's
          // internal state will be blank), so redirect.
          redirectToShippingIfServer = true;
          break;
        case 'confirmation':
          props = {
            page: 'confirmation',
            orderId: query.orderId || '',
            contactEmail: query.contactEmail || '',
          };
          break;
        default:
          props = { page: 'shipping' };
          redirectToShippingIfServer = true;
      }

      if (redirectToShippingIfServer && res) {
        res.writeHead(301, {
          Location: '/death/checkout',
        });
        res.end();
        res.finished = true;
      }

      return props;
    }

    dependencies = getDependencies();

    // This wil persist across different sub-pages since React will preserve the
    // component instance. This will keep the form fields filled out as the user
    // goes forward and back in the interface, and it will get automatically
    // disposed of if the user leaves the flow, which is the behavior that we
    // want.
    order: Order;

    componentWillMount() {
      const { orderProvider } = this.dependencies;
      // This will be populated from localStorage, and changes to it will get
      // written back there.
      this.order = orderProvider.get();
    }

    componentDidMount() {
      this.redirectIfMissingShipping(this.props);
    }

    componentWillReceiveProps(newProps: InitialProps) {
      this.redirectIfMissingShipping(newProps);
    }

    // In the case of reloading from the browser, for example, or clicking
    // "back" from the confirmation page.
    async redirectIfMissingShipping(props: InitialProps) {
      if (props.page === 'payment' && !this.order.shippingIsComplete) {
        await Router.push('/death/checkout?page=shipping');
        window.scrollTo(0, 0);
      }
    }

    advanceToPayment = async () => {
      await Router.push('/death/checkout?page=payment');
      window.scrollTo(0, 0);
    };

    submitOrder = async (cardElement: ?StripeElement) => {
      const { order } = this;
      const { cart, checkoutDao } = this.dependencies;

      const orderId = await checkoutDao.submit(cart, order, cardElement);

      if (orderId) {
        this.order = new Order();

        await Router.push(
          `/death/checkout?page=confirmation&orderId=${encodeURIComponent(
            orderId
          )}&contactEmail=${encodeURIComponent(order.info.contactEmail)}`,
          '/death/checkout?page=confirmation'
        );

        window.scrollTo(0, 0);
      }
    };

    render() {
      const { props, order } = this;
      const { cart, stripe } = this.dependencies;

      let renderProps;
      switch (props.page) {
        case 'shipping':
          renderProps = {
            page: 'shipping',
            props: {
              cart,
              order,
              submit: this.advanceToPayment,
            },
          };
          break;
        case 'payment':
          renderProps = {
            page: 'payment',
            props: {
              stripe,
              cart,
              order,
              submit: this.submitOrder,
            },
          };
          break;
        case 'confirmation':
          renderProps = {
            page: 'confirmation',
            props: {
              orderId: props.orderId,
              contactEmail: props.contactEmail,
            },
          };
          break;
        default:
          throw new Error(`Unknown page: ${(props.page: any)}`);
      }

      return renderContent(this.dependencies, renderProps);
    }
  };
}

export default wrapCheckoutPageController(
  getDependencies,
  ({ cart }, props) => {
    switch (props.page) {
      case 'shipping':
        return (
          <AppLayout navProps={null}>
            {React.createElement(ShippingContent, props.props)}
          </AppLayout>
        );
      case 'payment':
        return (
          <AppLayout navProps={null}>
            {React.createElement(PaymentContent, props.props)}
          </AppLayout>
        );
      case 'confirmation':
        return (
          <AppLayout navProps={{ cart, link: 'lookup' }}>
            {React.createElement(ConfirmationContent, props.props)}
          </AppLayout>
        );
      default:
        throw new Error(`Unknown page: ${props.page}`);
    }
  }
);
