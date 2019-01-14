import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Formik, FormikProps } from 'formik';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import {
  CHARLES_BLUE,
  GRAY_300,
  LORA_SRC,
  FREEDOM_RED,
  StatusModal,
} from '@cityofboston/react-fleet';

import PageLayout from '../../PageLayout';
import { BreadcrumbNavLinks } from '../breadcrumbs';

import Cart from '../../store/DeathCertificateCart';
import Order, { OrderInfo } from '../../models/Order';
import { makeStateSelectOptions } from '../../common/form-elements';

import {
  DeathOrderDetails,
  OrderDetailsDropdown,
} from '../../common/checkout/OrderDetails';

import makePaymentValidator from '../../../lib/validators/PaymentValidator';

interface Props {
  submit: (
    cardElement: stripe.elements.Element | null,
    values: Partial<OrderInfo>
  ) => unknown;
  stripe: stripe.Stripe | null;
  cart: Cart;
  order: Order;
  showErrorsForTest?: boolean;
  tokenizationErrorForTest?: string;
}

interface State {
  tokenizationError: null | string;
}

export interface BillingInfo {
  storeBilling: boolean;

  cardholderName: string;
  cardLast4: string;

  // formik needs this value as a string
  billingAddressSameAsShippingAddress: 'sameAddress' | 'differentAddress';

  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
}

@observer
export default class PaymentContent extends React.Component<Props, State> {
  private cardElement: stripe.elements.Element | null = null;
  private readonly initialValues: BillingInfo;

  constructor(props: Props) {
    super(props);

    const { info } = props.order;

    this.state = {
      tokenizationError: props.tokenizationErrorForTest || null,
    };

    this.initialValues = {
      storeBilling: info.storeBilling,

      cardholderName: info.cardholderName,
      cardLast4: info.cardLast4,

      billingAddressSameAsShippingAddress: 'sameAddress',

      billingAddress1: info.billingAddress1,
      billingAddress2: info.billingAddress2,
      billingCity: info.billingCity,
      billingState: info.billingState,
      billingZip: info.billingZip,
    };
  }

  componentWillMount() {
    const { stripe } = this.props;

    if (stripe) {
      const elements = stripe.elements({
        fonts: [
          {
            family: 'Lora',
            src: `url('${LORA_SRC}')`,
          },
        ],
      });

      this.cardElement = elements.create('card', {
        hidePostalCode: true,
        classes: {
          base: 'txt-f',
          invalid: 'txt-f--err',
        },
        style: {
          base: {
            lineHeight: '3.5rem',
            fontFamily: 'Lora, Georgia, serif',
            fontSize: '16px',
            color: CHARLES_BLUE,
          },
          empty: {
            color: GRAY_300,
          },
          invalid: {
            color: FREEDOM_RED,
          },
        },
      });

      this.cardElement.on('change', this.handleCardElementChange);
    }
  }

