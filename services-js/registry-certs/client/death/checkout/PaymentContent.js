// @flow

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import type Cart from '../../store/Cart';
import type Order, { OrderInfo } from '../../store/Order';

import OrderDetails from './OrderDetails';

export type Props = {
  submit: () => mixed,
  cart: Cart,
  order: Order,
};

@observer
export default class PaymentPageContent extends React.Component<Props> {
  handleSubmit = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    const { submit } = this.props;
    submit();
  };

  setField(fieldName: $Keys<OrderInfo>) {
    return action(`onChange ${fieldName}`, (ev: SyntheticInputEvent<*>) => {
      const { order } = this.props;
      order.info[fieldName] = ev.target.value;
    });
  }

  render() {
    const { cart, order } = this.props;

    const {
      billingIsComplete,
      info: {
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingZip,
        billingAddress1,
        billingAddress2,
        billingCity,
        billingState,
        billingZip,
      },
    } = order;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate Payment</title>
        </Head>

        <div className="p-a300">
          <div className="sh sh--b0 m-v300">
            <h1 className="sh-title">Pay and Finish</h1>
          </div>

          <OrderDetails cart={cart} />
        </div>

        <form
          className="m-v300"
          acceptCharset="UTF-8"
          method="post"
          action="/death/payment"
          onSubmit={this.handleSubmit}
        >
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
              {`${shippingAddress1}${shippingAddress2
                ? `, ${shippingAddress2}`
                : ''}, ${shippingCity} ${shippingState} ${shippingZip}`}
            </fieldset>
          </div>

          <div className="b--w p-a300 field-container">
            <fieldset>
              <legend className="stp m-b300">Payment method</legend>

              <div className="txt">
                <label htmlFor="card-name" className="txt-l txt-l--mt000">
                  Name on Card
                </label>
                <input
                  id="card-name"
                  name="card-name"
                  type="text"
                  placeholder="Name on card"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label htmlFor="card-number" className="txt-l txt-l--mt000">
                  Credit Card Number
                </label>
                <input
                  id="card-number"
                  name="card-number"
                  type="text"
                  placeholder="Credit Card Number"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label htmlFor="card-date" className="txt-l txt-l--mt000">
                  Expiration Date
                </label>
                <input
                  id="card-date"
                  name="card-date"
                  placeholder="mm/yy"
                  className="txt-f txt-f--50"
                />
              </div>
            </fieldset>
          </div>

          <div className="b--w p-a300 field-container">
            <fieldset>
              <legend className="stp m-b300">Billing Information</legend>

              <div className="txt">
                <label
                  htmlFor="billing-address-1"
                  className="txt-l txt-l--mt000"
                >
                  Address Line 1
                </label>
                <input
                  id="billing-address-1"
                  name="billing-address-1"
                  type="text"
                  placeholder="Address Line 1"
                  className="txt-f"
                  value={billingAddress1}
                  onChange={this.setField('billingAddress1')}
                />
              </div>

              <div className="txt">
                <label
                  htmlFor="billing-address-2"
                  className="txt-l txt-l--mt000"
                >
                  Address Line 2
                </label>
                <input
                  id="billing-address-2"
                  name="billing-address-2"
                  type="text"
                  placeholder="Address Line 2"
                  className="txt-f"
                  value={billingAddress2}
                  onChange={this.setField('billingAddress2')}
                />
              </div>

              <div className="txt">
                <label htmlFor="billing-city" className="txt-l txt-l--mt000">
                  City
                </label>
                <input
                  id="billing-city"
                  name="billing-city"
                  type="text"
                  placeholder="City"
                  className="txt-f"
                  value={billingCity}
                  onChange={this.setField('billingCity')}
                />
              </div>

              <div className="txt">
                <label htmlFor="billing-state" className="txt-l txt-l--mt000">
                  State
                </label>
                <input
                  id="billing-state"
                  name="billing-state"
                  placeholder="State"
                  className="txt-f txt-f--50"
                  max="2"
                  value={billingState}
                  onChange={this.setField('billingState')}
                />
              </div>

              <div className="txt">
                <label htmlFor="billing-zip" className="txt-l txt-l--mt000">
                  ZIP Code
                </label>
                <input
                  id="billing-zip"
                  name="billing-zip"
                  placeholder="ZIP code"
                  className="txt-f txt-f--50"
                  value={billingZip}
                  onChange={this.setField('billingZip')}
                />
              </div>
            </fieldset>
          </div>

          <div className="g p-a300 b--w">
            <button
              className="g--3 btn m-v500"
              type="submit"
              disabled={!billingIsComplete}
            >
              Submit Order
            </button>

            <div className="g--9 m-v500">
              <Link href="/death/checkout?page=shipping" as="/death/checkout">
                <a style={{ fontStyle: 'italic' }}>
                  ← Return to shipping information
                </a>
              </Link>
            </div>
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
            .txt-l {
              font-weight: normal;
              font-size: 12px;
            }
            .txt-f--100 {
              width: 100%;
            }
            .txt-f--50 {
              width: 50%;
            }
            .field-container {
              margin-bottom: 2px;
            }
          `}</style>
        </form>
      </div>
    );
  }
}
