/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import Link from 'next/link';

import { MEDIA_LARGE_MAX } from '@cityofboston/react-fleet';

import { CertificateType } from '../../types';

import CheckoutPageLayout from './CheckoutPageLayout';
import CertificateIcon from '../icons/CertificateIcon';

type Props = {
  certificateType: CertificateType;
  orderId: string;
  contactEmail: string;
  stepCount: number;
};
/**
 * Indicates to user that Birth or Marriage request/order has been placed.
 * Death uses a similar, separate component of its own for this purpose.
 */
export default function OrderConfirmationContent({
  certificateType,
  orderId,
  stepCount,
  contactEmail,
}: Props) {
  const registryEmail = `${certificateType}@boston.gov`;

  // Rendered as a footer so we can break the narrow default width
  const footer = (
    <div className="b-c">
      <div className="g">
        <div className="g--4 m-b500" css={ICON_CELL_STYLE}>
          <div className="m-h100">
            {certificateType !== 'death' && (
              <CertificateIcon name={certificateType} />
            )}
          </div>
        </div>

        <div className="g--8">
          <h2 className="h3 tt-u">Thank you</h2>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            We received your request and sent an email confirmation to:{' '}
            <strong>{contactEmail}</strong>
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            Your order number is <strong>#{orderId}</strong>
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            <strong>
              Please allow 2–3 business days for us to process your order.
            </strong>{' '}
            Your order will be shipped via U.S. Postal Service to the shipping
            address you provided.
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            We <strong>will not charge</strong> your card until we’ve processed
            your request. If we request more information from you and do not
            hear back from you within 3 business days, we will cancel the
            transaction.
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            Have any questions? Email the Registry Department at{' '}
            <a href={`mailto:${registryEmail}`}>{registryEmail}</a>.
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            Order a new{' '}
            <Link href="/birth">
              <a>birth</a>
            </Link>
            ,{' '}
            <Link href="/marriage">
              <a>marriage</a>
            </Link>
            , or{' '}
            <Link href="/death">
              <a>death</a>
            </Link>{' '}
            certificate.
          </p>
        </div>
      </div>
    </div>
  );

  window.scroll(0, 0);

  return (
    <CheckoutPageLayout
      certificateType={certificateType}
      progress={{
        totalSteps: stepCount,
        currentStep: stepCount,
        currentStepCompleted: true,
      }}
      footer={footer}
    />
  );
}

const ICON_CELL_STYLE = css({
  [MEDIA_LARGE_MAX]: {
    display: 'none',
  },
});
