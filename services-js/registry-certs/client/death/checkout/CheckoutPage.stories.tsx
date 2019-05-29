import React from 'react';
import { storiesOf } from '@storybook/react';

import CheckoutPage from './CheckoutPage';
import Cart from '../../store/DeathCertificateCart';
import { GaSiteAnalytics } from '@cityofboston/next-client-common';
import CheckoutDao from '../../dao/CheckoutDao';

storiesOf('Common Components/Checkout/CheckoutPage', module).add(
  'server-side render',
  () => (
    <CheckoutPage
      deathCertificateCart={new Cart()}
      info={{ page: 'shipping' }}
      siteAnalytics={new GaSiteAnalytics()}
      checkoutDao={new CheckoutDao(null as any, null)}
      stripe={null}
      // This never resolves, so we just get the initial render.
      orderProvider={{ get: () => new Promise(() => {}) } as any}
    />
  )
);
