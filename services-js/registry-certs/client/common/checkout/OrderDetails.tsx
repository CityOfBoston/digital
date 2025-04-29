/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component } from 'react';

import { observer } from 'mobx-react';

// import Link from 'next/link';

import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

// import { $Drawer } from './Drawer';
import { $OrderSummary } from '../CostSummary';

import {
  WHITE,
  GRAY_100,
  GRAY_400,
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
  SERIF,
} from '@cityofboston/react-fleet';

import {
  calculateCreditCardCost,
  CERTIFICATE_COST,
  CERTIFICATE_COST_STRING,
} from '../../../lib/costs';

import { CertificateType } from '../../types';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import {
  serviceFeeDisclosureText,
  researchFeeDisclosureText,
} from '../FeeDisclosures';

import CertificateRow from '../../common/CertificateRow';

type OrderDetailsProps =
  | {
      type: 'death';
      deathCertificateCart: DeathCertificateCart;
      thin?: boolean;
    }
  | {
      type: 'birth';
      birthCertificateRequest: BirthCertificateRequest;
      thin?: boolean;
    }
  | {
      type: 'marriage';
      marriageCertificateRequest: MarriageCertificateRequest;
      thin?: boolean;
    };

/**
 * Displays a list of all certificates in an order’s cart.
 * Use as child of OrderDetailsDropdown component, or it can be used alone.
 */
export const OrderDetails = observer(function OrderDetails(
  props: OrderDetailsProps
) {
  const makeWrapRow = _quantity => certificateDiv => (
    <>
      {/* <div className="t--sans p-a300" style={{ fontWeight: 'bold' }}>
        <span aria-label="Quantity">{_quantity}</span> ×
      </div> */}

      {certificateDiv}
    </>
  );

  switch (props.type) {
    case 'death':
      return (
        <div>
          {props.deathCertificateCart.entries.map(
            ({ cert, quantity }, i) =>
              cert && (
                <CertificateRow
                  type="death"
                  key={cert.id}
                  certificate={cert}
                  borderTop={i !== 0}
                  borderBottom={
                    i === props.deathCertificateCart.entries.length - 1
                  }
                  thin={props.thin}
                  children={makeWrapRow(quantity)}
                  quantity={quantity}
                />
              )
          )}
        </div>
      );
    case 'birth':
      return (
        <div>
          <CertificateRow
            type="birth"
            certificate={props.birthCertificateRequest}
            borderTop={false}
            borderBottom={true}
            thin={props.thin}
            children={makeWrapRow(props.birthCertificateRequest.quantity)}
          />
        </div>
      );
    case 'marriage':
      return (
        <div>
          <CertificateRow
            type="marriage"
            certificate={props.marriageCertificateRequest}
            borderTop={false}
            borderBottom={true}
            thin={props.thin}
            children={makeWrapRow(props.marriageCertificateRequest.quantity)}
          />
        </div>
      );
  }
});

interface DropdownProps {
  orderType: CertificateType;
  certificateQuantity: number | string;
  startExpanded?: boolean;
  hasResearchFee?: boolean;
  drawer?: boolean;
}

interface DropdownState {
  open: boolean;
}

/**
 * Contains all cart and cost details of an order. Always shows certificate
 * quantities, costs, and fees summary; when expanded, will also display
 * its child, service fee disclosures, and link to go back and edit cart.
 *
 * Example usage:
 *
 * <OrderDetailsDropdown orderType="death" quantity={cart.size}>
 *   <DeathOrderDetails cart={cart} />
 * </OrderDetailsDropdown>
 */
export class OrderDetailsDropdown extends Component<
  DropdownProps,
  DropdownState
