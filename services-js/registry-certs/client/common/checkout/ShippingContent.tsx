import React from 'react';
import Link from 'next/link';
import { Formik, FormikProps } from 'formik';
import { observer } from 'mobx-react';
import InputMask from 'react-input-mask';

import makeShippingValidator from '../../../lib/validators/ShippingValidator';

import { runInitialValidation } from './formik-util';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import Order, { OrderInfo } from '../../models/Order';
import { makeStateSelectOptions } from '../utility/form-elements';

import { Progress } from '../../PageWrapper';
import CheckoutPageLayout from './CheckoutPageLayout';
import { BackButtonContent } from '../question-components/BackButton';
import RenderOrderDetails from './OrderDetails';

export type Props = {
  submit: (values: Partial<OrderInfo>) => unknown;
  order: Order;
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

export interface ShippingInfo {
  storeContactAndShipping: boolean;

  contactName: string;
  contactEmail: string;
  contactPhone: string;

  shippingName: string;
  shippingCompanyName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
}

@observer
export default class ShippingContent extends React.Component<Props> {
  private readonly initialValues: ShippingInfo;
  private readonly isInitialValid: boolean;
  private readonly formikRef = React.createRef<Formik<ShippingInfo>>();

  constructor(props: Props) {
    super(props);

    const { info } = props.order;

    this.initialValues = {
      contactName: info.contactName,
      contactEmail: info.contactEmail,
      contactPhone: info.contactPhone,

      shippingName: info.shippingName,
      shippingCompanyName: info.shippingCompanyName,
      shippingAddress1: info.shippingAddress1,
      shippingAddress2: info.shippingAddress2,
      shippingCity: info.shippingCity,
      shippingState: info.shippingState,
      shippingZip: info.shippingZip,

      storeContactAndShipping: info.storeContactAndShipping,
    };

    const validator = makeShippingValidator(this.initialValues);
    validator.check();
    this.isInitialValid = validator.passes();
  }

  async componentDidMount() {
    await runInitialValidation(this.formikRef);

    window.scroll(0, 0);
  }

  validateForm = (values: ShippingInfo): { [key: string]: Array<string> } => {
    const validator = makeShippingValidator(values);
    validator.check();
    return validator.errors.all();
  };

  render() {
    const { submit, certificateType } = this.props;

    return (
      <CheckoutPageLayout
        certificateType={certificateType}
        title={certificateType !== 'death' ? 'Shipping' : 'Checkout'}
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
          onSubmit={values => submit(values)}
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
  }: FormikProps<ShippingInfo>) => {
    const { order } = this.props;
    const { localStorageAvailable } = order;

    const fieldListeners = () => {
      return {
        onBlur: handleBlur,
        onChange: handleChange,
      };
    };

    const errorForField = (fieldName: keyof ShippingInfo): string | null => {
      let fieldErrors: string | string[] | null;

      if (touched[fieldName]) {
        fieldErrors = errors[fieldName] || null;
      } else {
        fieldErrors = null;
      }

      return fieldErrors && fieldErrors[0] ? fieldErrors[0] : null;
    };

    const errorAttributes = (fieldName: keyof ShippingInfo) => {
      if (errorForField(fieldName)) {
        return {
          'aria-invalid': true,
          'aria-describedby': `${fieldName}-error`,
        };
      } else {
        return {};
      }
    };

    const renderError = (fieldName: keyof ShippingInfo) => {
      const error = errorForField(fieldName);
      return (
        error && (
          <div className="t--info t--err m-t200" id={`${fieldName}-error`}>
            {error}
          </div>
        )
      );
    };

    const renderErrorClassName = (fieldName: keyof ShippingInfo) => {
      const error = errorForField(fieldName);
      return error ? 'txt-f--err' : '';
    };

    return (
      <form method="post" onSubmit={handleSubmit}>
        <fieldset className="fs m-v700">
          <legend className="fs-l">Contact Information</legend>

          <div className="txt">
            <label htmlFor="contactName" className="txt-l txt-l--sm">
              Full Name{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>

            <input
              id="contactName"
              name="contactName"
              type="text"
              placeholder="Full name"
              autoComplete="name"
              aria-required="true"
              {...errorAttributes('contactName')}
              {...fieldListeners()}
              className={`txt-f txt-f--100 ${renderErrorClassName(
                'contactName'
              )}`}
              value={values.contactName}
            />

            {renderError('contactName')}
          </div>

          <div className="txt">
            <label htmlFor="contactEmail" className="txt-l txt-l--sm">
              Email Address{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              aria-required="true"
              {...errorAttributes('contactEmail')}
              {...fieldListeners()}
              className={`txt-f txt-f--100 ${renderErrorClassName(
                'contactEmail'
              )}`}
              value={values.contactEmail}
            />

            {renderError('contactEmail')}
          </div>

          <div className="txt">
            <label htmlFor="contactPhone" className="txt-l txt-l--sm">
              Phone Number{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>
            <InputMask
              mask="(999) 999-9999"
              id="contactPhone"
              name="contactPhone"
              type="tel"
              placeholder="Phone number"
              autoComplete="tel"
              aria-required="true"
              {...errorAttributes('contactPhone')}
              {...fieldListeners()}
              className={`txt-f txt-f--100 ${renderErrorClassName(
                'contactPhone'
              )}`}
              value={values.contactPhone}
            />

            {renderError('contactPhone')}
          </div>
        </fieldset>

        <fieldset className="fs m-v700">
          <legend className="fs-l">Shipping Address</legend>

          <div className="txt">
            <label htmlFor="shippingName" className="txt-l txt-l--sm">
              Full name{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>
            <input
              id="shippingName"
              name="shippingName"
              type="text"
              placeholder="Full name"
              autoComplete="shipping name"
              aria-required="true"
              {...errorAttributes('shippingName')}
              {...fieldListeners()}
              className={`txt-f ${renderErrorClassName('shippingName')}`}
              value={values.shippingName}
            />

            {renderError('shippingName')}
          </div>

          <div className="txt">
            <label htmlFor="shippingCompanyName" className="txt-l txt-l--sm">
              Company Name (optional)
            </label>
            <input
              id="shippingCompanyName"
              name="shippingCompanyName"
              type="text"
              placeholder="Company Name"
              autoComplete="shipping organization"
              {...errorAttributes('shippingCompanyName')}
              {...fieldListeners()}
              className={`txt-f ${renderErrorClassName('shippingCompanyName')}`}
              value={values.shippingCompanyName}
            />

            {renderError('shippingCompanyName')}
          </div>

          <div className="txt">
            <label htmlFor="shippingAddress1" className="txt-l txt-l--sm">
              Address Line 1{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>
            <input
              id="shippingAddress1"
              name="shippingAddress1"
              type="text"
              placeholder="Address Line 1"
              autoComplete="shipping address-line1"
              aria-required="true"
              {...errorAttributes('shippingAddress1')}
              {...fieldListeners()}
              className={`txt-f ${renderErrorClassName('shippingAddress1')}`}
              value={values.shippingAddress1}
            />

            {renderError('shippingAddress1')}
          </div>

          <div className="txt">
            <label htmlFor="shippingAddress2" className="txt-l txt-l--sm">
              Address Line 2 (optional)
            </label>
            <input
              id="shippingAddress2"
              name="shippingAddress2"
              type="text"
              placeholder="Address Line 2"
              autoComplete="shipping address-line2"
              {...errorAttributes('shippingAddress2')}
              {...fieldListeners()}
              className={`txt-f ${renderErrorClassName('shippingAddress2')}`}
              value={values.shippingAddress2}
            />

            {renderError('shippingAddress2')}
          </div>

          <div className="txt">
            <label htmlFor="shippingCity" className="txt-l txt-l--sm">
              City{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>
            <input
              id="shippingCity"
              name="shippingCity"
              type="text"
              placeholder="City"
              autoComplete="shipping address-level2"
              aria-required="true"
              {...errorAttributes('shippingCity')}
              {...fieldListeners()}
              className={`txt-f ${renderErrorClassName('shippingCity')}`}
              value={values.shippingCity}
            />

            {renderError('shippingCity')}
          </div>

          {/* Adding "txt" so that we get the bottom margin right. */}
          <div className="sel txt">
            <label htmlFor="shippingState" className="sel-l sel-l--sm">
              State / Territory{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>
            <div className="sel-c">
              <select
                id="shippingState"
                name="shippingState"
                autoComplete="shipping address-level1"
                aria-required="true"
                {...errorAttributes('shippingState')}
                {...fieldListeners()}
                className={`sel-f ${renderErrorClassName('shippingState')}`}
                value={values.shippingState}
              >
                {makeStateSelectOptions()}
              </select>
            </div>

            {renderError('shippingState')}
          </div>

          <div className="txt">
            <label htmlFor="shippingZip" className="txt-l txt-l--sm">
              ZIP Code{' '}
              <span className="t--req" aria-hidden>
                Required
              </span>
            </label>
            <input
              id="shippingZip"
              name="shippingZip"
              placeholder="ZIP code"
              autoComplete="shipping postal-code"
              aria-required="true"
              {...errorAttributes('shippingZip')}
              {...fieldListeners()}
              className={`txt-f txt-f--auto ${renderErrorClassName(
                'shippingZip'
              )}`}
              size={10}
              value={values.shippingZip}
            />

            {renderError('shippingZip')}
          </div>
        </fieldset>

        <div className="m-v700">
          {localStorageAvailable && (
            <label className="cb">
              <input
                id="storeContactAndShipping"
                name="storeContactAndShipping"
                type="checkbox"
                value="true"
                checked={values.storeContactAndShipping}
                {...fieldListeners()}
                className="cb-f"
              />
              <span className="cb-l">
                Save contact and shipping info on this computer
              </span>
            </label>
          )}
        </div>

        <div className="g g--r g--vc">
          <div className="g--5 ta-r m-b500">
            <button className="btn" type="submit" disabled={!isValid}>
              Next: Payment
            </button>
          </div>

          {/* We always want this cell, even if it’s empty,
              so that the above cell’s margins aren’t weird
              from being the first and last child at the same time.*/}
          <div className="g--7 m-b500">
            {this.props.certificateType === 'death' ? (
              <Link href="/death/cart">
                <a style={{ fontStyle: 'italic' }}>← Back to cart</a>
              </Link>
            ) : (
              <Link href={`/${this.props.certificateType}/review`}>
                <a style={{ fontStyle: 'italic' }}>
                  <BackButtonContent />
                </a>
              </Link>
            )}
          </div>
        </div>
      </form>
    );
  };
}
