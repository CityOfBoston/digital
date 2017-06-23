// @flow

import React from 'react';
import Head from 'next/head';
import { observer } from 'mobx-react';

import { CERTIFICATE_COST, PROCESSING_FEE } from '../store/Cart';
import type Cart from '../store/Cart';
import Nav from '../common/Nav';

export type InitialProps = {||};

export type Props = {
  /* :: ...InitialProps, */
  cart: Cart,
};

@observer
export default class PaymentPage extends React.Component {
  props: Props;

  handleSubmit = (ev: SyntheticInputEvent) => {
    ev.preventDefault();
  };

  render() {
    const { cart } = this.props;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate Payment</title>
        </Head>

        <Nav cart={cart} link="lookup" />

        <div className="p-a300">
          <div className="sh sh--b0 m-v300">
            <h1 className="sh-title">Pay and Finish</h1>
          </div>

          <button className="sel-c sel-c--fw" type="button">
            <div className="sel-f">
              <div className="t--sans tt-u lnk">Order Details</div>
              <div className="t--info">
                {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} ×
                ${CERTIFICATE_COST} + fee = ${cart.cost.toFixed(2)}
              </div>
            </div>
          </button>

          <style jsx>{`
            button {
              padding: 0;
              border-width: 0;
              font-size: inherit;
            }
            .sel-f {
              text-align: left;
              padding: .5rem;
            }
            .sel-c:after {
              background-image: url(https://cob-patterns-staging.herokuapp.com/images/global/icons/chevron-blue.svg);
              background-color: white;
            }
          `}</style>
        </div>

        <form
          className="m-v300"
          acceptCharset="UTF-8"
          method="post"
          action="/death/payment"
          onSubmit={this.handleSubmit}>
          <div className="b--w p-a500 field-container">
            <fieldset>
              <legend className="stp m-b300">Contact</legend>

              <div className="txt">
                <label htmlFor="contact-email" className="txt-l txt-l--mt000">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  className="txt-f txt-f--100"
                />
              </div>

              <div className="txt">
                <label htmlFor="contact-phone" className="txt-l">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="phone"
                  placeholder="Phone number"
                  className="txt-f txt-f--100"
                />
              </div>
            </fieldset>
          </div>

          <div className="b--w p-a500 field-container">
            <fieldset>
              <legend className="stp m-b300">Credit Card Information</legend>

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
                <label htmlFor="card-number" className="txt-l">
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
                <label htmlFor="card-date" className="txt-l">
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

          <div className="b--w p-a500 field-container">
            <fieldset>
              <legend className="stp m-b300">Billing Information</legend>

              <div className="txt">
                <label
                  htmlFor="billing-address-1"
                  className="txt-l txt-l--mt000">
                  Address Line 1
                </label>
                <input
                  id="billing-address-1"
                  name="billing-address-1"
                  type="text"
                  placeholder="Address Line 1"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label
                  htmlFor="billing-address-2"
                  className="txt-l txt-l--mt000">
                  Address Line 2
                </label>
                <input
                  id="billing-address-2"
                  name="billing-address-2"
                  type="text"
                  placeholder="Address Line 2"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label htmlFor="billing-city" className="txt-l">City</label>
                <input
                  id="billing-city"
                  name="billing-city"
                  type="text"
                  placeholder="City"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label htmlFor="billing-state" className="txt-l">State</label>
                <input
                  id="billing-state"
                  name="billing-state"
                  placeholder="State"
                  className="txt-f txt-f--50"
                />
              </div>

              <div className="txt">
                <label htmlFor="billing-zip" className="txt-l">ZIP Code</label>
                <input
                  id="billing-zip"
                  name="billing-zip"
                  placeholder="ZIP code"
                  className="txt-f txt-f--50"
                />
              </div>
            </fieldset>
          </div>

          <div className="b--w p-a500 field-container">
            <fieldset>
              <legend className="stp m-b300">Shipping Information</legend>

              <div className="txt">
                <label
                  htmlFor="shipping-address-1"
                  className="txt-l txt-l--mt000">
                  Address Line 1
                </label>
                <input
                  id="shipping-address-1"
                  name="shipping-address-1"
                  type="text"
                  placeholder="Address Line 1"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label
                  htmlFor="shipping-address-2"
                  className="txt-l txt-l--mt000">
                  Address Line 2
                </label>
                <input
                  id="shipping-address-2"
                  name="shipping-address-2"
                  type="text"
                  placeholder="Address Line 2"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label htmlFor="shipping-city" className="txt-l">City</label>
                <input
                  id="shipping-city"
                  name="shipping-city"
                  type="text"
                  placeholder="City"
                  className="txt-f"
                />
              </div>

              <div className="txt">
                <label htmlFor="shipping-state" className="txt-l">State</label>
                <input
                  id="shipping-state"
                  name="shipping-state"
                  placeholder="State"
                  className="txt-f txt-f--50"
                />
              </div>

              <div className="txt">
                <label htmlFor="shipping-zip" className="txt-l">ZIP Code</label>
                <input
                  id="shipping-zip"
                  name="shipping-zip"
                  placeholder="ZIP code"
                  className="txt-f txt-f--50"
                />
              </div>
            </fieldset>
          </div>

          <div className="g p-a500 b--w">
            <button className="g--3 btn m-v500" type="submit">Submit</button>
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

  renderCost() {
    const { cart } = this.props;

    return (
      <div className="m-v500 g--9">
        <div className="t--info">
          {cart.size} {cart.size === 1 ? 'certificate' : 'certificates'} × ${CERTIFICATE_COST}{' '}
          + {(PROCESSING_FEE * 100).toFixed(2)}% credit card fee
        </div>
        <div className="sh sh--b0">
          <span className="sh-title">Subtotal: ${cart.cost.toFixed(2)}</span>
        </div>
      </div>
    );
  }
}
