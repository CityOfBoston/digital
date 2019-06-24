import React from 'react';
import Link from 'next/link';
import { Formik, FormikProps } from 'formik';
import { action } from 'mobx';
import { observer } from 'mobx-react';

import {
  CHARLES_BLUE,
  GRAY_300,
  LORA_SRC,
  FREEDOM_RED_DARK,
  SERIF,
  StatusModal,
} from '@cityofboston/react-fleet';

import makePaymentValidator from '../../../lib/validators/PaymentValidator';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import Order, { OrderInfo } from '../../models/Order';
import { makeStateSelectOptions } from '../utility/form-elements';

import { runInitialValidation } from './formik-util';
import CheckoutPageLayout from './CheckoutPageLayout';

import { Progress } from '../../PageWrapper';
import { BackButtonContent } from '../question-components/BackButton';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import RenderOrderDetails from './OrderDetails';

type Props = {
  submit: (
    cardElement: stripe.elements.Element | null,
    values: Partial<OrderInfo>
  ) => unknown;
  stripe: stripe.Stripe | null;
  order: Order;
  tokenizationErrorForTest?: string;
  cardElementErrorForTest?: string;
} & (
  | {
      certificateType: 'death';
      deathCertificateCart: DeathCertificateCart;
    }
  | {
      certificateType: 'birth';
      birthCertificateRequest: BirthCertificateRequest;
      progress: Progress;
    }
  | {
      certificateType: 'marriage';
      marriageCertificateRequest: MarriageCertificateRequest;
      progress: Progress;
    });

interface State {
  cardElementComplete: boolean;
  cardElementError: null | string;
  tokenizationError: null | string;
}

export interface BillingInfo {
  storeBilling: boolean;

  cardholderName: string;

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
  private readonly isInitialValid: boolean;
  private readonly formikRef = React.createRef<Formik<BillingInfo>>();

  constructor(props: Props) {
    super(props);

    const {
      stripe,
      order: { info },
    } = props;

    this.state = {
      cardElementComplete: !!info.cardToken,
      cardElementError: props.cardElementErrorForTest || null,
      tokenizationError: props.tokenizationErrorForTest || null,
    };

    this.initialValues = {
      storeBilling: info.storeBilling,

      cardholderName: info.cardholderName,

      billingAddressSameAsShippingAddress: info.billingAddressSameAsShippingAddress
        ? 'sameAddress'
        : 'differentAddress',

      billingAddress1: info.billingAddress1,
      billingAddress2: info.billingAddress2,
      billingCity: info.billingCity,
      billingState: info.billingState,
      billingZip: info.billingZip,
    };

    const validator = makePaymentValidator(info);
    validator.check();
    this.isInitialValid = validator.passes();

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
            fontFamily: SERIF,
            fontSize: '16px',
            color: CHARLES_BLUE,
          },
          empty: {
            color: GRAY_300,
          },
          invalid: {
            color: FREEDOM_RED_DARK,
          },
        },
      });

      this.cardElement.on('change', this.handleCardElementChange);
    }
  }

  async componentDidMount() {
    await runInitialValidation(this.formikRef);

    window.scroll(0, 0);
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

  handleCardElementChange = (ev?: stripe.elements.ElementChangeResponse) => {
    if (!ev) {
      return;
    }

    if (ev.error) {
      this.setState({
        cardElementError: ev.error.message || null,
        cardElementComplete: false,
      });
    } else if (ev.brand === 'amex') {
      this.setState({
        cardElementError: 'Unfortunately, we do not accept American Express.',
        cardElementComplete: false,
      });
    } else {
      this.setState({
        cardElementError: null,
        cardElementComplete: ev.complete,
      });
    }
  };

  handleSubmit = (values: BillingInfo) => {
    const {
      submit,
      order: { info },
    } = this.props;

    try {
      submit(
        // If there’s a token already that wasn’t cleared, we don’t pass the
        // card element as a sign that we don’t want to re-tokenize.
        info.cardToken ? null : this.cardElement,
        this.valuesFromFormik(values)
      );
    } catch (e) {
      this.setState({ tokenizationError: e.message || 'An unknown error' });
    }
  };

  render() {
    return (
      <CheckoutPageLayout
        certificateType={this.props.certificateType}
        title="Payment"
        progress={
          this.props.certificateType === 'death'
            ? undefined
            : this.props.progress
        }
      >
        <div className="m-v300">
          <RenderOrderDetails details={this.props} />
        </div>

        <Formik
          ref={this.formikRef}
          initialValues={this.initialValues}
          isInitialValid={this.isInitialValid}
          onSubmit={this.handleSubmit}
          render={this.renderForm}
          validate={this.validateForm}
        />
      </CheckoutPageLayout>
    );
  }

  renderForm = ({
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    touched,
    errors,
    isValid,
  }: FormikProps<BillingInfo>) => {
    const { order } = this.props;
    const { info } = order;
    const localStorageAvailable = order.localStorageAvailable;
    const {
      cardElementComplete,
      cardElementError,
      tokenizationError,
    } = this.state;

    const fieldListeners = () => {
      return {
        onBlur: handleBlur,
        onChange: handleChange,
      };
    };

    const errorForField = (fieldName: keyof BillingInfo): string | null => {
      let fieldErrors: string | string[] | null;

      if (touched[fieldName]) {
        fieldErrors = errors[fieldName] || null;
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

    const shippingUrl = `/${this.props.certificateType}/checkout?page=shipping`;

    return (
      <form acceptCharset="UTF-8" method="post" onSubmit={handleSubmit}>
        <div className="m-v700">
          <div className="fs-l">
            <div className="fs-l-c">
              Shipping Address
              <span className="t--reset">
                &nbsp;–&nbsp;
                <span className="t--subinfo">
                  <Link href={shippingUrl}>
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
            {info.cardToken === null ? (
              <>
                <div ref={this.setCardField} />

                <div className="t--info m-t200">
                  {cardElementError ? (
                    <span className="t--err">{cardElementError}</span>
                  ) : (
                    'We accept Visa, MasterCard, and Discover.'
                  )}
                </div>
              </>
            ) : (
              <>
                <span
                  className="txt-f"
                  style={{
                    borderColor: 'transparent',
                    width: 'auto',
                  }}
                >
                  •••• •••• •••• {info.cardLast4}
                </span>

                <button
                  className="lnk"
                  style={{ fontStyle: 'italic' }}
                  onClick={action(() => {
                    order.info.cardToken = null;
                    order.info.cardLast4 = '';
                    this.setState({
                      cardElementComplete: false,
                    });
                  })}
                >
                  update
                </button>
              </>
            )}
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
          <div className="g--5 ta-r m-b500">
            <button
              className="btn"
              type="submit"
              disabled={
                !isValid ||
                !cardElementComplete ||
                !!tokenizationError ||
                order.processing
              }
            >
              Next: Review Order
            </button>
          </div>

          <div className="g--7 m-b500">
            <Link href={shippingUrl}>
              {this.props.certificateType === 'death' ? (
                <a style={{ fontStyle: 'italic' }}>
                  ← Back to shipping information
                </a>
              ) : (
                <a style={{ fontStyle: 'italic' }}>
                  <BackButtonContent />
                </a>
              )}
            </Link>
          </div>
        </div>
      </form>
    );
  };
}
