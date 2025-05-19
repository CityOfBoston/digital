/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component } from 'react';

import { action } from 'mobx';
import { observer } from 'mobx-react';

// import Link from 'next/link';

import VelocityTransitionGroup from 'velocity-react/velocity-transition-group';

import { CARDTYPE } from '../../models/CardType';

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
  calculateDebitCardCost,
  CERTIFICATE_COST,
  CERTIFICATE_COST_STRING,
} from '../../../lib/costs';

import { CertificateType, DeathCertificate } from '../../types';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';

import {
  serviceFeeDisclosureText,
  researchFeeDisclosureText,
} from '../FeeDisclosures';

import CertificateRow from '../../common/CertificateRow';

import CertItem from '../components/CertItem';
import {
  capFirstLetterOfStr,
  formatCheckoutDate,
  ReactKeyIndexStr,
} from '../../../utils/helpers';

type OrderDetailsProps = { inDrawer?: boolean } & (
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
    });

/**
 * Displays a list of all certificates in an order’s cart.
 * Use as child of OrderDetailsDropdown component, or it can be used alone.
 */
export const OrderDetails = observer(function OrderDetails(
  props: OrderDetailsProps
) {
  const makeWrapRow = _quantity => certificateDiv => <>{certificateDiv}</>;

  const handleQuantityChange = action(
    'CartItem > handleQuantityChange',
    (quantity: string | number | null): void => {
      const {
        siteAnalytics,
        birthCertificateRequest,
        marriageCertificateRequest,
        deathCertificateCart,
      } = this.props;

      if (!quantity) return;
      if (typeof quantity === 'string') return;

      if (!isNaN(quantity)) {
        switch (props.type) {
          case 'birth':
            birthCertificateRequest.setQuantity(quantity);
            break;
          case 'marriage':
            marriageCertificateRequest.setQuantity(quantity);
            break;
          case 'death':
            deathCertificateCart.setQuantity(quantity);
            break;
        }
      }

      if (siteAnalytics && siteAnalytics.sendEvent) {
        siteAnalytics.sendEvent('input', {
          category: 'UX',
          label: 'update quantity',
        });
      }
    }
  );

  const deathCertEntry = (data: {
    cert: DeathCertificate;
    cart: { entries: string | any[] };
    quantity: number;
    index: string;
  }) => {
    const { cert, cart, quantity = 1, index = '0' } = data;
    // const { firstName, lastName, deathDate, deathYear } = cart.entries[index];
    // const subinfo = `Date of Death: `;

    return (
      <>
        {/* <CertItem
          type={props.type}
          quantity={quantity}
          showNameLabel={true}
          pending={false}
          fullNames={`${firstName} ${lastName}`}
          subinfo={subinfo}
          dateStr={formatCheckoutDate(deathDate || deathYear)}
          key={
            index ||
            ReactKeyIndexStr({
              seedStr: `${props.type}Cert_row`,
              max: 1000,
            })
          }
          handleQuantityChange={handleQuantityChange}
        /> */}

        <CertificateRow
          type="death"
          key={
            cert.id || ReactKeyIndexStr({ seedStr: 'deathCert_row', max: 1000 })
          }
          certificate={cert}
          borderTop={parseInt(index) !== 0}
          borderBottom={parseInt(index) === cart.entries.length - 1}
          thin={props.thin}
          children={makeWrapRow(quantity)}
          quantity={quantity}
          showQuantity={true}
          showSeal={true}
          showNameLabel={true}
        />
      </>
    );
  };

  switch (props.type) {
    case 'death':
      return (
        <div>
          {props.deathCertificateCart.entries.map(
            ({ cert, quantity }, i) =>
              cert &&
              deathCertEntry({
                cert: cert,
                cart: props.deathCertificateCart,
                quantity: quantity,
                index: `${i}`,
              })
          )}
        </div>
      );
    case 'birth': {
      const { quantity, requestInformation } = props.birthCertificateRequest;
      const { birthDate, firstName, lastName } = requestInformation;
      const subinfo = `Date of Birth: `;

      return (
        <div>
          {quantity && quantity > 0 && (
            <>
              <CertItem
                type={props.type}
                quantity={quantity}
                showNameLabel={true}
                pending={false}
                fullNames={`${firstName} ${lastName}`}
                subinfo={subinfo}
                dateStr={formatCheckoutDate(birthDate)}
                key={ReactKeyIndexStr({
                  seedStr: `${props.type}Cert_row`,
                  max: 1000,
                })}
                handleQuantityChange={handleQuantityChange}
                drawer={props.inDrawer}
                hideQtyUI={true}
              />

              {/* <CertificateRow
                type={props.type}
                certificate={props.birthCertificateRequest}
                borderTop={false}
                borderBottom={true}
                thin={props.thin}
                children={makeWrapRow(props.birthCertificateRequest.quantity)}
                quantity={props.birthCertificateRequest.quantity}
                showQuantity={true}
                showNameLabel={true}
              /> */}
            </>
          )}
        </div>
      );
    }
    case 'marriage': {
      const {
        fullNames,
        requestInformation,
      } = props.marriageCertificateRequest;
      const {
        dateOfMarriageExact = null,
        dateOfMarriageUnsure = '',
      } = requestInformation;
      const dateOf_marriage = formatCheckoutDate(dateOfMarriageExact);
      const subinfo =
        dateOfMarriageUnsure.length > 0
          ? `Date (Range) of ${capFirstLetterOfStr(props.type)}: `
          : `Date of ${capFirstLetterOfStr(props.type)}: `;

      return (
        <div>
          <CertItem
            type={props.type}
            quantity={props.marriageCertificateRequest.quantity}
            showNameLabel={true}
            pending={false}
            fullNames={fullNames.replace(' & ', ' and ')}
            subinfo={subinfo}
            dateStr={dateOf_marriage}
            key={ReactKeyIndexStr({
              seedStr: `${props.type}Cert_row`,
              max: 1000,
            })}
            handleQuantityChange={handleQuantityChange}
            drawer={props.inDrawer}
            hideQtyUI={true}
          />

          {/* <CertificateRow
            type={props.type}
            certificate={props.marriageCertificateRequest}
            borderTop={false}
            borderBottom={true}
            thin={props.thin}
            children={makeWrapRow(props.marriageCertificateRequest.quantity)}
            quantity={props.marriageCertificateRequest.quantity}
            showQuantity={true}
            showNameLabel={true}
          /> */}
        </div>
      );
    }
  }
});

