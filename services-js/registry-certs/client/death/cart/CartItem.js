// @flow

import React from 'react';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';

import type Cart, { CartEntry } from '../../store/Cart';

import { FREEDOM_RED, OPTIMISTIC_BLUE } from '../../common/style-constants';

import CertificateRow from '../../common/CertificateRow';

export type Props = {
  cart: Cart,
  entry: CartEntry,
  lastRow: boolean,
};

@observer
export default class CartItem extends React.Component<Props> {
  @observable quantityHasFocus: boolean = false;

  @computed
  get quantityValue(): string {
    const { entry: { quantity } } = this.props;

    if (quantity === 0) {
      return this.quantityHasFocus ? '' : '0';
    } else {
      return quantity.toString();
    }
  }

  handleQuanityFocus = action(() => {
    this.quantityHasFocus = true;
  });

  handleQuanityBlur = action(() => {
    this.quantityHasFocus = false;
  });

  handleQuantityChange = (ev: SyntheticInputEvent<*>) => {
    const { cart, entry } = this.props;

    const value = ev.target.value;

    if (value === '') {
      cart.setQuantity(entry.id, 0);
    } else {
      const quantity = parseInt(value, 10);
      if (!isNaN(quantity)) {
        cart.setQuantity(entry.id, quantity);
      }
    }
  };

  handleRemove = () => {
    const { cart, entry } = this.props;
    cart.remove(entry.id);
  };

  render() {
    const { entry: { cert }, lastRow } = this.props;

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
              aria-label="Quantity"
              value={quantityValue}
              onChange={this.handleQuantityChange}
              onFocus={this.handleQuanityFocus}
              onBlur={this.handleQuanityBlur}
              className="br br-a150 quantity-box"
            />,

            certificateDiv,

            <button
              key="removeButton"
              className="remove-button"
              type="button"
              onClick={this.handleRemove}
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
            background: ${OPTIMISTIC_BLUE};
            color: white;
            text-align: right;
            padding: 0.5rem;
          }

          .remove-button {
            border: none;
            background: transparent;
            color: ${FREEDOM_RED};
            font-size: 2.5rem;
            line-height: 0;
            vertical-align: middle;
            cursor: pointer;
            padding: 0 0 0.2em;
          }
        `}</style>
      </div>
    );
  }
}
