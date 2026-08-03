import React, { Component } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { runInAction } from 'mobx';
import Router from 'next/router';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';

import DeathCertificateCart from '../../store/DeathCertificateCart';
import CertifiedMail from '../../models/CertifiedMail';
import CardType from '../../models/CardType';
import UploadableFile from '../../models/UploadableFile';

import CartPage from './CartPage';
import InteractiveDeathFlow from '../certificate/InteractiveDeathFlow';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';

function makeUploadedFile(name: string, sessionId: string) {
  return UploadableFile.fromRecord(
    { attachmentKey: `storybook-${name}`, name },
    sessionId
  );
}

function seedFullCart(cart: DeathCertificateCart) {
  cart.setCertificateOptions(TYPICAL_CERTIFICATE, 2, {
    includeSsn: true,
    relationship: 'spouse',
    identityDocumentType: 'drivers-license',
    uploadSessionId: 'storybook-session-1',
    relationshipDocuments: [
      makeUploadedFile('relationship.pdf', 'storybook-session-1'),
    ],
    identityDocuments: [
      makeUploadedFile('license.pdf', 'storybook-session-1'),
    ],
  });

  cart.setCertificateOptions(PENDING_CERTIFICATE, 1, {
    includeSsn: false,
    relationship: '',
    identityDocumentType: '',
    uploadSessionId: 'storybook-session-2',
    relationshipDocuments: [],
    identityDocuments: [],
  });

  cart.setQuantity(NO_DATE_CERTIFICATE, 3);
}

function makeLoadingCart() {
  const cart = new DeathCertificateCart();

  runInAction(() => {
    cart.pendingFetches = 2;
    cart.entries = [
      {
        id: TYPICAL_CERTIFICATE.id,
        cert: null,
        quantity: 5,
        includeSsn: null,
        relationship: '',
        identityDocumentType: '',
        uploadSessionId: '',
        relationshipDocuments: [],
        identityDocuments: [],
      },
      {
        id: PENDING_CERTIFICATE.id,
        cert: null,
        quantity: 3,
        includeSsn: null,
        relationship: '',
        identityDocumentType: '',
        uploadSessionId: '',
        relationshipDocuments: [],
        identityDocuments: [],
      },
    ] as any;
  });

  return cart;
}

function resolvingProviders(opts?: {
  certifiedMail?: boolean;
  cardType?: '-1' | '0' | '1';
}) {
  const certMail = new CertifiedMail({
    requestCertifiedMail: !!(opts && opts.certifiedMail),
    certMailForBirth: false,
    certMailForMarriage: false,
    certMailForDeath: !!(opts && opts.certifiedMail),
  });
  const cardType = new CardType({
    cardType: (opts && opts.cardType) || '1',
  });

  return {
    certMail,
    cardType,
    certMailProvider: {
      get: () => Promise.resolve(certMail),
    },
    cardTypeProvider: {
      get: () => Promise.resolve(cardType),
    },
  };
}

type ShellProps = {
  deathCertificateCart: DeathCertificateCart;
  certifiedMail?: boolean;
  cardType?: '-1' | '0' | '1';
};

/**
 * Static CartPage shell for loading / empty stories (no interactive navigation).
 */
class CartPageStoryShell extends Component<ShellProps> {
  private previousRouter: any = null;
  private siteAnalytics = new GaSiteAnalytics();
  private providers = resolvingProviders({
    certifiedMail: this.props.certifiedMail,
    cardType: this.props.cardType,
  });

  componentDidMount() {
    this.previousRouter = (Router as any).router;

    const handlePush = (url: any) => {
      const href =
        typeof url === 'string'
          ? url
          : url && url.pathname
            ? url.pathname
            : String(url);
      action('navigate')(href);
      return Promise.resolve(true);
    };

    (Router as any).router = {
      pathname: '/death/cart',
      route: '/death/cart',
      query: {},
      asPath: '/death/cart',
      components: {},
      push: handlePush,
      replace: handlePush,
      prefetch: () => Promise.resolve(),
      reload: () => {},
      back: () => {},
      beforePopState: () => {},
      events: { on: () => {}, off: () => {}, emit: () => {} },
    };
  }

  componentWillUnmount() {
    (Router as any).router = this.previousRouter;
  }

  render() {
    const { deathCertificateCart } = this.props;
    const { certMail, cardType, certMailProvider, cardTypeProvider } =
      this.providers;

    return (
      <CartPage
        deathCertificateCart={deathCertificateCart}
        siteAnalytics={this.siteAnalytics}
        certMailProvider={certMailProvider as any}
        cardTypeProvider={cardTypeProvider as any}
        certifiedMailForTest={certMail}
        cardTypeForTest={cardType}
      />
    );
  }
}

storiesOf('Death/CartPage', module)
  .add('full page', () => (
    <InteractiveDeathFlow
      initialStep="cart"
      seedCart={seedFullCart}
      cardType="1"
    />
  ))
  .add('full page — with certified mail', () => (
    <InteractiveDeathFlow
      initialStep="cart"
      seedCart={seedFullCart}
      certifiedMail
      cardType="1"
    />
  ))
  .add('empty cart', () => <InteractiveDeathFlow initialStep="cart" />)
  .add('loading', () => (
    <CartPageStoryShell deathCertificateCart={makeLoadingCart()} />
  ));
