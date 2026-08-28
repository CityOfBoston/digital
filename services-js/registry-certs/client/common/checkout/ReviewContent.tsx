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

import { preventImplicitFormSubmitOnEnter } from './preventImplicitFormSubmitOnEnter';
import CostSummary from '../CostSummary';
import { OrderErrorCause } from '../../queries/graphql-types';
import { SubmissionError } from '../../dao/CheckoutDao';
import CheckoutPageLayout from './CheckoutPageLayout';
import { ProgressProps } from '../../../lib/interfaces';
import { OrderDetails } from './OrderDetails';
import { CARDTYPE } from '../../models/CardType';
import { ReactKeyIndexStr } from '../../../utils/helpers';
// import RenderOrderDetails from './OrderDetails';

export type Props = {
  submit: (cardElement?: stripe.elements.Element) => Promise<void>;
  order: Order;
  tracking: boolean;
  cardType?: CARDTYPE;
  showErrorsForTest?: boolean;
  testSubmissionError?: SubmissionError;
  keyIndex?: string;
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
    const {
      order,
      certificateType,
      tracking,
      cardType = '0',
      keyIndex = ReactKeyIndexStr({
        seedStr: `review-content`,
        max: 1000,
      }),
    } = this.props;

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
      certificateType === 'death'
        ? this.props.deathCertificateCart.containsPending &&
          !acceptPendingCertificates
        : !acceptNonRefundable;

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
        return this.props.deathCertificateCart.entries.map(
          ({ cert, quantity, includeSsn }, i) =>
            cert && (
              <div
                key={`div--rev-content-${keyIndex}#${i}`}
                className="death-order-item"
              >
                <p>
                  <span className="death-order-item-label">Name: </span>
                  {cert.firstName} {cert.lastName}
                </p>
                <p>
                  <span className="death-order-item-label">SS Included: </span>
                  {includeSsn === true ? 'Yes' : 'No'}
                </p>
                <p>
                  <span className="death-order-item-label">Quantity: </span>
                  {quantity}
                </p>
              </div>
            )
        );
      } else if (this.props.certificateType === 'birth') {
        return (
          <div className={'certRow'}>
            <OrderDetails
              type="birth"
              birthCertificateRequest={this.props[cartTypeStr]}
              hideQtyUI={true}
            />
          </div>
        );
      } else {
        return (
          <div className={'certRow'}>
            <OrderDetails
              type="marriage"
              marriageCertificateRequest={this.props[cartTypeStr]}
              hideQtyUI={true}
            />
          </div>
        );
      }
    };

    return (
      <CheckoutPageLayout
        certificateType={certificateType}
        title={certificateType !== 'death' ? 'Review Order' : undefined}
        sectionTitle={
          certificateType === 'death' ? 'Review order' : undefined
        }
        currentStep={certificateType === 'death' ? 7 : undefined}
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
              <a
                href={SERVICE_FEE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                credit card service fees
              </a>{' '}
              at the City of Boston.
            </div>
          </div>
        }
      >
        <div
          key={keyIndex}
          css={
            certificateType === 'death'
              ? [REVIEW_CSS, DEATH_REVIEW_CSS]
              : REVIEW_CSS
          }
        >
          <div className="t--info m-v500">
            Your order is not yet complete. Please check the information below,
            then click the <b>Submit Order</b> button.
          </div>

          <form
            acceptCharset="UTF-8"
            method="post"
            onSubmit={this.handleSubmit}
            onKeyDown={preventImplicitFormSubmitOnEnter}
          >
            <div className={'row info-row'}>
              <div className={'col'}>
                <label className={'header'}>Contact Information</label>

                <div className="info">{contactEmail}</div>
                <div className="info">{contactPhone}</div>
              </div>

              <div className={'col'}>
                <Link href={`${checkoutPath}?page=shipping`}>
                  <a
                    href={`${checkoutPath}?page=shipping`}
                    className={'btn'}
                    aria-label="Edit contact information"
                  >
                    edit
                  </a>
                </Link>
              </div>
            </div>
            <div className={'row info-row'}>
              <div className={'col'}>
                <label className={'header'}>Shipping Address</label>

                {shippingIsComplete ? (
                  <>
                    <div>{shippingName}</div>
                    {shippingCompanyName ? (
                      <div>{shippingCompanyName}</div>
                    ) : null}
                    <div>{shippingAddress1}</div>
                    {shippingAddress2 ? <div>{shippingAddress2}</div> : null}
                    <div>
                      {`${shippingCity}, ${shippingState} ${shippingZip}`}
                    </div>
                  </>
                ) : (
                  <div className="t--err t--info">
                    You need to edit your shipping info to fix some errors
                  </div>
                )}
              </div>

              <div className={'col'}>
                <Link href={`${checkoutPath}?page=shipping`}>
                  <a
                    href={`${checkoutPath}?page=shipping`}
                    className={'btn'}
                    aria-label="Edit shipping address"
                  >
                    edit
                  </a>
                </Link>
              </div>
            </div>
            <div className={'row info-row'}>
              <div className={'col'}>
                <label className={'header'}>Payment Information</label>

                {paymentIsComplete ? (
                  <>
                    <div>{cardholderName}</div>
                    <div>•••• •••• •••• {cardLast4 || ''}</div>
                    <div>{billingAddress1}</div>
                    {billingAddress2 ? <div>{billingAddress2}</div> : null}
                    <div>
                      {billingCity}, {billingState} {billingZip}
                    </div>
                  </>
                ) : (
                  <div className="t--err t--info">
                    You need to edit your payment info to fix some errors
                  </div>
                )}
              </div>

              <div className={'col'}>
                <Link href={`${checkoutPath}?page=payment`}>
                  <a
                    href={`${checkoutPath}?page=payment`}
                    className={'btn'}
                    aria-label="Edit payment information"
                  >
                    edit
                  </a>
                </Link>
              </div>
            </div>
            <div
              className={
                certificateType === 'death' ? 'row info-row' : 'row'
              }
            >
              <div className={'col'}>
                <label className={'header'}>Order Details</label>
                {certificateType === 'death' && (
                  <div className="death-order-items">{certEntries()}</div>
                )}
              </div>

              <div className={'col'}>
                <Link
                  href={`${
                    certificateType === 'death'
                      ? '/death/cart'
                      : `/${certificateType}/review`
                  }`}
                >
                  <a
                    href={`${
                      certificateType === 'death'
                        ? '/death/cart'
                        : `/${certificateType}/review`
                    }`}
                    className={'btn'}
                    aria-label="Edit order details"
                  >
                    edit
                  </a>
                </Link>
              </div>
            </div>

            {certificateType !== 'death' && certEntries()}

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
              <div className="t--info m-v300 death-charge-note" id="charge-message">
                <strong>Payment notice:</strong> When you submit your order,
                we’ll place a temporary authorization hold on your card. You’ll
                only be charged if the Registry approves your order. Once
                charged, certificate fees are non-refundable.
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
                    <a
                      href={`${checkoutPath}?page=payment`}
                      className="btn"
                    >
                      Re-try
                    </a>
                  </Link>
                </div>
              </StatusModal>
            )}
            <div className="m-v300">
              <button
                className="btn"
                style={{ display: 'block', width: '100%' }}
                type="button"
                aria-disabled={
                  !paymentIsComplete ||
                  !shippingIsComplete ||
                  quantity === 0 ||
                  needsAccepting ||
                  processing ||
                  !!submissionError
                }
                aria-describedby="charge-message"
                onClick={ev => {
                  if (
                    !paymentIsComplete ||
                    !shippingIsComplete ||
                    quantity === 0 ||
                    needsAccepting ||
                    processing ||
                    !!submissionError
                  ) {
                    ev.preventDefault();
                    return;
                  }
                  this.handleSubmit(ev as any);
                }}
              >
                Submit Order
              </button>
            </div>
            {this.props.certificateType === 'death' && (
              <div className="ta-c t--info m-v700">
                <Link href="/death">
                  <a href="/death">I’m not done yet, go back to search</a>
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
    const isDeath = this.props.certificateType === 'death';

    const { acceptNonRefundable, acceptPendingCertificates } = this.state;

    const headingId = 'review-accept-heading';

    // Death: only the pending-certificate checkbox remains (non-refundable
    // copy moved into the payment notice). Skip the section when not needed.
    if (isDeath && !containsPending) {
      return null;
    }

    const heading =
      'You have to read and accept this checkbox before you place your order:';

    const checkboxes = (
      <>
        {!isDeath && (
          <div className="m-v300">
            <label className="cb" htmlFor="acceptNonRefundableInput">
              <input
                id="acceptNonRefundableInput"
                name="acceptNonRefundable"
                type="checkbox"
                value="true"
                checked={acceptNonRefundable}
                className="cb-f"
                aria-required="true"
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
        )}

        {containsPending && (
          <div className={isDeath ? 'death-accept-box m-v300' : 'm-v300'}>
            <label
              className={isDeath ? 'cb death-accept-label' : 'cb'}
              htmlFor="acceptPendingCertificatesInput"
            >
              <input
                id="acceptPendingCertificatesInput"
                name="acceptPendingCertificates"
                type="checkbox"
                value="true"
                checked={acceptPendingCertificates}
                className={isDeath ? 'cb-f death-accept-checkbox' : 'cb-f'}
                aria-required="true"
                onChange={this.handleAcceptPendingCertificates}
              />
              <span className={isDeath ? 'cb-l death-accept-text' : 'cb-l'}>
                I understand that this order has{' '}
                <strong>pending death certificates</strong>, which may not be
                accepted by insurance or banking companies.
              </span>
            </label>
          </div>
        )}
      </>
    );

    if (isDeath) {
      return (
        <fieldset
          className="m-v700 death-accept-fieldset"
          aria-labelledby={headingId}
        >
          <legend id={headingId} className="t--info death-accept-legend">
            {heading}
          </legend>
          {checkboxes}
        </fieldset>
      );
    }

    return (
      <div className="m-v700">
        <div className="t--info" id={headingId}>
          {heading}
        </div>
        {checkboxes}
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
      line-height: 29px;
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
  .m-v300 .btn[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/** Death STEP 7 review — padding, order-item fields, bordered accept checkbox */
const DEATH_REVIEW_CSS = css`
  .info-row {
    margin-bottom: 3rem;
    padding-bottom: 3rem;
    border-bottom: 1px solid ${GRAY_400};
  }

  .info-row .col:first-of-type {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-width: 0;
    font-family: ${SERIF};
    font-size: 1.125rem;
    line-height: 1.3;
    color: ${CHARLES_BLUE};
  }

  .info-row .info {
    margin-bottom: 0;
  }

  .row label.header {
    margin: 0;
    /* Keep section titles distinct from body copy below */
    font-size: 24px;
    line-height: 29px;
  }

  .death-order-items {
    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
  }

  .death-order-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 1.5rem 0;
    border-bottom: 1px solid ${GRAY_400};
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: inherit;

    p {
      margin: 0;
    }

    &:first-of-type {
      padding-top: 0;
    }

    &:last-of-type {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .death-order-item-label {
    font-weight: 700;
  }

  .death-accept-box {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid #d2d2d2;
    padding: 0;
    background: ${WHITE};
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }

  .death-accept-box:hover {
    background: #f2f2f2;
    border-color: ${OPTIMISTIC_BLUE_DARK};
    cursor: pointer;
  }

  .death-accept-box:active {
    background: #e8e8e8;
  }

  .death-accept-box:focus-within {
    outline: 2px solid ${OPTIMISTIC_BLUE_DARK};
    outline-offset: 2px;
  }

  .death-accept-fieldset {
    border: 0;
    margin: 2.5rem 0;
    padding: 0;
    min-width: 0;
  }

  .death-accept-legend {
    display: block;
    padding: 0;
    float: none;
    width: 100%;
  }

  .death-accept-label.cb {
    display: flex;
    align-items: center;
    gap: 0;
    margin: 0;
    padding: 10px;
    width: 100%;
    min-height: 100%;
    box-sizing: border-box;
    cursor: pointer;
  }

  /*
   * Fleet paints .cb-f:before absolute to .cb (top-left of the label).
   * Make the input the positioning context so the visual sits on the
   * control, then center that control in the bordered box.
   */
  .death-accept-checkbox.cb-f {
    position: relative;
    flex-shrink: 0;
    align-self: center;
    width: 22px;
    height: 22px;
    margin: 0 12px 0 0;
    padding: 0;
    transform: none;
  }

  .death-accept-checkbox.cb-f:before {
    position: absolute;
    top: 0;
    left: 0;
    width: 22px;
    height: 22px;
    border-width: 2px;
    background-size: 70% !important;
  }

  .death-accept-text.cb-l {
    flex: 1;
    min-width: 0;
    width: auto;
    margin-left: 0;
    font-family: ${SERIF};
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.35;
    color: ${CHARLES_BLUE};
    white-space: normal;
  }

  .death-charge-note {
    font-size: 1rem !important;
    line-height: 1.4;
  }
`;
