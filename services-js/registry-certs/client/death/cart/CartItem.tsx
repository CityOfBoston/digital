import React from 'react';
import { computed, action } from 'mobx';
import { observer } from 'mobx-react';

import Cart, { CartEntry } from '../../store/Cart';
import SiteAnalytics from '../../lib/SiteAnalytics';

import CertificateRow from '../../common/CertificateRow';

export interface Props {
  cart: Cart;
  siteAnalytics: SiteAnalytics;
  entry: CartEntry;
  lastRow: boolean;
}

interface State {
  quantityHasFocus: boolean;
}

@observer
export default class CartItem extends React.Component<Props, State> {
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
    (ev: React.ChangeEvent<HTMLInputElement>) => {
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

      siteAnalytics.sendEvent('UX', 'input', 'update quantity');
    }
  );

  handleRemove = action('CartItem > handleRemove', () => {
    const { cart, entry, siteAnalytics } = this.props;
    cart.remove(entry.id);
    siteAnalytics.sendEvent('UX', 'click', 'remove from cart');
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
              className="br br-a150 quantity-box"
            />,

            certificateDiv,

            <button
              key="removeButton"
              className="remove-button"
              type="button"
              onClick={this.handleRemove}
              aria-label={`Remove ${cert.firstName} ${cert.lastName}`}
            >
              ×
            </button>,
          ]}
        </CertificateRow>

        <style jsx key="style">{`
          .quantity-box {
            width: 2.5rem;
            height: 2.5rem;
            margin-right: 1rem;
            font-family: inherit;
            font-style: italic;
            font-size: 1rem;
            background: #288be4;
            color: white;
            text-align: right;
            padding: 0.5rem;
          }

          .remove-button {
            border: none;
            background: transparent;
            color: #091f2f;
            font-size: 2.5rem;
            vertical-align: middle;
            cursor: pointer;
            padding: 0 0 0.2em;
          }
        `}</style>
      </div>
    );
  }
}
