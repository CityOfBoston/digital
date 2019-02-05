import React from 'react';
import Link from 'next/link';
import { css } from 'emotion';

import CheckoutPageLayout from '../common/checkout/CheckoutPageLayout';
import CertificateIcon from './icons/CertificateIcon';
import { MEDIA_LARGE_MAX } from '@cityofboston/react-fleet';

type Props = {
  orderId: string;
  contactEmail: string;
  stepCount: number;
};

const ICON_CELL_STYLE = css({
  [MEDIA_LARGE_MAX]: {
    display: 'none',
  },
});

export default function BirthConfirmationContent({
  orderId,
  stepCount,
  contactEmail,
}: Props) {
  // Rendered as a footer so we can break the narrow default width
  const footer = (
    <div className="b-c">
      <div className="g">
        <div className={`g--4 m-b500 ${ICON_CELL_STYLE}`}>
          <div className="m-h100">
            <CertificateIcon name="birth" />
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
            Your order will be shipped via USPS to the shipping address you
            provided.
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            We <strong>will not charge</strong> your card until we’ve processed
            your request. If we request more information from you and do not
            hear back from you within 3 business days, we will cancel the
            transaction.
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            Have any questions? Contact the Registry on weekdays from 9 a.m. – 4
            p.m. at <a href="tel:617-635-4175">617-635-4175</a>, or email{' '}
            <a href="mailto:registry@boston.gov">registry@boston.gov</a>.
          </p>

          <div className="ta-c m-v700">
            <Link href="/birth">
              <a className="btn">Back to start</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CheckoutPageLayout
      certificateType="birth"
      progress={{
        totalSteps: stepCount,
        currentStep: stepCount,
        currentStepCompleted: true,
      }}
      footer={footer}
    />
  );
}
