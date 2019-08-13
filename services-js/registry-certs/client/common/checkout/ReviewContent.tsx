import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';

import { StatusModal } from '@cityofboston/react-fleet';

import {
  PERCENTAGE_CC_STRING,
  FIXED_CC_STRING,
  SERVICE_FEE_URL,
} from '../../../lib/costs';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import Order from '../../models/Order';

import CostSummary from '../CostSummary';
import { OrderErrorCause } from '../../queries/graphql-types';
import { SubmissionError } from '../../dao/CheckoutDao';
import CheckoutPageLayout from './CheckoutPageLayout';
import { Progress } from '../../PageWrapper';
import RenderOrderDetails from './OrderDetails';

export type Props = {
  submit: (cardElement?: stripe.elements.Element) => Promise<void>;
  order: Order;
  showErrorsForTest?: boolean;
  testSubmissionError?: SubmissionError;
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

export interface State {
  acceptNonRefundable: boolean;
  acceptPendingCertificates: boolean;
  submissionError: string | null;
  submissionErrorIsForPayment: boolean;
}

@observer
export default class ReviewContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      acceptNonRefundable: false,
      acceptPendingCertificates: false,
      submissionError:
        (props.testSubmissionError && props.testSubmissionError.message) ||
        null,
      submissionErrorIsForPayment:
        (props.testSubmissionError &&
          props.testSubmissionError.cause === OrderErrorCause.USER_PAYMENT) ||
        false,
    };
  }

  componentWillMount() {
    // When we land on this page we create a new idempotency key so that our
    // submission will only be processed once.
    const { order } = this.props;
    order.regenerateIdempotencyKey();
  }

  componentDidMount(): void {
    window.scroll(0, 0);
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

    try {
      await submit();
    } catch (err) {
      // Any errors at this point have been sent to Rollbar by CheckoutPage or
      // CheckoutDao, so it’s safe to just show a nice message to the user.

      // If there's an error we need to regenerate the key to allow another
      // submission to occur.
      order.regenerateIdempotencyKey();

      if (err instanceof SubmissionError) {
        this.setState({
          submissionError: err.message,
          submissionErrorIsForPayment:
            err.cause === OrderErrorCause.USER_PAYMENT,
        });
      } else {
        this.setState({
          submissionError: err.message || 'An unknown error occurred',
          submissionErrorIsForPayment: false,
        });
      }
    }
  };

  render() {
    const { order, certificateType } = this.props;

    const {
      acceptNonRefundable,
      acceptPendingCertificates,
      submissionError,
      submissionErrorIsForPayment,
    } = this.state;

    const {
      paymentIsComplete,
      shippingIsComplete,
      processing,
      info: {
        contactEmail,
        contactPhone,
        shippingName,
        shippingCompanyName,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingZip,

        cardholderName,
        cardLast4,
        cardFunding,
      },
      billingAddress1,
      billingAddress2,
      billingCity,
      billingState,
      billingZip,
    } = order;

    const quantity =
      this.props.certificateType === 'death'
        ? this.props.deathCertificateCart.size
        : this.props.certificateType === 'birth'
        ? this.props.birthCertificateRequest.quantity
        : this.props.marriageCertificateRequest.quantity;

    const needsAccepting =
      !acceptNonRefundable ||
      (this.props.certificateType === 'death' &&
        this.props.deathCertificateCart.containsPending &&
        !acceptPendingCertificates);

    const checkoutPath = `/${certificateType}/checkout`;

    return (
      <CheckoutPageLayout
        certificateType={certificateType}
        title="Review Order"
        progress={
          this.props.certificateType === 'death'
            ? undefined
            : this.props.progress
        }
        footer={
          <div className="b--g m-t700">
            <div id="service-fee" className="b-c b-c--smv b-c--hsm t--subinfo">
              * You are charged an extra service fee of not more than{' '}
              {FIXED_CC_STRING} plus {PERCENTAGE_CC_STRING}. This fee goes
              directly to a third party to pay for the cost of credit card
              processing. Learn more about{' '}
              <a href={SERVICE_FEE_URL}>credit card service fees</a> at the City
              of Boston.
            </div>
          </div>
        }
      >
        <div className="t--info m-v500">
          Your order is not yet complete. Please check the information below,
          then click the <b>Submit Order</b> button.
        </div>

        <form acceptCharset="UTF-8" method="post" onSubmit={this.handleSubmit}>
          <div className="m-v700">
            <div className="fs-l">
              <div className="fs-l-c">
                Order Details
                {this.props.certificateType === 'death' && (
                  <span className="t--reset">
                    &nbsp;—&nbsp;
                    <span className="t--subinfo">
                      <Link href="/death/cart">
                        <a aria-label="Edit cart">edit</a>
                      </Link>
                    </span>
                  </span>
                )}
              </div>
            </div>

            <RenderOrderDetails details={this.props} />
          </div>

          <div className="m-v700">
            <div className="fs-l">
              <div className="fs-l-c">
                Contact Information
                <span className="t--reset">
                  &nbsp;—&nbsp;
                  <span className="t--subinfo">
                    <Link href={`${checkoutPath}?page=shipping`}>
                      <a aria-label="Edit contact information">edit</a>
                    </Link>
                  </span>
                </span>
              </div>
            </div>

            <div className="t--info" style={{ fontStyle: 'normal' }}>
              <strong>{contactEmail}</strong>
              <br />
              {contactPhone}
            </div>
          </div>

          <div className="m-v700">
            <div className="fs-l">
              <div className="fs-l-c">
                Shipping Address
                <span className="t--reset">
                  &nbsp;—&nbsp;
                  <span className="t--subinfo">
                    <Link href={`${checkoutPath}?page=shipping`}>
                      <a aria-label="Edit shipping address">edit</a>
                    </Link>
                  </span>
                </span>
              </div>
            </div>

            {shippingIsComplete ? (
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
            ) : (
              <div className="t--err t--info">
                You need to edit your shipping info to fix some errors
              </div>
            )}
          </div>

          <div className="fs m-v700">
            <div className="fs-l">
              <div className="fs-l-c">
                Payment Information
                <span className="t--reset">
                  &nbsp;—&nbsp;
                  <span className="t--subinfo">
                    <Link href={`${checkoutPath}?page=payment`}>
                      <a aria-label="Edit payment information">edit</a>
                    </Link>
                  </span>
                </span>
              </div>
            </div>

            {paymentIsComplete ? (
              <div className="t--info" style={{ fontStyle: 'normal' }}>
                {cardholderName}
                <br />
                •••• •••• •••• {cardLast4 || ''}
                <br />
                {billingAddress1}
                <br />
                {billingAddress2 ? [billingAddress2, <br key="br" />] : null}
                {billingCity}, {billingState} {billingZip}
              </div>
            ) : (
              <div className="t--err t--info">
                You need to edit your payment info to fix some errors
              </div>
            )}
          </div>

          <div className="m-v500">
            <CostSummary
              certificateType={this.props.certificateType}
              certificateQuantity={quantity}
              serviceFeeType={cardFunding === 'debit' ? 'DEBIT' : 'CREDIT'}
            />
          </div>

          {this.renderAcceptCheckboxes()}

          {this.props.certificateType === 'death' && (
            <div className="t--info m-v300" id="charge-message">
              Pressing the “Submit Order” button will charge the total amount to
              your card and place an order with the Registry.
            </div>
          )}

          {this.props.certificateType === 'birth' && (
            <div className="t--info m-v300" id="charge-message">
              Pressing the “Submit Order” button will put a hold for the total
              amount on your card and place an order with the Registry. You will
              be charged when the Registry mails your order.
            </div>
          )}

          {processing && (
            <StatusModal message="Submitting your order…">
              <div className="t--info m-t300">
                Please be patient and don’t refresh your browser. This might
                take a bit.
              </div>
            </StatusModal>
          )}

          {submissionError && !submissionErrorIsForPayment && (
            <StatusModal
              message={`There’s a problem: ${submissionError}`}
              error
              onClose={() => {
                this.setState({
                  submissionError: null,
                });
              }}
            >
              <div className="t--info m-t300">
                You can try again. If this keeps happening, please email{' '}
                <a href="mailto:digital@boston.gov">digital@boston.gov</a>.
              </div>
            </StatusModal>
          )}

          {submissionError && submissionErrorIsForPayment && (
            <StatusModal message="This charge failed." error>
              <div className="t--info m-t300">
                {submissionError} Update your payment information to submit your
                order.
              </div>

              <div className="m-v500 ta-c">
                <Link href={`${checkoutPath}?page=payment`}>
                  <a className="btn">Re-try</a>
                </Link>
              </div>
            </StatusModal>
          )}

          <div className="m-v300">
            <button
              className="btn"
              style={{ display: 'block', width: '100%' }}
              type="submit"
              disabled={
                !paymentIsComplete ||
                !shippingIsComplete ||
                quantity === 0 ||
                needsAccepting ||
                processing ||
                !!submissionError
              }
              aria-describedby="charge-message"
            >
              Submit Order
            </button>
          </div>

          {this.props.certificateType === 'death' && (
            <div className="ta-c t--info m-v700">
              <Link href="/death">
                <a>I’m not done yet, go back to search</a>
              </Link>
            </div>
          )}
        </form>
      </CheckoutPageLayout>
    );
  }

  renderAcceptCheckboxes(): React.ReactNode {
    const containsPending =
      this.props.certificateType === 'death' &&
      this.props.deathCertificateCart.containsPending;

    const { acceptNonRefundable, acceptPendingCertificates } = this.state;

    return (
      <div className="m-v700">
        <div className="t--info">
          {containsPending
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
              <strong>
                {this.props.certificateType} certificates are non-refundable
              </strong>
              .
            </span>
          </label>
        </div>

        {containsPending && (
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
                <strong>pending death certificates</strong>, which may not be
                accepted by insurance or banking companies.
              </span>
            </label>
          </div>
        )}
      </div>
    );
  }
}
