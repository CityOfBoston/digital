/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component } from 'react';

import Head from 'next/head';

import { observer } from 'mobx-react';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from '../PageWrapper';

import ReviewCertificateRequest from '../common/ReviewCertificateRequest';

import { ServiceFeeDisclosure } from '../common/FeeDisclosures';

import {
  SECTION_HEADING_STYLING,
  DISCLAIMER_STYLING,
} from '../common/question-components/styling';

interface Props
  extends Pick<
    PageDependencies,
    'marriageIntentionCertificateRequest' | 'siteAnalytics'
  > {}

/**
 * Component which allows a user to review their request, and update the
 * quantity of marriage-intention certificates they are requesting.
 *
 * User can proceed to /checkout, go back to the questions flow, or
 * clear all information and start over.
 */
@observer
export default class ReviewRequestPage extends Component<Props> {
  public render() {
    const { steps } = this.props.marriageIntentionCertificateRequest;
    const pageTitle = 'Review your record request';

    return (
      <PageWrapper
        certificateType="marriage-intention"
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
          certificateType="marriage-intention"
          certificateRequest={this.props.marriageIntentionCertificateRequest}
          siteAnalytics={this.props.siteAnalytics}
        >
          <div css={DISCLAIMER_STYLING}>
            <p>
              You can only order copies of one person's marriage-intention
              certificate at a time. Want to order copies of a certificate for
              another person? Please put in a separate request.
            </p>

            <p>
              Do you need a certificate for international use that requires an
              Apostille from the Massachusetts Secretary of State's Office?
              Follow these steps:
            </p>

            <ol>
              <li>
                Request a certified marriage-intention certificate from the City
                of Boston Registry. You don’t need extra information or
                paperwork.
              </li>
              <li>
                Submit the certificate to the
                <a href="https://www.sec.state.ma.us/pre/precom/comidx.htm">
                  Massachusetts Secretary of State's Office
                </a>
                .
              </li>
            </ol>
          </div>
        </ReviewCertificateRequest>
      </PageWrapper>
    );
  }
}
