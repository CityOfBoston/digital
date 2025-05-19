/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react';

import {
  CHARLES_BLUE,
  GRAY_400,
  OPTIMISTIC_BLUE_DARK,
  SANS,
  SERIF,
  StatusModal,
  WHITE,
} from '@cityofboston/react-fleet';

import {
  PERCENTAGE_CC_STRING,
  FIXED_CC_STRING,
  SERVICE_FEE_URL,
} from '../../../lib/costs';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import Order from '../../models/Order';
import CertificateRow from '../CertificateRow';

import CostSummary from '../CostSummary';
import { OrderErrorCause } from '../../queries/graphql-types';
import { SubmissionError } from '../../dao/CheckoutDao';
import CheckoutPageLayout from './CheckoutPageLayout';
import { ProgressProps } from '../../../lib/interfaces';
import { OrderDetails } from './OrderDetails';
import { CARDTYPE } from '../../models/CardType';
// import RenderOrderDetails from './OrderDetails';

export type Props = {
  submit: (cardElement?: stripe.elements.Element) => Promise<void>;
  order: Order;
  tracking: boolean;
  cardType?: CARDTYPE;
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
      progress: ProgressProps;
    }
  | {
      certificateType: 'marriage';
      marriageCertificateRequest: MarriageCertificateRequest;
      progress: ProgressProps;
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
          submissionError: (err as SubmissionError).message,
          submissionErrorIsForPayment:
            (err as any).cause === OrderErrorCause.USER_PAYMENT,
        });
      } else {
        let errorMsg: string = 'An unknown error occurred';
        if ((err as Error).message) {
          if ((err as Error).message.toLocaleLowerCase().includes('stripe')) {
            errorMsg = 'An error occured with our connection.';
          } else {
            errorMsg = (err as Error).message;
          }
        }

        this.setState({
          submissionError: errorMsg,
          submissionErrorIsForPayment: false,
        });
      }
    }
  };

  render() {
    const { order, certificateType, tracking, cardType = '0' } = this.props;

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
        // cardFunding,
      },
      billingAddress1,
      billingAddress2,
      billingCity,
      billingState,
      billingZip,
    } = order;

    let quantity = 0;

    switch (certificateType) {
      case 'birth':
        quantity = this.props.birthCertificateRequest.quantity;
        break;
      case 'marriage':
        quantity = this.props.marriageCertificateRequest.quantity;
        break;
      case 'death':
        quantity = this.props.deathCertificateCart.size;
        break;
    }

    const needsAccepting =
      !acceptNonRefundable ||
      (this.props.certificateType === 'death' &&
        this.props.deathCertificateCart.containsPending &&
        !acceptPendingCertificates);

    const checkoutPath = `/${certificateType}/checkout`;

    let cartTypeStr = 'deathCertificateCart';

    switch (this.props.certificateType) {
      case 'death':
        cartTypeStr = 'deathCertificateCart';
        break;
      case 'birth':
        cartTypeStr = 'birthCertificateRequest';
        break;
      case 'marriage':
        cartTypeStr = 'marriageCertificateRequest';
        break;
    }

    const certEntries = () => {
      if (this.props.certificateType === 'death') {
        return this.props[cartTypeStr].entries.map(
          ({ cert, quantity }, i) =>
            cert && (
              <div className={'certRow'}>
                <CertificateRow
                  type={this.props.certificateType}
                  key={cert.id}
                  certificate={cert}
                  borderTop={i !== 0}
                  borderBottom={true}
                  quantity={quantity}
                  showQuantity={true}
                />
              </div>
            )
        );
      } else if (this.props.certificateType === 'birth') {
        return (
          <div className={'certRow'}>
            <OrderDetails
              type="birth"
              birthCertificateRequest={this.props[cartTypeStr]}
            />
          </div>
        );
      } else {
        return (
          <div className={'certRow'}>
            <OrderDetails
              type="marriage"
              marriageCertificateRequest={this.props[cartTypeStr]}
            />
          </div>
        );
      }
    };

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
        <div css={REVIEW_CSS}>
          <div className="t--info m-v500">
            Your order is not yet complete. Please check the information below,
            then click the <b>Submit Order</b> button.
          </div>

          <form
            acceptCharset="UTF-8"
            method="post"
            onSubmit={this.handleSubmit}
          >
            <div className={'row info-row'}>
              <div className={'col'}>
                <label className={'header'}>Contact Information</label>

                <div className="info">{contactEmail}</div>
                <div className="info">{contactPhone}</div>
              </div>

              <div className={'col'}>
                <Link href={`${checkoutPath}?page=shipping`}>
                  <a className={'btn'} aria-label="Edit contact information">
                    edit
                  </a>
                </Link>
              </div>
            </div>
            <div className={'row info-row'}>
              <div className={'col'}>
                <label className={'header'}>Shipping Address</label>

                {shippingIsComplete ? (
                  <div>
                    {shippingName}
                    <br />
                    {shippingCompanyName
                      ? [shippingCompanyName, <br key="br" />]
                      : null}
                    {shippingAddress1}
                    <br />
                    {shippingAddress2
                      ? [shippingAddress2, <br key="br" />]
                      : null}
                    {`${shippingCity}, ${shippingState} ${shippingZip}`}
                  </div>
                ) : (
                  <div className="t--err t--info">
                    You need to edit your shipping info to fix some errors
                  </div>
                )}
              </div>

              <div className={'col'}>
                <Link href={`${checkoutPath}?page=shipping`}>
                  <a className={'btn'} aria-label="Edit contact information">
                    edit
                  </a>
                </Link>
              </div>
            </div>
            <div className={'row info-row'}>
              <div className={'col'}>
                <label className={'header'}>Payment Information</label>

                {paymentIsComplete ? (
                  <div>
                    {cardholderName}
                    <br />
                    •••• •••• •••• {cardLast4 || ''}
                    <br />
                    {billingAddress1}
                    <br />
                    {billingAddress2
                      ? [billingAddress2, <br key="br" />]
                      : null}
                    {billingCity}, {billingState} {billingZip}
                  </div>
                ) : (
                  <div className="t--err t--info">
                    You need to edit your payment info to fix some errors
                  </div>
                )}
              </div>

              <div className={'col'}>
                <Link href={`${checkoutPath}?page=payment`}>
                  <a className={'btn'} aria-label="Edit contact information">
                    edit
                  </a>
                </Link>
              </div>
            </div>
            <div className={'row'}>
              <div className={'col'}>
                <label className={'header'}>Order Details</label>
              </div>

              <div className={'col'}>
                <Link
                  href={`${
                    certificateType === 'death'
                      ? '/death/cart'
                      : `/${certificateType}/review`
                  }`}
                >
                  <a className={'btn'} aria-label="Edit contact information">
                    edit
                  </a>
                </Link>
              </div>
            </div>

            {certEntries()}

            <div className="m-v500">
              <h1 className={'summary'}>Order Summary</h1>
              <CostSummary
                certificateType={this.props.certificateType}
                certificateQuantity={quantity}
                newServiceFeeType={cardType}
                useInDrawer={true}
                tracking={tracking}
              />
            </div>

            {this.renderAcceptCheckboxes()}
            {this.props.certificateType === 'death' && (
              <div className="t--info m-v300" id="charge-message">
                Pressing the “Submit Order” button will charge the total amount
                to your card and place an order with the Registry.
              </div>
            )}
            {this.props.certificateType === 'birth' && (
              <div className="t--info m-v300" id="charge-message">
                Pressing the “Submit Order” button will put a hold for the total
                amount on your card and place an order with the Registry. You
                will be charged when the Registry mails your order.
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
                  {submissionError} Update your payment information to submit
                  your order.
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
        </div>
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

const REVIEW_CSS = css`
  .t--info {
    font-family: ${SERIF};
    color: ${CHARLES_BLUE};
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  .sh-title {
    font-family: ${SERIF};
    color: ${CHARLES_BLUE};
    font-size: 24px;
  }

  h1.summary {
    color: ${CHARLES_BLUE};
    font-family: ${SANS};
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .info-row {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5em;
    border-bottom: 1px solid ${GRAY_400};
    line-height: 1.5em;
  }

  .certRow {
    color: ${CHARLES_BLUE};
    font-family: ${SERIF};
  }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    color: ${CHARLES_BLUE};
    font-family: ${SERIF};

    label.header {
      color: ${CHARLES_BLUE};
      font-family: ${SANS};
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      text-transform: uppercase;
    }

    .info {
      margin-bottom: 0.5rem;
    }

    .btn {
      font-family: ${SERIF};
      color: ${OPTIMISTIC_BLUE_DARK};
      text-align: center;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: normal;
      text-transform: capitalize;
      background: ${WHITE};
      border: 1px solid ${GRAY_400};
      padding: 13px;

      &:hover {
        background: ${OPTIMISTIC_BLUE_DARK};
        color: ${WHITE};
      }
    }
  }
`;
