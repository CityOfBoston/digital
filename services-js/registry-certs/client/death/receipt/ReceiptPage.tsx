/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { Component } from 'react';
import Head from 'next/head';

import { DeathCertificateOrder } from '../../types';
import { GetInitialProps } from '../../../pages/_app';

import { BLACK, GRAY_200, MEDIA_PRINT, WHITE } from '@cityofboston/react-fleet';
import { getParam } from '@cityofboston/next-client-common';

interface Props {
  order: DeathCertificateOrder | null;
}

export default class ReceiptPage extends Component<Props> {
  static getInitialProps: GetInitialProps<
    Props,
    'query' | 'res',
    'deathCertificatesDao'
  > = async ({ query, res }, { deathCertificatesDao }) => {
    const id = getParam(query.id);
    const contactEmail = getParam(query.contactEmail);

    if (!id) {
      throw new Error('Missing id');
    }

    if (!contactEmail || Array.isArray(contactEmail)) {
      throw new Error('Missing contactEmail');
    }

    const order = await deathCertificatesDao.lookupOrder(id, contactEmail);

    if (!order && res) {
      res.statusCode = 404;
    }

    return {
      order,
    };
  };

  render() {
    const { order } = this.props;

    if (!order) {
      throw new Error('Order was not found');
    }

    const {
      id,
      date,
      shippingName,
      shippingCompanyName,
      shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingState,
      shippingZip,
      items,
      subtotal,
      serviceFee,
      total,
    } = order;

    return (
      <div className="b-ff" css={PAGE_STYLE}>
        <Head>
          <title>Boston.gov — Death Certificates — Order #{order.id}</title>
        </Head>

        <div className="b-c b-c--hsm b-ff" css={MAIN_BLOCK_STYLE}>
          <div className="lo m-b300" css={LOGO_HOLDER_STYLE}>
            <span className="lo-l">
              <img
                src="https://patterns.boston.gov/images/public/logo.svg"
                alt="City of Boston"
                className="lo-i"
              />
            </span>
            <a
              css={PRINT_BUTTON_STYLE}
              href="javascript:void(0)"
              onClick={() => window.print()}
            >
              Print this page
            </a>
          </div>

          <div className="b--g br br-a200" css={RECEIPT_CONTENT_STYLE}>
            <div className="p-a300" style={{ paddingBottom: 0 }}>
              <div className="sh sh--sm">
                <h1 className="sh-title">Thank you for your order</h1>
              </div>

              <div className="m-t300 t--cb">
                <div className="g">
                  <div className="g--6">
                    <div className="m-t200">
                      <span css={RECEIPT_TITLE_STYLE}>Date:</span>{' '}
                      <span css={RECEIPT_VALUE_STYLE}>{date}</span>
                    </div>
                    <div className="m-t200">
                      <span css={RECEIPT_TITLE_STYLE}>Order #:</span>{' '}
                      <span css={RECEIPT_VALUE_STYLE}>{id}</span>
                    </div>
                  </div>

                  <div className="g--6">
                    <div className="m-t200" css={RECEIPT_TITLE_STYLE}>
                      Shipping information:
                    </div>
                    <div css={RECEIPT_VALUE_STYLE}>
                      {shippingName}
                      <br />
                      {shippingCompanyName
                        ? [shippingCompanyName, <br key="br" />]
                        : null}
                      {shippingAddress1}
                      <br />
                      {shippingAddress2
                        ? [shippingAddress2, <br key="br" />]
                        : null}
                      {`${shippingCity}, ${shippingState} ${shippingZip}`}
                    </div>
                  </div>
                </div>

                <div className="m-t700">
                  <div
                    css={RECEIPT_TITLE_STYLE}
                    style={{ fontSize: '1.333rem' }}
                  >
                    Order:
                  </div>
                  <table css={ITEMS_TABLE_STYLE}>
                    <tbody>
                      {items.map(
                        ({ certificate, quantity, cost }) =>
                          certificate && (
                            <tr key={certificate.id}>
                              <td css={RECEIPT_VALUE_STYLE}>
                                {quantity} × Death certificate for{' '}
                                {certificate.firstName} {certificate.lastName}
                              </td>
                              <td
                                className="ta-r"
                                style={{ fontWeight: 'bold' }}
                              >
                                ${(cost / 100).toFixed(2)}
                              </td>
                            </tr>
                          )
                      )}

                      <tr>
                        <td css={RECEIPT_VALUE_STYLE}>Subtotal</td>
                        <td className="ta-r" style={{ fontWeight: 'bold' }}>
                          ${(subtotal / 100).toFixed(2)}
                        </td>
                      </tr>

                      <tr>
                        <td css={RECEIPT_VALUE_STYLE}>Card service fee*</td>
                        <td className="ta-r" style={{ fontWeight: 'bold' }}>
                          ${(serviceFee / 100).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div
              className="p-a300"
              style={{
                paddingTop: '0.25rem',
                paddingBottom: '0.25rem',
                backgroundColor: GRAY_200,
              }}
            >
              <table css={ITEMS_TABLE_STYLE}>
                <tbody>
                  <tr className="total-row t--sans sh--sm">
                    <td className="sh-title">Total</td>
                    <td className="ta-r sh-title" style={{ padding: 0 }}>
                      ${(total / 100).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-a300">
              <div className="t--cb m-v300">
                Your order will be shipped within 1–2 business days via the U.S.
                Postal Service.
              </div>

              <div className="t--subinfo m-t300">
                * You are charged an extra service fee to pay for the cost of
                card processing. This fee goes directly to a third party, not
                the City of Boston.
              </div>
            </div>
          </div>

          <div className="t--info m-v300" css={SEAL_HOLDER_STYLE}>
            <img
              src="https://patterns.boston.gov/images/public/seal.svg"
              alt=""
              className="s-i"
              style={{ width: 75, height: 75 }}
            />

            <div className="m-l300">
              Have any questions? Contact the Registry on weekdays from 9 a.m. –
              4 p.m. at <a href="tel:617-635-4175">617-635-4175</a>, or email{' '}
              <a href="mailto:registry@boston.gov">registry@boston.gov</a>.
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const PAGE_STYLE = css({
  [MEDIA_PRINT]: {
    ' *': {
      color: `${BLACK} !important`,
    },
  },
});

const MAIN_BLOCK_STYLE = css({
  [MEDIA_PRINT]: {
    minWidth: '100% !important',
    padding: '0 !important',
  },
});

const PRINT_BUTTON_STYLE = css({
  fontStyle: 'italic',
  [MEDIA_PRINT]: {
    display: 'none',
  },
});

const RECEIPT_CONTENT_STYLE = css({
  [MEDIA_PRINT]: {
    backgroundColor: `${WHITE} !important`,
  },
});

const LOGO_HOLDER_STYLE = css({
  display: 'flex',
  justifyContent: 'space-between',
});

const RECEIPT_TITLE_STYLE = css({
  fontWeight: 'bold',
  lineHeight: 1.4,
});

const RECEIPT_VALUE_STYLE = css({
  fontStyle: 'italic',
  lineHeight: 1.4,
});

const ITEMS_TABLE_STYLE = css({
  width: '100%',
  lineHeight: 1.4,
});

const SEAL_HOLDER_STYLE = css({
  display: 'flex',
  alignItems: 'center',
});
