import Link from 'next/link';

import { CertificateType } from '../../types';

import CheckoutPageLayout from './CheckoutPageLayout';

import {
  CONFIRMATION_BANNER__SUCCESS,
  CONFIRMATION_RECEIPT_SUCCESS,
} from '../components';

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
    <>
      <div className="b-c">
        <CONFIRMATION_BANNER__SUCCESS>
          <label>We Received Your Order</label>
          <p>A copy of your receipt has been sent to {contactEmail}.</p>
        </CONFIRMATION_BANNER__SUCCESS>

        <CONFIRMATION_RECEIPT_SUCCESS>
          <p className="t--info" style={{ fontStyle: 'normal' }}>
            Your order number is <strong>#{orderId}</strong>
          </p>

          <p className="t--info" style={{ fontStyle: 'normal' }}>
            <strong>
              Please allow 2-3 business days for us to process your order.
            </strong>{' '}
            Your order will be shipped via U.S. Postal Service to the shipping
            address you provided.
          </p>

          <p>
            If you paid for <strong>USPS Tracking®</strong> services, a Registry
            Clerk will follow up via email with your shipment's tracking number.
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
              <a target="_blank" rel="noopener noreferrer">
                birth
              </a>
            </Link>
            ,{' '}
            <Link href="/marriage">
              <a target="_blank" rel="noopener noreferrer">
                marriage
              </a>
            </Link>
            , or{' '}
            <Link href="/death">
              <a target="_blank" rel="noopener noreferrer">
                death
              </a>
            </Link>{' '}
            certificate.
          </p>
        </CONFIRMATION_RECEIPT_SUCCESS>
      </div>
    </>
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
