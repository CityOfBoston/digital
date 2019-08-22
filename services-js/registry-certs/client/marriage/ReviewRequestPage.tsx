/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component } from 'react';

import Head from 'next/head';

import { observer } from 'mobx-react';

import { DetailsDisclosure } from '@cityofboston/react-fleet';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from '../PageWrapper';

import ReviewCertificateRequest from '../common/ReviewCertificateRequest';

import { ServiceFeeDisclosure } from '../common/FeeDisclosures';

import { SECTION_HEADING_STYLING } from '../common/question-components/styling';

interface Props extends Pick<PageDependencies, 'marriageCertificateRequest'> {}

/**
 * Component which allows a user to review their request, and update the
 * quantity of marriage certificates they are requesting.
 *
 * User can proceed to /checkout, go back to the questions flow, or
 * clear all information and start over.
 */
@observer
export default class ReviewRequestPage extends Component<Props> {
  public render() {
    const { steps } = this.props.marriageCertificateRequest;
    const pageTitle = 'Review your record request';

    return (
      <PageWrapper
        certificateType="marriage"
        progress={{
          totalSteps: steps.length,
          currentStep: steps.indexOf('reviewRequest') + 1,
          currentStepCompleted: true,
        }}
        footer={<ServiceFeeDisclosure />}
      >
        <Head>
          <title>Boston.gov — {pageTitle}</title>
        </Head>

        <h2 css={SECTION_HEADING_STYLING}>{pageTitle}</h2>

        <ReviewCertificateRequest
          certificateType="marriage"
          certificateRequest={this.props.marriageCertificateRequest}
        >
          <p>
            You can only order copies of one marriage certificate at a time. If
            you want to buy copies of a certificate for a different marriage,
            you need to do a separate transaction.
          </p>

          <DetailsDisclosure
            summaryContent="Are you requesting a certificate for international use that requires an
      Apostille from the Massachusetts Secretary of State?"
            id="apostille"
          >
            <p>
              You need to have a hand signature from the Registry. After you
              finish your order, please email marriage@boston.gov with:
            </p>

            <ul>
              <li>the names of the people on the record</li>
              <li>the date of marriage, and</li>
              <li>let us know that you need the signature for an Apostille.</li>
            </ul>
          </DetailsDisclosure>
        </ReviewCertificateRequest>
      </PageWrapper>
    );
  }
}
