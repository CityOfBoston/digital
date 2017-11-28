// @flow

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { observer } from 'mobx-react';

import { PERCENTAGE_STRING, FIXED_STRING } from '../../../lib/costs';

import type Cart from '../../store/Cart';
import type Order from '../../models/Order';

import CostSummary from '../../common/CostSummary';
import OrderDetails from './OrderDetails';

export type Props = {|
  submit: (cardElement: ?StripeElement) => mixed,
  cart: Cart,
  order: Order,
  showErrorsForTest?: boolean,
|};

@observer
export default class ReviewContent extends React.Component<Props> {
  handleSubmit = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    const { submit } = this.props;
    submit();
  };

  render() {
    const { cart, order } = this.props;

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
      billingAddress1,
      billingAddress2,
      billingCity,
      billingState,
      billingZip,
    } = order;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate Payment</title>
        </Head>

        <div className="p-a300">
          <div className="sh sh--b0 m-t300" style={{ paddingBottom: 0 }}>
            <h1 className="sh-title" style={{ marginBottom: 0 }}>
              Review Order
            </h1>
          </div>
        </div>

        <div className="p-a300 t--info">
          Your order is not yet complete. Please check the information below,
          then click the <b>Submit Order</b> button.
        </div>

        <form
          className="m-b300"
          acceptCharset="UTF-8"
          method="post"
          onSubmit={this.handleSubmit}
        >
          <OrderDetails cart={cart} fixed />

          <div className="b--w p-a300 field-container">
            <fieldset>
              <legend className="m-b300">
                <span className="stp" style={{ display: 'inline-block' }}>
                  Shipping Address
                </span>{' '}
                —{' '}
                <Link href="/death/checkout?page=shipping" as="/death/checkout">
                  <a style={{ fontStyle: 'italic' }}>edit</a>
                </Link>
              </legend>
              {`${shippingName}${shippingCompanyName
                ? ` — ${shippingCompanyName}`
                : ''}`}
              <br />
              {`${shippingAddress1}${shippingAddress2
                ? `, ${shippingAddress2}`
                : ''}, ${shippingCity} ${shippingState} ${shippingZip}`}
            </fieldset>
          </div>

          <div className="b--g p-a300 field-container">
            <fieldset>
              <legend className="m-b300">
                <span className="stp" style={{ display: 'inline-block' }}>
                  Payment Information
                </span>{' '}
                —{' '}
                <Link href="/death/checkout?page=payment" as="/death/checkout">
                  <a style={{ fontStyle: 'italic' }}>edit</a>
                </Link>
              </legend>
              {`${cardholderName} — XXXX XXXX XXXX ${cardLast4 || ''}`}
              <br />
              {`${billingAddress1}${billingAddress2
                ? `, ${billingAddress2}`
                : ''}, ${billingCity} ${billingState} ${billingZip}`}
            </fieldset>
          </div>

          <div className="p-a300">
            <CostSummary cart={cart} />
          </div>

          <div className="g p-a300">
            <div className="g--9 t--info">
              Pressing the “Submit Order” button will charge the total amount to
              your credit card and place an order with the Registry.{' '}
              <strong>Certificates are non-refundable.</strong>
            </div>

            <p className="g--9 t--subinfo">
              <a name="service-fee" />
              * You are charged an extra service fee of {FIXED_STRING} plus{' '}
              {PERCENTAGE_STRING}. This fee goes directly to a third party to
              pay for the cost of credit card processing. Learn more about{' '}
              <a href="https://www.boston.gov/">credit card service fees</a> at
              the City of Boston.
            </p>

            {processingError && (
              <div className="g--9 t--subinfo t--err m-t300">
                {processingError}
              </div>
            )}
          </div>

          <div className="g g--r p-a300 b--w">
            <button
              className="g--3 btn m-v500"
              type="submit"
              disabled={!paymentIsComplete || !shippingIsComplete || processing}
            >
              Submit Order
            </button>
          </div>

          <style jsx>{`
            button {
              align-self: center;
            }
            fieldset {
              border: 0;
              padding: 0.01em 0 0 0;
              margin: 0;
              min-width: 0;
            }
            legend {
              padding: 0;
              display: table;
            }
          `}</style>
        </form>
      </div>
    );
  }
}
