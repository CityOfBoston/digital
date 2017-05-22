// @flow

import React from 'react';
import { css } from 'glamor';
import { computed, action, observable } from 'mobx';
import { observer } from 'mobx-react';

import type Cart, { CartItem } from '../../store/Cart';

import { GRAY_100, GRAY_300, OPTIMISTIC_BLUE } from '../../common/style-constants';

const RESULT_STYLE = css({
  background: 'white',
  borderTop: `2px solid ${GRAY_100}`,
  display: 'flex',
  alignItems: 'center',
});

const CERTIFICATE_INFO_STYLE = css({
  flex: 1,
});

const QUANTITY_BOX_STYLE = css({
  width: '2.5rem',
  height: '2.5rem',
  marginRight: '1rem',
  fontFamily: 'inherit',
  fontStyle: 'italic',
  background: OPTIMISTIC_BLUE,
  color: 'white',
  fontSize: '1rem',
  textAlign: 'right',
  padding: '0.5rem',
});

export type Props = {
  cart: Cart,
  item: CartItem,
}

@observer
export default class CheckoutItem extends React.Component {
  props: Props;

  @observable quantityHasFocus: boolean = false;

  @computed get quantityValue(): string {
    const { item: { quantity } } = this.props;

    if (quantity === 0) {
      return this.quantityHasFocus ? '' : '0';
    } else {
      return quantity.toString();
    }
  }

  @action.bound
  handleQuanityFocus() {
    this.quantityHasFocus = true;
  }

  @action.bound
  handleQuanityBlur() {
    this.quantityHasFocus = false;
  }

  handleQuantityChange = (ev: SyntheticInputEvent) => {
    const { cart, item } = this.props;

    const value = ev.target.value;

    if (value === '') {
      cart.setQuantity(item.id, 0);
    } else {
      const quantity = parseInt(value, 10);
      if (!isNaN(quantity)) {
        cart.setQuantity(item.id, quantity);
      }
    }
  }

  handleRemove = () => {
    const { cart, item } = this.props;
    cart.remove(item.id);
  }

  render() {
    const { item: { cert } } = this.props;

    if (!cert) {
      return null;
    }

    const { firstName, lastName, birthYear, deathYear, id } = cert;

    return (
      <div className={`p-a300 ${RESULT_STYLE.toString()}`}>
        <input
          aria-label="Quantity"
          value={this.quantityValue}
          onChange={this.handleQuantityChange}
          onFocus={this.handleQuanityFocus}
          onBlur={this.handleQuanityBlur}
          className={`br br-a150 ${QUANTITY_BOX_STYLE.toString()}`}
        />

        <div className={CERTIFICATE_INFO_STYLE.toString()}>
          <div>{firstName} {lastName}</div>
          <div style={{ fontStyle: 'italic' }}>
            {birthYear} – {deathYear}
            <span style={{ color: GRAY_300, paddingLeft: '1em' }}>ID:</span> {id}
          </div>
        </div>

        <button type="button" onClick={this.handleRemove}>X</button>
      </div>
    );
  }
}
