import React from 'react';
import Head from 'next/head';

import { DeathCertificateOrder } from '../../types';

import { getDependencies, ClientContext, ClientDependencies } from '../../app';

import { GRAY_200 } from '../../common/style-constants';

interface Props {
  order: DeathCertificateOrder | null;
}

export default class ReceiptPage extends React.Component<Props> {
  static async getInitialProps(
    ctx: ClientContext,
    dependenciesForTest?: ClientDependencies
  ): Promise<Props> {
    const {
      query: { id, contactEmail },
      res,
    } = ctx;
    const { deathCertificatesDao } =
      dependenciesForTest || getDependencies(ctx);

    if (!id) {
      throw new Error('Missing id');
    }

    if (!contactEmail) {
      throw new Error('Missing contactEmail');
    }

    const order = await deathCertificatesDao.lookupOrder(id, contactEmail);

    if (!order && res) {
      res.statusCode = 404;
    }

    return {
      order,
    };
  }

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
      <div className="b-ff">
        <Head>
          <title>Boston.gov — Death Certificates — Order #{order.id}</title>
        </Head>

        <div className="b-c b-c--hsm b-ff">
          <div className="lo m-b300 logo-holder">
            <span className="lo-l">
              <img
                src="https://patterns.boston.gov/images/public/logo.svg"
                alt="City of Boston"
                className="lo-i"
              />
            </span>
            <a
              className="print-button"
              href="javascript:void(0)"
              onClick={() => window.print()}
              style={{ fontStyle: 'italic' }}
            >
              Print this page
            </a>
          </div>

          <div className="b--g br br-a200">
            <div className="p-a300" style={{ paddingBottom: 0 }}>
              <div className="sh sh--sm">
                <h1 className="sh-title">Thank you for your order</h1>
              </div>

              <div className="m-t300 t--cb">
                <div className="g">
                  <div className="g--6">
                    <div className="m-t200">
                      <span className="receipt-title">Date:</span>{' '}
                      <span className="receipt-value">{date}</span>
                    </div>
                    <div className="m-t200">
                      <span className="receipt-title">Order #:</span>{' '}
                      <span className="receipt-value">{id}</span>
                    </div>
                  </div>

                  <div className="g--6">
                    <div className="m-t200 receipt-title">
                      Shipping information:
                    </div>
                    <div className="receipt-value">
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
                    className="receipt-title"
                    style={{ fontSize: '1.333rem' }}
                  >
                    Order:
                  </div>
                  <table>
                    <tbody>
                      {items.map(
                        ({ certificate, quantity, cost }) =>
                          certificate && (
                            <tr key={certificate.id}>
                              <td className="receipt-value">
                                {quantity} × Death certificate for{' '}
                                {certificate.firstName} {certificate.lastName}{' '}
                                (#{certificate.id})
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
                        <td className="receipt-value">Subtotal</td>
                        <td className="ta-r" style={{ fontWeight: 'bold' }}>
                          ${(subtotal / 100).toFixed(2)}
                        </td>
                      </tr>

                      <tr>
                        <td className="receipt-value">Card service fee*</td>
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
              <table>
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

          <div className="t--info m-v300 seal-holder">
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

        <style jsx>
          {`
            @media print {
              .print-button {
                display: none;
              }

              * {
                color: #000 !important;
              }

              .b-c--hsm {
                min-width: 100% !important;
                padding: 0 !important;
              }

              .b--g {
                background-color: white !important;
              }
            }

            .logo-holder {
              display: flex;
              justify-content: space-between;
            }

            .receipt-title {
              font-weight: bold;
              line-height: 1.4;
            }

            .receipt-value {
              font-style: italic;
              line-height: 1.4;
            }

            table {
              width: 100%;
              line-height: 1.4;
            }

            .seal-holder {
              display: flex;
              align-items: center;
            }
          `}
        </style>
      </div>
    );
  }
}
