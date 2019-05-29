/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component } from 'react';

import { observer } from 'mobx-react';

import Link from 'next/link';

import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

import {
  GRAY_000,
  CHARLES_BLUE,
  OPTIMISTIC_BLUE_DARK,
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
  const makeWrapRow = quantity => certificateDiv => (
    <>
      <div className="t--sans p-a300" style={{ fontWeight: 'bold' }}>
        <span aria-label="Quantity">{quantity}</span> ×
      </div>

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
    const certificateCostString =
      CERTIFICATE_COST_STRING[orderType.toUpperCase()];

    return (
      <div
        className={`dr ${open ? 'dr--open' : ''}`}
        css={[DRAWER_STYLE, open ? OPEN_DRAWER_STYLE : '']}
      >
        <button
          className="dr-h"
          css={DRAWER_HEADER_STYLE}
          type="button"
          onClick={this.toggleOpen}
          aria-expanded={open}
        >
          <div className="p-a300">
            <div className="dr-ic" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-2 8.5 18 25"
                focusable="false"
              >
                <path
                  className="dr-i"
                  css={DRAWER_ICON_STYLE}
                  d="M16 21L.5 33.2c-.6.5-1.5.4-2.2-.2-.5-.6-.4-1.6.2-2l12.6-10-12.6-10c-.6-.5-.7-1.5-.2-2s1.5-.7 2.2-.2L16 21z"
                />
              </svg>
            </div>

            <h2 className="stp">Order details</h2>

            <div className="t--info">
              {quantity} {quantity === 1 ? 'item' : 'items'} ×{' '}
              {certificateCostString} = $
              {(
                calculateCreditCardCost(certificateCost, quantity).subtotal /
                100
              ).toFixed(2)}{' '}
              + service fee*
              {this.props.hasResearchFee && (
                <>
                  <span> + research fee</span>
                  {/* dagger character looks strange when italicized */}
                  <span style={{ fontStyle: 'normal' }}>†</span>
                </>
              )}
            </div>
          </div>
        </button>

        <VelocityTransitionGroup
          enter={{ animation: 'slideDown', duration: 250 }}
          leave={{ animation: 'slideUp', duration: 250 }}
          role="region"
        >
          {open && (
            <div className="dr-c" css={DRAWER_CONTENT_STYLE}>
              {children}

              <div className="t--subinfo p-a300">
                * {serviceFeeDisclosureText()}
                {this.props.hasResearchFee && (
                  <p>
                    <span style={{ fontStyle: 'normal' }}>†</span>{' '}
                    {researchFeeDisclosureText()}
                  </p>
                )}
              </div>

              <div className="ta-c t--subinfo b--g">
                {orderType === 'death' && (
                  <Link href={`/death/cart`}>
                    <a style={{ display: 'block', padding: '0.5em' }}>
                      edit cart
                    </a>
                  </Link>
                )}
              </div>
            </div>
          )}
        </VelocityTransitionGroup>
      </div>
    );
  }
}

export default function RenderOrderDetails(props): JSX.Element {
  const { details } = props;

  if (details.certificateType === 'death') {
    return (
      <OrderDetailsDropdown
        orderType="death"
        certificateQuantity={details.deathCertificateCart.size}
      >
        <OrderDetails
          type="death"
          deathCertificateCart={details.deathCertificateCart}
        />
      </OrderDetailsDropdown>
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

const DRAWER_STYLE = css({
  backgroundColor: GRAY_000,
  marginTop: '0 !important',
});

const DRAWER_HEADER_STYLE = css({
  padding: 0,
});

const DRAWER_ICON_STYLE = css({});

const DRAWER_CONTENT_STYLE = css({
  padding: 0,
  display: 'block',
});

const OPEN_DRAWER_STYLE = css({
  '.dr-h': {
    backgroundColor: GRAY_000,
    color: CHARLES_BLUE,
  },

  '.dr-i': {
    // This is forced only on “open” so that it can go to white on hover.
    fill: `${OPTIMISTIC_BLUE_DARK} !important`,
  },
});
