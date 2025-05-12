/** @jsx jsx */

import {
  // css,
  jsx,
} from '@emotion/core';

import {
  // ChangeEvent,
  Component,
} from 'react';
import { computed, action } from 'mobx';
import { observer } from 'mobx-react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart, {
  DeathCertificateCartEntry,
} from '../../store/DeathCertificateCart';

import { $CartItem } from './NewCartItem';

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

  handleQuantityChange2 = action(
    'CartItem > handleQuantityChange',
    (quantity: number) => {
      const {
        cart,
        siteAnalytics,
        entry: { cert },
      } = this.props;

      if (!cert) {
        return;
      }

      if (!isNaN(quantity)) {
        cart.setQuantity(cert, quantity);
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
      // lastRow,
    } = this.props;

    if (!cert) {
      return null;
    }

    // We define this here because if we put it in the CertificateRow callback
    // MobX doesn't capture it as a dependency, due to an intermediary render.
    const { quantityValue } = this;

    return (
      <div>
        {parseInt(quantityValue) > 0 &&
          $CartItem({
            type: 'death',
            cert: cert,
            quantity: parseInt(quantityValue),
            handleQuantityChange: this.handleQuantityChange2,
            handleRemove: this.handleRemove,
          })}
      </div>
    );
  }
}

// const QUANTITY_BOX_STYLE = css({
//   width: '2.5rem',
//   height: '2.5rem',
//   marginRight: '1rem',
//   fontFamily: 'inherit',
//   fontStyle: 'italic',
//   fontSize: '1rem',
//   background: OPTIMISTIC_BLUE_DARK,
//   color: WHITE,
//   textAlign: 'right',
//   padding: '0.5rem',
// });

// const REMOVE_BUTTON_STYLE = css({
//   border: 'none',
//   background: 'transparent',
//   color: FREEDOM_RED_DARK,
//   fontSize: '2.5rem',
//   verticalAlign: 'middle',
//   cursor: 'pointer',
//   padding: '0 0 0.2em',
// });
