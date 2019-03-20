// Wrapper controller for the separate pages along the checkout flow

import React from 'react';
import { observer } from 'mobx-react';
import Router from 'next/router';

import { PageDependencies, GetInitialProps } from '../../pages/_app';
import Order, { OrderInfo } from '../models/Order';
import { BIRTH_CERTIFICATE_COST } from '../../lib/costs';

import ShippingContent from '../common/checkout/ShippingContent';
import PaymentContent from '../common/checkout/PaymentContent';
import ReviewContent from '../common/checkout/ReviewContent';
import CheckoutPageLayout from '../common/checkout/CheckoutPageLayout';
import BirthConfirmationContent from './BirthConfirmationContent';

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
      stepCount: number;
    };

interface InitialProps {
  info: PageInfo;
}

export type PageDependenciesProps = Pick<
  PageDependencies,
  | 'birthCertificateRequest'
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
/**
 * This is currently copied over from death’s checkout page, though some
 * elements could potentially be generalized out from them.
 */
export default class BirthCheckoutPage extends React.Component<Props, State> {
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
          orderId: query.orderId || '',
          contactEmail: query.contactEmail || '',
          stepCount: parseInt(query.stepCount || '8'),
        };
        break;
      default:
        info = { page: 'shipping' };
        break;
    }

    return { info };
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      order: props.orderForTest || null,
    };
  }

  async componentDidMount() {
    this.reportCheckoutStep(this.props);

    const { orderProvider, siteAnalytics } = this.props;

    // If any of the question steps are not complete (i.e. user backed up,
    // changed an answer, and used the browser “forward” button), return to the
    // beginning of the questions flow.
    if (this.props.birthCertificateRequest.questionStepsComplete === false) {
      // todo: improve this experience
      // todo: behavior is duplicated in ReviewRequestPage.tsx

      siteAnalytics.sendEvent('question results lost', {
        category: 'Birth',
        label: `checkout: ${this.props.info.page}`,
      });

      return Router.push('/birth');
    }

    if (this.state.order) {
      return;
    }

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

  reportCheckoutStep({ info, siteAnalytics }: Props) {
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
      this.birthCertificateProduct();

      siteAnalytics.setProductAction('checkout', { step: checkoutStep });
    }
  }

  advanceToPayment = async (shippingInfo: Partial<OrderInfo>) => {
    const { order } = this.state;

    if (!order) {
      return;
    }

    order.updateInfo(shippingInfo);

    await Router.push('/birth/checkout?page=payment');

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

    await Router.push('/birth/checkout?page=review');

    window.scroll(0, 0);
  };

  /**
   * Submits the order.
   *
   * Will throw exceptions if things didn’t go well.
   */
  submitOrder = async () => {
    const {
      checkoutDao,
      birthCertificateRequest,
      siteAnalytics,
      orderProvider,
    } = this.props;

    const { order } = this.state;

    if (!order) {
      return;
    }

    const orderId = await checkoutDao.submitBirthCertificateRequest(
      birthCertificateRequest,
      order
    );

    this.birthCertificateProduct();

    siteAnalytics.setProductAction('purchase', {
      id: orderId,
      revenue: birthCertificateRequest.quantity * BIRTH_CERTIFICATE_COST / 100,
    });

    siteAnalytics.sendEvent('click', {
      category: 'Birth',
      label: 'submit order',
    });

    siteAnalytics.sendEvent('ship to city', {
      category: 'Birth',
      label: `${order.info.shippingCity}, ${order.info.shippingState}`,
    });

    siteAnalytics.sendEvent('ship to state', {
      category: 'Birth',
      label: order.info.shippingState,
    });

    siteAnalytics.sendEvent('place order', {
      category: 'Birth',
      label: 'certificate quantity',
      value: birthCertificateRequest.quantity,
    });

    const stepCount = birthCertificateRequest.steps.length;

    birthCertificateRequest.clearBirthCertificateRequest();
    orderProvider.clear();

    this.setState(
      {
        order: await orderProvider.get(),
      },
      async () => {
        await Router.push(
          `/birth/checkout?page=confirmation&orderId=${encodeURIComponent(
            orderId
          )}&contactEmail=${encodeURIComponent(
            order.info.contactEmail
          )}&stepCount=${stepCount}`,
          '/birth/checkout?page=confirmation'
        );

        window.scroll(0, 0);
      }
    );
  };

  birthCertificateProduct() {
    this.props.siteAnalytics.addProduct(
      '0',
      'Birth certificate',
      'Birth certificate',
      this.props.birthCertificateRequest.quantity,
      BIRTH_CERTIFICATE_COST / 100
    );
  }

  render() {
    const { info, birthCertificateRequest, stripe } = this.props;
    const { order } = this.state;

    const progressSteps = birthCertificateRequest.steps.length;

    // This happens during server side rendering
    if (!order) {
      return <CheckoutPageLayout certificateType="birth" />;
    }

    switch (info.page) {
      case 'shipping':
        return (
          <ShippingContent
            certificateType="birth"
            birthCertificateRequest={birthCertificateRequest}
            order={order}
            submit={this.advanceToPayment}
            progress={{
              currentStep:
                birthCertificateRequest.steps.indexOf('shippingInformation') +
                1,
              currentStepCompleted: false,
              totalSteps: progressSteps,
            }}
          />
        );

      case 'payment':
        return (
          <PaymentContent
            certificateType="birth"
            stripe={stripe}
            birthCertificateRequest={birthCertificateRequest}
            order={order}
            submit={this.advanceToReview}
            progress={{
              currentStep:
                birthCertificateRequest.steps.indexOf('billingInformation') + 1,
              currentStepCompleted: false,
              totalSteps: progressSteps,
            }}
          />
        );

      case 'review':
        return (
          <ReviewContent
            certificateType="birth"
            birthCertificateRequest={birthCertificateRequest}
            order={order}
            submit={this.submitOrder}
            progress={{
              currentStep:
                birthCertificateRequest.steps.indexOf('submitRequest') + 1,
              currentStepCompleted: false,
              totalSteps: progressSteps,
            }}
          />
        );

      case 'confirmation':
        return (
          <BirthConfirmationContent
            contactEmail={info.contactEmail}
            orderId={info.orderId}
            stepCount={info.stepCount}
          />
        );
    }
  }
}
