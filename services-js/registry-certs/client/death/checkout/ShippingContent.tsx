import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import InputMask from 'react-input-mask';

import AppLayout from '../../AppLayout';

import Cart from '../../store/Cart';
import Order, { OrderInfo } from '../../models/Order';
import { makeStateSelectOptions } from '../../common/form-elements';

import OrderDetails from './OrderDetails';

export interface Props {
  submit: () => unknown;
  cart: Cart;
  order: Order;
  showErrorsForTest?: boolean;
}

interface State {
  touchedFields: Partial<{ [key in keyof OrderInfo]: boolean }>;
}

@observer
export default class ShippingContent extends React.Component<Props, State> {
  state = {
    // We keep track of what the user has tabbed through so we don't show
    // "required" errors for everything all at once.
    touchedFields: {},
  };

  handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();

    const { submit } = this.props;
    submit();
  };

  fieldListeners(fieldName: keyof OrderInfo) {
    return {
      onBlur: action(`onBlur ${fieldName}`, () => {
        const { touchedFields } = this.state;

        this.setState({
          touchedFields: { ...touchedFields, [fieldName]: true },
        });
      }),

      onChange: action(
        `onChange ${fieldName}`,
        (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { order } = this.props;

          if (
            fieldName === 'storeContactAndShipping' ||
            fieldName === 'storeBilling'
          ) {
            order.info[fieldName] = (ev.target as HTMLInputElement).checked;
          } else if (fieldName === 'billingAddressSameAsShippingAddress') {
            // not actually on this page, but we have it so that the Flow types work.
            order.info[fieldName] = ev.target.value === 'true';
          } else {
            order.info[fieldName] = ev.target.value;
          }
        }
      ),
    };
  }

  errorForField(fieldName: keyof OrderInfo): string | null {
    const { order, showErrorsForTest } = this.props;
    const { touchedFields } = this.state;

    const errors = order.shippingErrors[fieldName];

    return (touchedFields[fieldName] || showErrorsForTest) &&
      errors &&
      errors[0]
      ? errors[0]
      : null;
  }

  errorAttributes(fieldName: keyof OrderInfo) {
    if (this.errorForField(fieldName)) {
      return {
        'aria-invalid': true,
        'aria-describedby': `${fieldName}-error`,
      };
    } else {
      return {};
    }
  }

  render() {
    const { cart, order } = this.props;

    const {
      shippingIsComplete,
      info: {
        storeContactAndShipping,

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
      <AppLayout>
        <div className="b-c b-c--hsm">
          <Head>
            <title>Boston.gov — Death Certificates — Checkout</title>
          </Head>

          <div className="sh sh--b0">
            <h1 className="sh-title">Checkout</h1>
          </div>

          <div className="m-v300">
            <OrderDetails cart={cart} />
          </div>

          <form
            method="post"
            action="javascript:void(0)"
            onSubmit={this.handleSubmit}
          >
            <fieldset className="fs m-v700">
              <legend className="fs-l">Contact Information</legend>

              <div className="txt">
                <label htmlFor="contact-name" className="txt-l txt-l--sm">
                  Full Name{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Full name"
                  aria-required="true"
                  {...this.errorAttributes('contactName')}
                  {...this.fieldListeners('contactName')}
                  className={`txt-f txt-f--100 ${this.renderErrorClassName(
                    'contactName'
                  )}`}
                  value={contactName}
                />

                {this.renderError('contactName')}
              </div>

              <div className="txt">
                <label htmlFor="contact-email" className="txt-l txt-l--sm">
                  Email Address{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  aria-required="true"
                  {...this.errorAttributes('contactEmail')}
                  {...this.fieldListeners('contactEmail')}
                  className={`txt-f txt-f--100 ${this.renderErrorClassName(
                    'contactEmail'
                  )}`}
                  value={contactEmail}
                />

                {this.renderError('contactEmail')}
              </div>

              <div className="txt">
                <label htmlFor="contact-phone" className="txt-l txt-l--sm">
                  Phone Number{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <InputMask
                  mask="(999) 999-9999"
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="Phone number"
                  aria-required="true"
                  {...this.errorAttributes('contactPhone')}
                  {...this.fieldListeners('contactPhone')}
                  className={`txt-f txt-f--100 ${this.renderErrorClassName(
                    'contactPhone'
                  )}`}
                  value={contactPhone}
                />

                {this.renderError('contactPhone')}
              </div>
            </fieldset>

            <fieldset className="fs m-v700">
              <legend className="fs-l">Shipping Address</legend>

              <div className="txt">
                <label htmlFor="shipping-name" className="txt-l txt-l--sm">
                  Full name{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="shipping-name"
                  name="shipping-name"
                  type="text"
                  placeholder="Full name"
                  aria-required="true"
                  {...this.errorAttributes('shippingName')}
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
                  className="txt-l txt-l--sm"
                >
                  Company Name (optional)
                </label>
                <input
                  id="shipping-company-name"
                  name="shipping-company-name"
                  type="text"
                  placeholder="Company Name"
                  {...this.errorAttributes('shippingCompanyName')}
                  {...this.fieldListeners('shippingCompanyName')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingCompanyName'
                  )}`}
                  value={shippingCompanyName}
                />

                {this.renderError('shippingCompanyName')}
              </div>

              <div className="txt">
                <label htmlFor="shipping-address-1" className="txt-l txt-l--sm">
                  Address Line 1{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="shipping-address-1"
                  name="shipping-address-1"
                  type="text"
                  placeholder="Address Line 1"
                  aria-required="true"
                  {...this.errorAttributes('shippingAddress1')}
                  {...this.fieldListeners('shippingAddress1')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingAddress1'
                  )}`}
                  value={shippingAddress1}
                />

                {this.renderError('shippingAddress1')}
              </div>

              <div className="txt">
                <label htmlFor="shipping-address-2" className="txt-l txt-l--sm">
                  Address Line 2 (optional)
                </label>
                <input
                  id="shipping-address-2"
                  name="shipping-address-2"
                  type="text"
                  placeholder="Address Line 2"
                  {...this.errorAttributes('shippingAddress2')}
                  {...this.fieldListeners('shippingAddress2')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingAddress2'
                  )}`}
                  value={shippingAddress2}
                />

                {this.renderError('shippingAddress2')}
              </div>

              <div className="txt">
                <label htmlFor="shipping-city" className="txt-l txt-l--sm">
                  City{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="shipping-city"
                  name="shipping-city"
                  type="text"
                  placeholder="City"
                  aria-required="true"
                  {...this.errorAttributes('shippingCity')}
                  {...this.fieldListeners('shippingCity')}
                  className={`txt-f ${this.renderErrorClassName(
                    'shippingCity'
                  )}`}
                  value={shippingCity}
                />

                {this.renderError('shippingCity')}
              </div>

              {/* Adding "txt" so that we get the bottom margin right. */}
              <div className="sel txt">
                <label htmlFor="shipping-state" className="sel-l sel-l--sm">
                  State / Territory{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <div className="sel-c">
                  <select
                    id="shipping-state"
                    name="shipping-state"
                    aria-required="true"
                    {...this.errorAttributes('shippingState')}
                    {...this.fieldListeners('shippingState')}
                    className={`sel-f ${this.renderErrorClassName(
                      'shippingState'
                    )}`}
                    value={shippingState}
                  >
                    {makeStateSelectOptions()}
                  </select>
                </div>

                {this.renderError('shippingState')}
              </div>

              <div className="txt">
                <label htmlFor="shipping-zip" className="txt-l txt-l--sm">
                  ZIP Code{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="shipping-zip"
                  name="shipping-zip"
                  placeholder="ZIP code"
                  aria-required="true"
                  {...this.errorAttributes('shippingZip')}
                  {...this.fieldListeners('shippingZip')}
                  className={`txt-f txt-f--auto ${this.renderErrorClassName(
                    'shippingZip'
                  )}`}
                  size={10}
                  value={shippingZip}
                />

                {this.renderError('shippingZip')}
              </div>
            </fieldset>

            <div className="m-v700">
              <label className="cb">
                <input
                  id="store-contact-and-shipping"
                  name="store-contact-and-shipping"
                  type="checkbox"
                  value="true"
                  checked={storeContactAndShipping}
                  {...this.fieldListeners('storeContactAndShipping')}
                  className="cb-f"
                />
                <span className="cb-l">
                  Save contact and shipping info on this computer
                </span>
              </label>
            </div>

            <div className="g g--r g--vc">
              <div className="g--5 m-b500">
                <button
                  className="btn btn--b"
                  type="submit"
                  disabled={!shippingIsComplete}
                >
                  Next: Payment
                </button>
              </div>

              <div className="g--7 m-b500">
                <Link href="/death/cart">
                  <a style={{ fontStyle: 'italic' }}>← Back to cart</a>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </AppLayout>
    );
  }

  renderError(fieldName: keyof OrderInfo) {
    const error = this.errorForField(fieldName);
    return (
      error && (
        <div className="t--info t--err m-t200" id={`${fieldName}-error`}>
          {error}
        </div>
      )
    );
  }

  renderErrorClassName(fieldName: keyof OrderInfo) {
    const error = this.errorForField(fieldName);
    return error ? 'txt-f--err' : '';
  }
}