> {
  static defaultProps: Partial<DropdownProps> = {
    startExpanded: false,
    hasResearchFee: false,
    drawer: false,
  };

  constructor(props: DropdownProps) {
    super(props);

    this.state = {
      open: props.startExpanded || false,
    };
  }

  private toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  render() {
    const { open } = this.state;
    const { orderType, children } = this.props;
    const quantity = +this.props.certificateQuantity;

    const certificateCost = CERTIFICATE_COST[orderType.toUpperCase()];

    const $DrawerUI = () => {
      const orderCost = calculateCreditCardCost(certificateCost, quantity);
      const {
        subtotal,
        total,
        serviceFee,
        // researchFee
      } = orderCost;

      return (
        <div css={DRAWER_CSS}>
          <div
            className={`header${open ? ' open' : ''}`}
            onClick={this.toggleOpen}
            aria-expanded={open}
          >
            Your order details
          </div>

          <div className={`body`}>
            <VelocityTransitionGroup
              enter={{ animation: 'slideDown', duration: 250 }}
              leave={{ animation: 'slideUp', duration: 250 }}
              role="region"
            >
              {open && (
                <>
                  <div className={`summary__qty`}>
                    {quantity} {quantity === 1 ? 'item' : 'items'}
                  </div>

                  <div className={`order_items`}>{children}</div>

                  <div className={`cost_summary`}>
                    <$OrderSummary
                      certQuantityLabel={`Subtotal: ${quantity} ${
                        quantity === 1 ? 'certificate' : 'certificates'
                      } × ${CERTIFICATE_COST_STRING[orderType.toUpperCase()]}`}
                      totalCost={`${(subtotal / 100).toFixed(2)}`}
                      researchFee={``}
                      tracking={true}
                      finalCost={`${(total / 100).toFixed(2)}`}
                      serviceFeeType={`1`}
                      serviceFee={`${serviceFee / 100}`}
                      useInDrawer={true}
                    />
                  </div>

                  <div className="t--subinfo notes">
                    {serviceFeeDisclosureText()}
                    {this.props.hasResearchFee && (
                      <p>
                        <span style={{ fontStyle: 'normal' }}>†</span>{' '}
                        {researchFeeDisclosureText()}
                      </p>
                    )}
                  </div>
                </>
              )}
            </VelocityTransitionGroup>
          </div>
        </div>
      );
    };

    return <>{$DrawerUI()}</>;
  }
}

export default function RenderOrderDetails(props: {
  details: any;
  drawer?: boolean;
}): JSX.Element {
  const { details } = props;

  if (details.certificateType === 'death') {
    return (
      <>
        <OrderDetailsDropdown
          orderType="death"
          certificateQuantity={details.deathCertificateCart.size}
        >
          <OrderDetails
            type="death"
            deathCertificateCart={details.deathCertificateCart}
          />
        </OrderDetailsDropdown>
      </>
    );
  } else {
    const quantity =
      details.certificateType === 'birth'
        ? details.birthCertificateRequest.quantity
        : details.marriageCertificateRequest.quantity;

    return (
      <OrderDetailsDropdown
        orderType={details.certificateType}
        certificateQuantity={quantity}
      >
        {details.certificateType === 'birth' ? (
          <OrderDetails
            type="birth"
            birthCertificateRequest={details.birthCertificateRequest}
          />
        ) : (
          <OrderDetails
            type="marriage"
            marriageCertificateRequest={details.marriageCertificateRequest}
          />
        )}
      </OrderDetailsDropdown>
    );
  }
}

const DRAWER_CSS = css`
  width: 100%;

  background: ${GRAY_100};
  background: #f2f2f2;
  margin-bottom: 3.125rem;

  .header,
  .footer {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    cursor: pointer;

    color: ${OPTIMISTIC_BLUE_DARK};
    font-family: Lora;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-decoration-style: solid;
    text-decoration-skip-ink: auto;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
    text-underline-position: from-font;

    h1 {
      font-weight: 700;
    }
  }

  .header {
    margin-bottom: 1em;

    &:hover,
    &:.open {
      color: ${WHITE};
      background: ${OPTIMISTIC_BLUE_DARK};
      text-decoration-line: underline;
    }
  }

  .header.open {
    background: ${CHARLES_BLUE};
    color: ${WHITE};
  }

  .body {
    color: ${CHARLES_BLUE};
    font-family: ${SERIF};
    font-size: 1.125em;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    padding: 0px 24px;

    .summary__qty {
      font-family: ${SERIF};
      font-size: 1.125em;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid ${GRAY_400};
    }

    .order_items {
      margin-bottom: 1.5rem;
    }

    .cost_summary,
    .notes {
      padding-bottom: 1.115rem;
    }
  }
`;
