/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { ChangeEvent, Component } from 'react';
import { computed, action } from 'mobx';
import { observer } from 'mobx-react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';
import {
  OPTIMISTIC_BLUE_DARK,
  FREEDOM_RED_DARK,
  WHITE,
} from '@cityofboston/react-fleet';

import DeathCertificateCart, {
  DeathCertificateCartEntry,
} from '../../store/DeathCertificateCart';

import CertificateRow from '../../common/CertificateRow';

export interface Props {
  cart: DeathCertificateCart;
  siteAnalytics: GaSiteAnalytics;
  entry: DeathCertificateCartEntry;
  lastRow: boolean;
}

interface State {
  quantityHasFocus: boolean;
}

@observer
export default class CartItem extends Component<Props, State> {
  state: State = {
    quantityHasFocus: false,
  };

  @computed
  get quantityValue(): string {
    const {
      entry: { quantity },
    } = this.props;
    const { quantityHasFocus } = this.state;

    if (quantity === 0) {
      return quantityHasFocus ? '' : '0';
    } else {
      return quantity.toString();
    }
  }

  handleQuantityFocus = () => {
    this.setState({ quantityHasFocus: true });
  };

  handleQuantityBlur = () => {
    this.setState({ quantityHasFocus: false });
  };

  handleQuantityChange = action(
    'CartItem > handleQuantityChange',
    (ev: ChangeEvent<HTMLInputElement>) => {
      const {
        cart,
        siteAnalytics,
        entry: { cert },
      } = this.props;

      const value = ev.target.value;
      if (!cert) {
        return;
      }

      if (value === '') {
        cart.setQuantity(cert, 0);
      } else {
        const quantity = parseInt(value, 10);
        if (!isNaN(quantity)) {
          cart.setQuantity(cert, quantity);
        }
      }

      siteAnalytics.sendEvent('input', {
        category: 'UX',
        label: 'update quantity',
      });
    }
  );

  handleRemove = action('CartItem > handleRemove', () => {
    const { cart, entry, siteAnalytics } = this.props;
    cart.remove(entry.id);
    siteAnalytics.sendEvent('click', {
      category: 'UX',
      label: 'remove from cart',
    });
  });

  render() {
    const {
      entry: { cert },
      lastRow,
    } = this.props;

    if (!cert) {
      return null;
    }

    // We define this here because if we put it in the CertificateRow callback
    // MobX doesn't capture it as a dependency, due to an intermediary render.
    const { quantityValue } = this;

    return (
      <div>
        <CertificateRow
          type="death"
          certificate={cert}
          borderTop={true}
          borderBottom={lastRow}
        >
          {certificateDiv => [
            <input
              key="quantity"
              aria-label={`Quantity for ${cert.firstName} ${cert.lastName}`}
              value={quantityValue}
              onChange={this.handleQuantityChange}
              onFocus={this.handleQuantityFocus}
              onBlur={this.handleQuantityBlur}
              className="br br-a150"
              css={QUANTITY_BOX_STYLE}
            />,

            certificateDiv,

            <button
              key="removeButton"
              css={REMOVE_BUTTON_STYLE}
              type="button"
              onClick={this.handleRemove}
              aria-label={`Remove ${cert.firstName} ${cert.lastName}`}
            >
              ×
            </button>,
          ]}
        </CertificateRow>
      </div>
    );
  }
}

const QUANTITY_BOX_STYLE = css({
  width: '2.5rem',
  height: '2.5rem',
  marginRight: '1rem',
  fontFamily: 'inherit',
  fontStyle: 'italic',
  fontSize: '1rem',
  background: OPTIMISTIC_BLUE_DARK,
  color: WHITE,
  textAlign: 'right',
  padding: '0.5rem',
});

const REMOVE_BUTTON_STYLE = css({
  border: 'none',
  background: 'transparent',
  color: FREEDOM_RED_DARK,
  fontSize: '2.5rem',
  verticalAlign: 'middle',
  cursor: 'pointer',
  padding: '0 0 0.2em',
});
