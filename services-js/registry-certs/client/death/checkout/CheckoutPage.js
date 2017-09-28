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

type InitialProps = {
  page: 'shipping' | 'payment',
};

type CheckoutContentProps =
  | {
      page: 'shipping',
      props: ShippingContentProps,
    }
  | {
      page: 'payment',
      props: PaymentContentProps,
    };

export function wrapCheckoutPageController(
  getDependencies: (ctx?: ClientContext) => ClientDependencies,
  renderContent: (ClientDependencies, CheckoutContentProps) => ?ReactElement<*>
) {
  return class CheckoutPageController extends React.Component<InitialProps> {
    static getInitialProps({ query, res }: ClientContext): InitialProps {
      let page;

      switch (query.page || '') {
        case '':
        case 'shipping':
          page = 'shipping';
          break;
        case 'payment':
          page = 'payment';
          break;
        default:
          page = 'shipping';

          if (res) {
            res.writeHead(301, {
              Location: '/death/checkout',
            });
            res.end();
            res.finished = true;
          }
      }

      return { page };
    }

    dependencies = getDependencies();

    advanceToPayment = async () => {
      await Router.push('/death/checkout?page=payment');
      window.scrollTo(0, 0);
    };

    submitOrder = () => {};

    render() {
      const { cart, order } = this.dependencies;
      const { page } = this.props;

      let props;
      switch (page) {
        case 'shipping':
          props = {
            page: 'shipping',
            props: { cart, order, submit: this.advanceToPayment },
          };
          break;
        case 'payment':
          props = {
            page: 'payment',
            props: { cart, order, submit: this.submitOrder },
          };
          break;
        default:
          throw new Error(`Unknown page: ${page}`);
      }

      return renderContent(this.dependencies, props);
    }
  };
}

export default wrapCheckoutPageController(getDependencies, (_, props) => {
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
    default:
      throw new Error(`Unknown page: ${props.page}`);
  }
});