  componentWillUnmount() {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  setCardField = (el: HTMLElement | null) => {
    if (this.cardElement) {
      if (el) {
        this.cardElement.mount(el);
      } else {
        this.cardElement.unmount();
      }
    }
  };

  // Since formik expects strings for values, we must convert
  // billingAddressSameAsShippingAddress back to a boolean value.
  //
  // Slightly-wonky signature to match the validator’s input.
  valuesFromFormik(values: BillingInfo): Pick<OrderInfo, keyof BillingInfo> {
    return {
      ...values,
      billingAddressSameAsShippingAddress:
        values.billingAddressSameAsShippingAddress === 'sameAddress',
    };
  }

  validateForm = (values: BillingInfo): { [key: string]: Array<string> } => {
    const validator = makePaymentValidator(this.valuesFromFormik(values));
    validator.check();
    return validator.errors.all();
  };

  handleCardElementChange = action(
    (ev?: stripe.elements.ElementChangeResponse) => {
      if (!ev) {
        return;
      }

      const { order } = this.props;

      if (ev.error) {
        order.cardElementError = ev.error.message || null;
        order.cardElementComplete = false;
      } else if (ev.brand === 'amex') {
        order.cardElementError =
          'Unfortunately, we do not accept American Express.';
        order.cardElementComplete = false;
      } else {
        order.cardElementError = null;
        order.cardElementComplete = ev.complete;
      }
    }
  );

  handleSubmit = (values: BillingInfo) => {
    const { submit } = this.props;

    try {
      submit(this.cardElement, this.valuesFromFormik(values));
    } catch (e) {
      this.setState({ tokenizationError: e.message || 'An unknown error' });
    }
  };

  render() {
    const { cart } = this.props;

    return (
      <PageLayout breadcrumbNav={BreadcrumbNavLinks}>
        <div className="b-c b-c--hsm">
          <Head>
            <title>Boston.gov — Death Certificates — Payment</title>
          </Head>

          <div className="sh sh--b0">
            <h1 className="sh-title">Payment</h1>
          </div>

          <div className="m-v300">
            <OrderDetailsDropdown
              orderType="death"
              certificateQuantity={cart.size}
            >
              <DeathOrderDetails cart={cart} />
            </OrderDetailsDropdown>
          </div>

          <Formik
            initialValues={this.initialValues}
            onSubmit={this.handleSubmit}
            render={this.renderForm}
            validate={this.validateForm}
          />
        </div>
      </PageLayout>
    );
  }

  renderForm = ({
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    touched,
    errors,
  }: FormikProps<BillingInfo>) => {
    const { order, showErrorsForTest } = this.props;
    const { info } = order;
    const localStorageAvailable = order.localStorageAvailable;
    const { tokenizationError } = this.state;

    const fieldListeners = () => {
      return {
        onBlur: handleBlur,
        onChange: handleChange,
      };
    };

    const errorForField = (fieldName: keyof BillingInfo): string | null => {
      let fieldErrors;

      if (touched[fieldName]) {
        fieldErrors = errors[fieldName];
      } else if (showErrorsForTest) {
        fieldErrors = errors[0];
      } else {
        fieldErrors = null;
      }

      return fieldErrors && fieldErrors[0] ? fieldErrors[0] : null;
    };

    const errorAttributes = (fieldName: keyof BillingInfo) => {
      if (errorForField(fieldName)) {
        return {
          'aria-invalid': true,
          'aria-describedby': `${fieldName}-error`,
        };
      } else {
        return {};
      }
    };

    const renderError = (fieldName: keyof BillingInfo) => {
      const error = errorForField(fieldName);
      return (
        error && (
          <div className="t--info t--err m-t200" id={`${fieldName}-error`}>
            {error}
          </div>
        )
      );
    };

    const renderErrorClassName = (fieldName: keyof BillingInfo) => {
      const error = errorForField(fieldName);
      return error ? 'txt-f--err' : '';
    };

    return (
      <form acceptCharset="UTF-8" method="post" onSubmit={handleSubmit}>
        <div className="m-v700">
          <div className="fs-l">
            <div className="fs-l-c">
              Shipping Address
              <span className="t--reset">
                &nbsp;–&nbsp;
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

          <div className="m-b200">{`${info.shippingAddress1}${
            info.shippingAddress2 ? `, ${info.shippingAddress2}` : ''
          }, ${info.shippingCity} ${info.shippingState} ${
            info.shippingZip
          }`}</div>
          <div> </div>
        </div>

        <fieldset className="fs m-v700">
          <legend className="fs-l">Payment method</legend>

          <div className="txt">
            <label htmlFor="cardholderName" className="txt-l txt-l--sm">
              Cardholder Name{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>

            <input
              id="cardholderName"
              name="cardholderName"
              type="text"
              aria-required="true"
              {...errorAttributes('cardholderName')}
              {...fieldListeners()}
              value={values.cardholderName}
              className={`txt-f ${renderErrorClassName('cardholderName')}`}
            />

            {renderError('cardholderName')}
          </div>

          <div className="txt">
            <label htmlFor="card-number" className="txt-l txt-l--sm">
              Credit or Debit Card <span className="t--req">Required</span>
            </label>

            <div ref={this.setCardField} />

            <div className="t--info m-t200">
              {order.cardElementError ? (
                <span className="t--err">{order.cardElementError}</span>
              ) : (
                'We accept Visa, MasterCard, and Discover.'
              )}
            </div>
          </div>
        </fieldset>

        <fieldset className="fs m-v700">
          <legend className="fs-l">Billing Address</legend>

          <div className="m-v200">
            <div role="radiogroup">
              <label className="ra">
                <input
                  type="radio"
                  name="billingAddressSameAsShippingAddress"
                  {...fieldListeners()}
                  value="sameAddress"
                  className="ra-f"
                  checked={
                    values.billingAddressSameAsShippingAddress === 'sameAddress'
                  }
                />
                <span className="ra-l">Same as shipping address</span>
              </label>

              <label className="ra">
                <input
                  type="radio"
                  name="billingAddressSameAsShippingAddress"
                  {...fieldListeners()}
                  value="differentAddress"
                  className="ra-f"
                  checked={
                    values.billingAddressSameAsShippingAddress ===
                    'differentAddress'
                  }
                />
                <span className="ra-l">Use a different address</span>
              </label>
            </div>
          </div>

          {values.billingAddressSameAsShippingAddress ===
            'differentAddress' && (
            <div className="m-t500">
              <div className="txt">
                <label htmlFor="billingAddress1" className="txt-l txt-l--sm">
                  Address Line 1{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="billingAddress1"
                  name="billingAddress1"
                  autoComplete="billing address-line1"
                  aria-required="true"
                  {...errorAttributes('billingAddress1')}
                  {...fieldListeners()}
                  type="text"
                  placeholder="Address Line 1"
                  className={`txt-f ${renderErrorClassName('billingAddress1')}`}
                  value={values.billingAddress1}
                />

                {renderError('billingAddress1')}
              </div>

              <div className="txt">
                <label htmlFor="billingAddress2" className="txt-l txt-l--sm">
                  Address Line 2 (optional)
                </label>
                <input
                  id="billingAddress2"
                  name="billingAddress2"
                  autoComplete="billing address-line2"
                  {...errorAttributes('billingAddress2')}
                  {...fieldListeners()}
                  type="text"
                  placeholder="Address Line 2"
                  className={`txt-f ${renderErrorClassName('billingAddress2')}`}
                  value={values.billingAddress2}
                />

                {renderError('billingAddress2')}
              </div>

              <div className="txt">
                <label htmlFor="billingCity" className="txt-l txt-l--sm">
                  City{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="billingCity"
                  name="billingCity"
                  autoComplete="billing address-level2"
                  aria-required="true"
                  {...errorAttributes('billingCity')}
                  {...fieldListeners()}
                  type="text"
                  placeholder="City"
                  className={`txt-f ${renderErrorClassName('billingCity')}`}
                  value={values.billingCity}
                />

                {renderError('billingCity')}
              </div>

              {/* Adding “txt” so that we get the bottom margin right. */}
              <div className="sel txt">
                <label htmlFor="billingState" className="sel-l txt-l--sm">
                  State / Territory{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <div className="sel-c">
                  <select
                    id="billingState"
                    name="billingState"
                    autoComplete="billing address-level1"
                    aria-required="true"
                    {...errorAttributes('billingState')}
                    {...fieldListeners()}
                    className={`sel-f ${renderErrorClassName('billingState')}`}
                    value={values.billingState}
                  >
                    {makeStateSelectOptions()}
                  </select>
                </div>

                {renderError('billingState')}
              </div>

              <div className="txt">
                <label htmlFor="billingZip" className="txt-l txt-l--sm">
                  ZIP Code{' '}
                  <span className="t--req" aria-hidden>
                    Required
                  </span>
                </label>
                <input
                  id="billingZip"
                  name="billingZip"
                  autoComplete="billing postal-code"
                  aria-required="true"
                  {...errorAttributes('billingZip')}
                  {...fieldListeners()}
                  placeholder="ZIP code"
                  className={`txt-f txt-f--50 ${renderErrorClassName(
                    'billingZip'
                  )}`}
                  value={values.billingZip}
                />

                {renderError('billingZip')}
              </div>

              <div className="m-t700">
                {localStorageAvailable && (
                  <label className="cb">
                    <input
                      id="storeBilling"
                      name="storeBilling"
                      type="checkbox"
                      value="true"
                      checked={values.storeBilling}
                      {...fieldListeners()}
                      className="cb-f"
                    />{' '}
                    <span className="cb-l">
                      Save billing address on this computer
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}
        </fieldset>

        {order.cardElementComplete && <h1>complete</h1>}

        {tokenizationError && (
          <StatusModal
            message={`There’s a problem: ${tokenizationError}`}
            error
            onClose={() => {
              this.setState({ tokenizationError: null });
            }}
          >
            <div className="t--info m-t300">
              You can try again. If this keeps happening, please email{' '}
              <a href="mailto:digital@boston.gov">digital@boston.gov</a>.
            </div>
          </StatusModal>
        )}

        <div className="g g--r g--vc">
          <div className="g--5 m-b500">
            <button
              className="btn btn--b"
              type="submit"
              disabled={
                !order.paymentIsComplete ||
                !order.cardElementComplete ||
                order.processing
              }
            >
              Next: Review Order
            </button>
          </div>

          <div className="g--7 m-b500">
            <Link href="/death/checkout?page=shipping" as="/death/checkout">
              <a style={{ fontStyle: 'italic' }}>
                ← Back to shipping information
              </a>
            </Link>
          </div>
        </div>
      </form>
    );
  };
}
