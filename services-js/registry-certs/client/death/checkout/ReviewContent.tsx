// @flow

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { observer } from 'mobx-react';

import AppLayout from '../../AppLayout';

import {
  PERCENTAGE_CC_STRING,
  FIXED_CC_STRING,
  SERVICE_FEE_URI,
} from '../../../lib/costs';

import Cart from '../../store/Cart';
import Order from '../../models/Order';

import CostSummary from '../../common/CostSummary';
import OrderDetails from './OrderDetails';

export interface Props {
  submit: (cardElement?: stripe.elements.Element) => unknown;
  cart: Cart;
  order: Order;
  showErrorsForTest?: boolean;
}

export interface State {
  acceptNonRefundable: boolean;
  acceptPendingCertificates: boolean;
}

@observer
export default class ReviewContent extends React.Component<Props, State> {
  state: State = {
    acceptNonRefundable: false,
    acceptPendingCertificates: false,
  };

  componentWillMount() {
    // When we land on this page we create a new idempotency key so that our
    // submission will only be processed once.
    const { order } = this.props;
    order.regenerateIdempotencyKey();
  }

  handleAcceptNonRefundable = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ acceptNonRefundable: ev.target.checked });
  };

  handleAcceptPendingCertificates = (
    ev: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({ acceptPendingCertificates: ev.target.checked });
  };

  handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const { submit, order } = this.props;
    const success = await submit();

    if (!success) {
      // If there's an error we need to regenerate the key to allow another
      // submission to occur.
      order.regenerateIdempotencyKey();
    }
  };

  render() {
    const { cart, order } = this.props;
    const { acceptNonRefundable, acceptPendingCertificates } = this.state;

    const {
      paymentIsComplete,
      shippingIsComplete,
      processing,
      processingError,
      info: {
        shippingName,
        shippingCompanyName,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingZip,

        cardholderName,
        cardLast4,
      },
      cardFunding,
      billingAddress1,
      billingAddress2,
      billingCity,
      billingState,
      billingZip,
    } = order;

    const needsAccepting =
      !acceptNonRefundable ||
      (cart.containsPending && !acceptPendingCertificates);

    return (
      <AppLayout>
        <div className="b-c b-c--hsm b-c--nbp">
          <Head>
            <title>Boston.gov — Death Certificate Payment</title>
          </Head>

          <div className="sh sh--b0">
            <h1 className="sh-title">Review Order</h1>
          </div>

          <div className="t--info m-v500">
            Your order is not yet complete. Please check the information below,
            then click the <b>Submit Order</b> button.
          </div>

          <form
            acceptCharset="UTF-8"
            method="post"
            onSubmit={this.handleSubmit}
          >
            <OrderDetails cart={cart} fixed />

            <div className="m-v700">
              <div className="fs-l">
                <div className="fs-l-c">
                  Shipping Address
                  <span className="t--reset">
                    &nbsp;—&nbsp;
                    <span className="t--subinfo">
                      <Link
                        href="/death/checkout?page=shipping"
                        as="/death/checkout"
                      >
                        <a aria-label="Edit shipping address">edit</a>
                      </Link>
                    </span>
                  </span>
                </div>
              </div>

              <div className="t--info" style={{ fontStyle: 'normal' }}>
                {shippingName}
                <br />
                {shippingCompanyName
                  ? [shippingCompanyName, <br key="br" />]
                  : null}
                {shippingAddress1}
                <br />
                {shippingAddress2 ? [shippingAddress2, <br key="br" />] : null}
                {`${shippingCity}, ${shippingState} ${shippingZip}`}
              </div>
            </div>

            <div className="fs m-v700">
              <div className="fs-l">
                <div className="fs-l-c">
                  Payment Information
                  <span className="t--reset">
                    &nbsp;—&nbsp;
                    <span className="t--subinfo">
                      <Link
                        href="/death/checkout?page=payment"
                        as="/death/checkout"
                      >
                        <a aria-label="Edit payment information">edit</a>
                      </Link>
                    </span>
                  </span>
                </div>
              </div>

              <div className="t--info" style={{ fontStyle: 'normal' }}>
                {cardholderName}
                <br />
                **** **** **** {cardLast4 || ''}
                <br />
                {billingAddress1}
                <br />
                {billingAddress2 ? [billingAddress2, <br key="br" />] : null}
                {billingCity}, {billingState} {billingZip}
              </div>
            </div>

            <div className="m-v500">
              <CostSummary
                cart={cart}
                serviceFeeType={cardFunding === 'debit' ? 'DEBIT' : 'CREDIT'}
              />
            </div>

            <div className="m-v700">
              <div className="t--info">
                {cart.containsPending
                  ? 'You have to read and accept these checkboxes before you place your order:'
                  : 'You have to read and accept this checkbox before you place your order:'}
              </div>

              <div className="m-v300">
                <label className="cb">
                  <input
                    id="acceptNonRefundableInput"
                    name="acceptNonRefundable"
                    type="checkbox"
                    value="true"
                    checked={acceptNonRefundable}
                    className="cb-f"
                    onChange={this.handleAcceptNonRefundable}
                  />
                  <span className="cb-l">
                    I understand that{' '}
                    <strong>death certificates are non-refundable</strong>.
                  </span>
                </label>
              </div>

              {cart.containsPending && (
                <div className="m-v300">
                  <label className="cb">
                    <input
                      id="acceptPendingCertificatesInput"
                      name="acceptPendingCertificates"
                      type="checkbox"
                      value="true"
                      checked={acceptPendingCertificates}
                      className="cb-f"
                      onChange={this.handleAcceptPendingCertificates}
                    />
                    <span className="cb-l">
                      I understand that this order has{' '}
                      <strong>pending death certificates</strong>, which may not
                      be accepted by insurance or banking companies.
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="t--info m-v300" id="charge-message">
              Pressing the “Submit Order” button will charge the total amount to
              your credit card and place an order with the Registry.
            </div>

            {processingError && (
              <div
                className="m-v500 p-a300 br br-a100 br--r"
                id="processing-error"
              >
                <div className="t--intro t--err">
                  There’s a problem: {processingError}
                </div>
                <div className="t--info">
                  You can try again. If this keeps happening, please email{' '}
                  <a href="mailto:digital@boston.gov">digital@boston.gov</a>.
                </div>
              </div>
            )}

            <div className="m-v300">
              <button
                className="btn"
                style={{ display: 'block', width: '100%' }}
                type="submit"
                disabled={
                  !paymentIsComplete ||
                  !shippingIsComplete ||
                  needsAccepting ||
                  processing
                }
                aria-describedby={
                  processingError ? 'processing-error' : 'charge-message'
                }
              >
                Submit Order
              </button>
            </div>

            <div className="ta-c t--info m-v700">
              <Link href="/death">
                <a>I’m not done yet, go back to search</a>
              </Link>
            </div>
          </form>
        </div>

        <div className="b--g m-t700">
          <div id="service-fee" className="b-c b-c--smv b-c--hsm t--subinfo">
            * You are charged an extra service fee of not more than{' '}
            {FIXED_CC_STRING} plus {PERCENTAGE_CC_STRING}. This fee goes
            directly to a third party to pay for the cost of credit card
            processing. Learn more about{' '}
            <a href={SERVICE_FEE_URI}>credit card service fees</a> at the City
            of Boston.
          </div>
        </div>
      </AppLayout>
    );
  }
}
