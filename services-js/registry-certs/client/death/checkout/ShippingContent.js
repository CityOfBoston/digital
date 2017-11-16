// @flow

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import type Cart from '../../store/Cart';
import type Order, { OrderInfo } from '../../models/Order';

import OrderDetails from './OrderDetails';

export type Props = {|
  submit: () => mixed,
  cart: Cart,
  order: Order,
  showErrorsForTest?: boolean,
|};

type State = {|
  touchedFields: { [$Keys<OrderInfo>]: boolean },
|};

@observer
export default class ShippingContent extends React.Component<Props, State> {
  state = {
    // We keep track of what the user has tabbed through so we don't show
    // "required" errors for everything all at once.
    touchedFields: {},
  };

  handleSubmit = (ev: SyntheticInputEvent<*>) => {
    ev.preventDefault();

    const { submit } = this.props;
    submit();
  };

  fieldListeners(fieldName: $Keys<OrderInfo>) {
    return {
      onBlur: action(`onBlur ${fieldName}`, () => {
        const { touchedFields } = this.state;

        this.setState({
          touchedFields: { ...touchedFields, [fieldName]: true },
        });
      }),

      onChange: action(
        `onChange ${fieldName}`,
        (ev: SyntheticInputEvent<*>) => {
          if (fieldName === 'billingAddressSameAsShippingAddress') {
            return;
          }

          const { order } = this.props;
          order.info[fieldName] = ev.target.value;
        }
      ),
    };
  }

  errorForField(fieldName: $Keys<OrderInfo>): ?string {
    const { order, showErrorsForTest } = this.props;
    const { touchedFields } = this.state;

    const errors = order.shippingErrors[fieldName];

    return (touchedFields[fieldName] || showErrorsForTest) &&
      errors &&
      errors[0]
      ? errors[0]
      : null;
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
        shippingCompanyName,
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

        <div className="p-a300 b--g">
          <div className="sh sh--b0 m-t300" style={{ paddingBottom: 0 }}>
            <h1 className="sh-title" style={{ marginBottom: 0 }}>
              Checkout
            </h1>
          </div>
        </div>

        <OrderDetails cart={cart} />

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
                  Full Name <span className="t--req">Required</span>
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Full name"
                  {...this.fieldListeners('contactName')}
                  className={`txt-f txt-f--100 ${this.renderErrorClassName(
                    'contactName'
                  )}`}
                  value={contactName}
                />

                {this.renderError('contactName')}
              </div>

              <div className="txt">
                <label htmlFor="contact-email" className="txt-l txt-l--mt000">
                  Email Address <span className="t--req">Required</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  {...this.fieldListeners('contactEmail')}
                  className={`txt-f txt-f--100 ${this.renderErrorClassName(
                    'contactEmail'
                  )}`}
                  value={contactEmail}
                />

                {this.renderError('contactEmail')}
              </div>

              <div className="txt">
                <label htmlFor="contact-phone" className="txt-l txt-l--mt000">
                  Phone Number <span className="t--req">Required</span>
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="phone"
                  placeholder="Phone number"
                  {...this.fieldListeners('contactPhone')}
                  className={`txt-f txt-f--100 ${this.renderErrorClassName(
                    'contactPhone'
                  )}`}
                  value={contactPhone}
                />

                {this.renderError('contactPhone')}
              </div>
            </fieldset>
          </div>

          <div className="b--w p-a300 field-container">
            <fieldset>
              <legend className="stp m-b300">Shipping Address</legend>

              <div className="txt">
                <label htmlFor="shipping-name" className="txt-l txt-l--mt000">
                  Full name <span className="t--req">Required</span>
                </label>
                <input
                  id="shipping-name"
                  name="shipping-name"
                  type="text"
                  placeholder="Full name"
                  {...this.fieldListeners('shippingName')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingName'
                  )}`}
                  value={shippingName}
                />

                {this.renderError('shippingName')}
              </div>

              <div className="txt">
                <label
                  htmlFor="shipping-company-name"
                  className="txt-l txt-l--mt000"
                >
                  Company Name (optional)
                </label>
                <input
                  id="shipping-company-name"
                  name="shipping-company-name"
                  type="text"
                  placeholder="Company Name"
                  {...this.fieldListeners('shippingCompanyName')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingCompanyName'
                  )}`}
                  value={shippingCompanyName}
                />

                {this.renderError('shippingCompanyName')}
              </div>

              <div className="txt">
                <label
                  htmlFor="shipping-address-1"
                  className="txt-l txt-l--mt000"
                >
                  Address Line 1 <span className="t--req">Required</span>
                </label>
                <input
                  id="shipping-address-1"
                  name="shipping-address-1"
                  type="text"
                  placeholder="Address Line 1"
                  {...this.fieldListeners('shippingAddress1')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingAddress1'
                  )}`}
                  value={shippingAddress1}
                />

                {this.renderError('shippingAddress1')}
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
                  {...this.fieldListeners('shippingAddress2')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingAddress2'
                  )}`}
                  value={shippingAddress2}
                />

                {this.renderError('shippingAddress2')}
              </div>

              <div className="txt">
                <label htmlFor="shipping-city" className="txt-l txt-l--mt000">
                  City <span className="t--req">Required</span>
                </label>
                <input
                  id="shipping-city"
                  name="shipping-city"
                  type="text"
                  placeholder="City"
                  {...this.fieldListeners('shippingCity')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingCity'
                  )}`}
                  value={shippingCity}
                />

                {this.renderError('shippingCity')}
              </div>

              <div className="txt">
                <label htmlFor="shipping-state" className="txt-l txt-l--mt000">
                  State <span className="t--req">Required</span>
                </label>
                <input
                  id="shipping-state"
                  name="shipping-state"
                  placeholder="State"
                  {...this.fieldListeners('shippingState')}
                  className={`txt-f txt-f--50 ${this.renderErrorClassName(
                    'shippingState'
                  )}`}
                  max="2"
                  value={shippingState}
                />

                {this.renderError('shippingState')}
              </div>

              <div className="txt">
                <label htmlFor="shipping-zip" className="txt-l txt-l--mt000">
                  ZIP Code <span className="t--req">Required</span>
                </label>
                <input
                  id="shipping-zip"
                  name="shipping-zip"
                  placeholder="ZIP code"
                  {...this.fieldListeners('shippingZip')}
                  className={`txt-f txt-f--50 ${this.renderErrorClassName(
                    'shippingZip'
                  )}`}
                  value={shippingZip}
                />

                {this.renderError('shippingZip')}
              </div>
            </fieldset>
          </div>

          <div className="g g--r p-a300 b--w">
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

  renderError(fieldName: $Keys<OrderInfo>) {
    const error = this.errorForField(fieldName);
    return error && <div className="t--subinfo t--err m-t100">{error}</div>;
  }

  renderErrorClassName(fieldName: $Keys<OrderInfo>) {
    const error = this.errorForField(fieldName);
    return error ? 'txt-f--err' : '';
  }
}
