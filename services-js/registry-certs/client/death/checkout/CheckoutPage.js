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

      switch (query.page || '') {
        case '':
        case 'shipping':
          props = { page: 'shipping' };
          break;
        case 'payment':
          props = { page: 'payment' };
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

          if (res) {
            res.writeHead(301, {
              Location: '/death/checkout',
            });
            res.end();
            res.finished = true;
          }
      }

      return props;
    }

    dependencies = getDependencies();

    advanceToPayment = async () => {
      await Router.push('/death/checkout?page=payment');
      window.scrollTo(0, 0);
    };

    submitOrder = async () => {
      const { order } = this.dependencies;

      const orderId = '123-456-7';

      await Router.push(
        `/death/checkout?page=confirmation&orderId=${encodeURIComponent(
          orderId
        )}&contactEmail=${encodeURIComponent(order.info.contactEmail)}`,
        '/death/checkout?page=confirmation'
      );

      window.scrollTo(0, 0);
    };

    render() {
      const { cart, order } = this.dependencies;
      const props = this.props;

      let renderProps;
      switch (props.page) {
        case 'shipping':
          renderProps = {
            page: 'shipping',
            props: { cart, order, submit: this.advanceToPayment },
          };
          break;
        case 'payment':
          renderProps = {
            page: 'payment',
            props: { cart, order, submit: this.submitOrder },
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
            <ShippingContent {...props.props} />
          </AppLayout>
        );
      case 'payment':
        return (
          <AppLayout navProps={null}>
            <PaymentContent {...props.props} />
          </AppLayout>
        );
      case 'confirmation':
        return (
          <AppLayout navProps={{ cart, link: 'lookup' }}>
            <ConfirmationContent {...props.props} />
          </AppLayout>
        );
      default:
        throw new Error(`Unknown page: ${props.page}`);
    }
  }
);
