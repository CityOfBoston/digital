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
export default class ShippingContent extends React.Component<Props> {
  handleSubmit = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    const { submit } = this.props;
    submit();
  };

  setField(fieldName: $Keys<OrderInfo>) {
    return action(`onChange ${fieldName}`, (ev: SyntheticInputEvent<*>) => {
      if (fieldName === 'billingAddressSameAsShippingAddress') {
        return;
      }

      const { order } = this.props;
      order.info[fieldName] = ev.target.value;
    });
  }

  render() {
    const { cart, order } = this.props;

    const {
      shippingIsComplete,
      info: {
        contactName,
        contactEmail,
        contactPhone,

        shippingName,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingZip,
      },
    } = order;

    return (
      <div>
        <Head>
          <title>Boston.gov — Death Certificate Checkout</title>
        </Head>

        <div className="p-a300">
          <div className="sh sh--b0 m-v300">
            <h1 className="sh-title">Checkout</h1>
          </div>

          <OrderDetails cart={cart} />
        </div>

        <form
          className="m-v300"
          method="post"
          action="javascript:void(0)"
          onSubmit={this.handleSubmit}
        >
          <div className="b--w p-a300 field-container">
            <fieldset>
              <legend className="stp m-b300">Contact Information</legend>

              <div className="txt">
                <label htmlFor="contact-name" className="txt-l txt-l--mt000">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="name"
                  placeholder="Full name"
                  className="txt-f txt-f--100"
                  value={contactName}
                  onChange={this.setField('contactName')}
                />
              </div>

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
                  value={contactEmail}
                  onChange={this.setField('contactEmail')}
                />
              </div>

              <div className="txt">
                <label htmlFor="contact-phone" className="txt-l txt-l--mt000">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="phone"
                  placeholder="Phone number"
                  className="txt-f txt-f--100"
                  value={contactPhone}
                  onChange={this.setField('contactPhone')}
                />
              </div>
            </fieldset>
          </div>

          <div className="b--w p-a300 field-container">
            <fieldset>
              <legend className="stp m-b300">Shipping Address</legend>

              <div className="txt">
                <label htmlFor="shipping-name" className="txt-l txt-l--mt000">
                  Full name
                </label>
                <input
                  id="shipping-name"
                  name="shipping-name"
                  type="text"
                  placeholder="Full name"
                  className="txt-f"
                  value={shippingName}
                  onChange={this.setField('shippingName')}
                />
              </div>

              <div className="txt">
                <label
                  htmlFor="shipping-address-1"
                  className="txt-l txt-l--mt000"
                >
                  Address Line 1
                </label>
                <input
                  id="shipping-address-1"
                  name="shipping-address-1"
                  type="text"
                  placeholder="Address Line 1"
                  className="txt-f"
                  value={shippingAddress1}
                  onChange={this.setField('shippingAddress1')}
                />
              </div>

              <div className="txt">
                <label
                  htmlFor="shipping-address-2"
                  className="txt-l txt-l--mt000"
                >
                  Address Line 2 (optional)
                </label>
                <input
                  id="shipping-address-2"
                  name="shipping-address-2"
                  type="text"
                  placeholder="Address Line 2"
                  className="txt-f"
                  value={shippingAddress2}
                  onChange={this.setField('shippingAddress2')}
                />
              </div>

              <div className="txt">
                <label htmlFor="shipping-city" className="txt-l txt-l--mt000">
                  City
                </label>
                <input
                  id="shipping-city"
                  name="shipping-city"
                  type="text"
                  placeholder="City"
                  className="txt-f"
                  value={shippingCity}
                  onChange={this.setField('shippingCity')}
                />
              </div>

              <div className="txt">
                <label htmlFor="shipping-state" className="txt-l txt-l--mt000">
                  State
                </label>
                <input
                  id="shipping-state"
                  name="shipping-state"
                  placeholder="State"
                  className="txt-f txt-f--50"
                  max="2"
                  value={shippingState}
                  onChange={this.setField('shippingState')}
                />
              </div>

              <div className="txt">
                <label htmlFor="shipping-zip" className="txt-l txt-l--mt000">
                  ZIP Code
                </label>
                <input
                  id="shipping-zip"
                  name="shipping-zip"
                  placeholder="ZIP code"
                  className="txt-f txt-f--50"
                  value={shippingZip}
                  onChange={this.setField('shippingZip')}
                />
              </div>
            </fieldset>
          </div>

          <div className="g p-a300 b--w">
            <button
              className="g--3 btn m-v500"
              type="submit"
              disabled={!shippingIsComplete}
            >
              Continue to Payment
            </button>

            <div className="g--9 m-v500">
              <Link href="/death/cart">
                <a style={{ fontStyle: 'italic' }}>← Return to cart</a>
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