interface DropdownProps {
  orderType: CertificateType;
  certificateQuantity: number | string;
  startExpanded?: boolean;
  hasResearchFee?: boolean;
  drawer?: boolean;
  tracking?: boolean;
  cardType?: CARDTYPE;
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
    tracking: false,
    cardType: '0',
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
    const {
      orderType,
      children,
      tracking = false,
      cardType = '0',
    } = this.props;
    const quantity = +this.props.certificateQuantity;

    const certificateCost = CERTIFICATE_COST[orderType.toUpperCase()];

    const $DrawerUI = () => {
      const orderCost =
        cardType === '0'
          ? calculateCreditCardCost(certificateCost, quantity, false, tracking)
          : calculateDebitCardCost(certificateCost, quantity, false, tracking);
      const {
        total,
        subtotal,
        serviceFee,
        // researchFee
      } = orderCost;

      const $arrowUI = () => {
        return <div className={'arrow'} />;
      };

      return (
        <div css={DRAWER_CSS}>
          <button
            className={`drawerHeader ${open ? ' open' : ''}`}
            type="button"
            onClick={this.toggleOpen}
            aria-expanded={open}
          >
            Your order details
            {$arrowUI()}
          </button>

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
                      tracking={tracking}
                      finalCost={`${(total / 100).toFixed(2)}`}
                      serviceFeeType={cardType}
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
  tracking?: boolean;
  cardType?: CARDTYPE;
}): JSX.Element {
  const { details, tracking = false, cardType = '0' } = props;

  if (details.certificateType === 'death') {
    return (
      <>
        <OrderDetailsDropdown
          orderType="death"
          certificateQuantity={details.deathCertificateCart.size || 1}
          tracking={tracking}
          cardType={cardType}
        >
          <OrderDetails
            type="death"
            deathCertificateCart={details.deathCertificateCart}
            inDrawer={true}
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
        tracking={tracking}
        cardType={cardType}
      >
        {details.certificateType === 'birth' ? (
          <OrderDetails
            type="birth"
            birthCertificateRequest={details.birthCertificateRequest}
            inDrawer={true}
          />
        ) : (
          <OrderDetails
            type="marriage"
            marriageCertificateRequest={details.marriageCertificateRequest}
            inDrawer={true}
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

  .drawerHeader {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    cursor: pointer;
    border: 0;

    color: ${OPTIMISTIC_BLUE_DARK};
    font-family: Lora;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    text-decoration-style: solid;
    text-decoration-skip-ink: auto;
    text-decoration-thickness: auto;
    text-underline-offset: -3px;
    text-underline-position: from-font;

    .arrow {
      border: solid #1871bd;
      border-width: 0 2px 2px 0;
      display: inline-block;
      padding: 3px;
      margin-top: -3px;

      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);
    }

    [aria-expanded='true'] {
      border-color: white;
    }
  }

  // .drawerHeader:active,
  .drawerHeader:hover,
  .drawerHeader:focus {
    color: ${WHITE};
    text-decoration: underline;
    background: ${OPTIMISTIC_BLUE_DARK};
    text-decoration-line: underline;

    .arrow {
      border-color: ${WHITE};
    }
  }

  .drawerHeader[aria-expanded='true'] {
    margin-bottom: 1em;
    color: ${WHITE};
    background: ${CHARLES_BLUE};

    .arrow {
      margin-top: 6px;
      border-color: white;
      transform: rotate(-135deg);
      -webkit-transform: rotate(-135deg);
    }
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
      font-style: normal;
    }
  }
`;
