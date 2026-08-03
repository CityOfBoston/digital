/** @jsx jsx */

import {
  // css,
  jsx,
} from '@emotion/core';

import { Component } from 'react';
import { computed, action } from 'mobx';
import { observer } from 'mobx-react';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart, {
  DeathCertificateCartEntry,
  DEATH_RELATIONSHIP_OPTIONS,
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
      entry: {
        id,
        cert,
        relationship,
        includeSsn,
        relationshipDocuments,
        identityDocuments,
      },
    } = this.props;

    if (!cert) {
      return null;
    }

    const { quantityValue } = this;
    const quantity = parseInt(quantityValue, 10);

    const relationshipLabel =
      relationship && DEATH_RELATIONSHIP_OPTIONS[relationship]
        ? DEATH_RELATIONSHIP_OPTIONS[relationship].label
        : null;

    const supportingDocumentsUploaded =
      includeSsn === true &&
      relationshipDocuments.some(file => file.status === 'success') &&
      identityDocuments.some(file => file.status === 'success');

    const editHref = `/death/certificate-options?id=${encodeURIComponent(
      id
    )}&quantity=${quantity}&backUrl=${encodeURIComponent('/death/cart')}`;

    return (
      <div>
        {quantity > 0 &&
          $CartItem({
            type: 'death',
            cert: cert,
            quantity,
            handleRemove: this.handleRemove,
            relationshipLabel,
            includeSsn,
            supportingDocumentsUploaded,
            editHref,
          })}
      </div>
    );
  }
}
