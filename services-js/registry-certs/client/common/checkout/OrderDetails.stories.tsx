import React from 'react';
import { storiesOf } from '@storybook/react';
import { runInAction } from 'mobx';

import DeathCertificateCart from '../../store/DeathCertificateCart';

import { OrderDetails, OrderDetailsDropdown } from './OrderDetails';

import {
  TYPICAL_CERTIFICATE,
  PENDING_CERTIFICATE,
  NO_DATE_CERTIFICATE,
} from '../../../fixtures/client/death-certificates';
import { TYPICAL_REQUEST as marriageCertRequest } from '../../../fixtures/client/marriage-certificates';

import BirthCertificateRequest from '../../store/BirthCertificateRequest';
import MarriageCertificateRequest from '../../store/MarriageCertificateRequest';
import { ReactKeyIndexStr } from '../../../utils/helpers';

function makeCart(loading: boolean): any {
  const cart = new DeathCertificateCart();

  if (loading) {
    runInAction(() => {
      cart.pendingFetches = 2;
      cart.entries = [
        {
          id: TYPICAL_CERTIFICATE.id,
          cert: null,
          quantity: 5,
        },
        {
          id: PENDING_CERTIFICATE.id,
          cert: null,
          quantity: 3,
        },
      ] as any;
    });
  } else {
    cart.setQuantity(TYPICAL_CERTIFICATE, 1);
    cart.setQuantity(PENDING_CERTIFICATE, 3);
    cart.setQuantity(NO_DATE_CERTIFICATE, 1);
  }

  return cart;
}

function makeBirthCertificateRequest(): BirthCertificateRequest {
  const request = new BirthCertificateRequest();

  request.quantity = 4;
  request.answerQuestion({
    firstName: 'Carol',
    lastName: 'Danvers',
    birthDate: new Date(1968, 2, 5),
  });

  return request;
}

function makeMarriageCertificateRequest(): MarriageCertificateRequest {
  const request = new MarriageCertificateRequest();

  request.quantity = 1;
  request.answerQuestion(marriageCertRequest);

  return request;
}

const loadingCart = makeCart(true);
const deathCart = makeCart(false);

storiesOf('Common Components/Order Details', module)
  .add('OrderDetailsDropdown: loading', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={loadingCart.size}
    >
      <OrderDetails
        type="death"
        deathCertificateCart={loadingCart}
        keyIndex={ReactKeyIndexStr({
          seedStr: `OrderDetailsDropdown-details-loading`,
          max: 10000,
        })}
      />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: death closed', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={deathCart.size}
    >
      <OrderDetails
        type="death"
        deathCertificateCart={deathCart}
        // keyIndex={`OrderDetailsDropdown-death-closed`}
        keyIndex={ReactKeyIndexStr({
          seedStr: `OrderDetailsDropdown-death-closed`,
          max: 10000,
        })}
      />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: death open', () => (
    <OrderDetailsDropdown
      orderType="death"
      certificateQuantity={deathCart.size}
      startExpanded
    >
      <OrderDetails
        type="death"
        deathCertificateCart={deathCart}
        // keyIndex={`${ReactKeyIndexStr({
        //   seedStr: `OrderDetailsDropdown-death-open`,
        //   max: 10000,
        // })}__${ReactKeyIndexStr({
        //   seedStr: `--`,
        //   max: 10000,
        // })}`}
      />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: birth open', () => (
    <OrderDetailsDropdown
      orderType="birth"
      certificateQuantity={4}
      startExpanded
    >
      <OrderDetails
        type="birth"
        birthCertificateRequest={makeBirthCertificateRequest()}
        // keyIndex={`story-test-birth`}
        keyIndex={ReactKeyIndexStr({
          seedStr: `OrderDetailsDropdown-birth-open`,
          max: 10000,
        })}
      />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetailsDropdown: marriage open', () => (
    <OrderDetailsDropdown
      orderType="marriage"
      certificateQuantity={1}
      startExpanded
    >
      <OrderDetails
        type="marriage"
        marriageCertificateRequest={makeMarriageCertificateRequest()}
        // keyIndex={`story-test-marriage`}
        keyIndex={ReactKeyIndexStr({
          seedStr: `OrderDetailsDropdown-marriage-open`,
          max: 10000,
        })}
      />
    </OrderDetailsDropdown>
  ))
  .add('OrderDetails: death', () => (
    <OrderDetails
      type="death"
      deathCertificateCart={deathCart}
      // keyIndex={`${ReactKeyIndexStr({
      //   seedStr: `OrderDetails-death`,
      //   max: 10000,
      // })}__${ReactKeyIndexStr({ seedStr: `--`, max: 10000 })}`}
    />
  ))
  .add('OrderDetails: birth', () => (
    <OrderDetails
      type="birth"
      birthCertificateRequest={makeBirthCertificateRequest()}
      keyIndex={ReactKeyIndexStr({ seedStr: `OrderDetails-birth`, max: 10000 })}
    />
  ))
  .add('OrderDetails: marriage', () => (
    <OrderDetails
      type="marriage"
      marriageCertificateRequest={makeMarriageCertificateRequest()}
      keyIndex={ReactKeyIndexStr({
        seedStr: `OrderDetails-marriage`,
        max: 10000,
      })}
    />
  ));
