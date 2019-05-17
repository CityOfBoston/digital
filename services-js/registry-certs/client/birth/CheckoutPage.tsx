// Wrapper controller for the separate pages along the checkout flow

import React from 'react';
import { observer } from 'mobx-react';
import Router from 'next/router';
import Link from 'next/link';

import { getParam } from '@cityofboston/next-client-common';

import { PageDependencies, GetInitialProps } from '../../pages/_app';
import Order, { OrderInfo } from '../models/Order';
import { CERTIFICATE_COST } from '../../lib/costs';

import ShippingContent from '../common/checkout/ShippingContent';
import PaymentContent from '../common/checkout/PaymentContent';
import ReviewContent from '../common/checkout/ReviewContent';
import CheckoutPageLayout from '../common/checkout/CheckoutPageLayout';
import BirthConfirmationContent from './BirthConfirmationContent';

const BIRTH_CERTIFICATE_COST = CERTIFICATE_COST.BIRTH;

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
          orderId: getParam(query.orderId, ''),
          contactEmail: getParam(query.contactEmail, ''),
          stepCount: parseInt(getParam(query.stepCount, '8')),
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

    const { orderProvider } = this.props;

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
      this.sendBirthCertificateProduct();

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
   * Will throw exceptions if things didn’t go well before the submission
   * happens. Those exceptions will all be reported to Rollbar, so it’s safe to
   * catch them to show a friendly message to users.
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

    const stepCount = birthCertificateRequest.steps.length;

    const orderId = await checkoutDao.submitBirthCertificateRequest(
      birthCertificateRequest,
      order
    );

    const confirmationUrl = `/birth/checkout?page=confirmation&orderId=${encodeURIComponent(
      orderId
    )}&contactEmail=${encodeURIComponent(
      order.info.contactEmail
    )}&stepCount=${stepCount}`;
    '/birth/checkout?page=confirmation';

    // If we get this far without throwing, the order has definitely succeeded,
    // so we need to catch any further errors and hide them from the user.
    try {
      this.sendBirthCertificateProduct();

      siteAnalytics.setProductAction('purchase', {
        id: orderId,
        revenue:
          (birthCertificateRequest.quantity * BIRTH_CERTIFICATE_COST) / 100,
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

      birthCertificateRequest.clearBirthCertificateRequest();
      orderProvider.clear();

      // Updating the order in the state is important in case someone clicks
      // "back" off of confirmation. We don't want to be showing the old,
      // submitted order at that point.
      this.setState(
        {
          order: await orderProvider.get(),
        },
        async () => {
          await Router.push(confirmationUrl);

          window.scroll(0, 0);
        }
      );
    } catch (e) {
      if ((window as any).Rollbar) {
        (window as any).Rollbar.error(e);
      }

      // eslint-disable-next-line no-console
      console.error(e);

      await Router.push(confirmationUrl);

      window.scroll(0, 0);
    }
  };

  sendBirthCertificateProduct() {
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

    // We short-circuit here because the confirmation page doesn’t need an order
    // or a complete birth certificate request.
    if (info.page === 'confirmation') {
      return (
        <BirthConfirmationContent
          contactEmail={info.contactEmail}
          orderId={info.orderId}
          stepCount={info.stepCount}
        />
      );
    }

    const progressSteps = birthCertificateRequest.steps.length;

    // This happens during server side rendering
    if (!order || !birthCertificateRequest.questionStepsComplete) {
      return (
        <CheckoutPageLayout certificateType="birth">
          {order && !birthCertificateRequest.questionStepsComplete && (
            <>
              <div className="t--info">
                Your birth certificate request is incomplete.
              </div>
              <div className="m-v500 ta-c">
                <Link href="/birth">
                  <a className="btn">Back to Start</a>
                </Link>
              </div>
            </>
          )}
        </CheckoutPageLayout>
      );
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
    }
  }
}
