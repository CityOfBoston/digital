/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Component } from 'react';

import Head from 'next/head';

import { observer } from 'mobx-react';

import { PageDependencies } from '../../pages/_app';

import PageWrapper from '../PageWrapper';

import ReviewCertificateRequest from '../common/ReviewCertificateRequest';

import { ServiceFeeDisclosure } from '../common/FeeDisclosures';

// import { AddRemoveRadioBtn } from '@cityofboston/react-fleet';

import CertifiedMail from '../models/CertifiedMail';
import CertMailTracking from '../common/CertMailTracking';
import { $CHECKOUT_DISCLAIMER_CONTENT } from '../common/content/CheckoutCertDisclaimer';

import {
  SECTION_HEADING_STYLING,
  NEW_DISCLAIMER_STYLING,
} from '../common/question-components/styling';

interface PageDependenciesProps
  extends Pick<
    PageDependencies,
    'marriageCertificateRequest' | 'certMailProvider'
  > {}

type State = {
  certMail: CertifiedMail | null;
};

interface Props extends PageDependenciesProps {
  certifiedMailForTest?: CertifiedMail;
}

/**
 * Component which allows a user to review their request, and update the
 * quantity of marriage certificates they are requesting.
 *
 * User can proceed to /checkout, go back to the questions flow, or
 * clear all information and start over.
 */
@observer
export default class ReviewRequestPage extends Component<Props, State> {
  state: State = { certMail: this.props.certifiedMailForTest || null };

  async componentDidMount() {
    const { certMailProvider } = this.props;

    // We won’t have an Order until we’re mounted in the browser because it’s
    // dependent on sessionStorage / localStorage data.
    const certMail = await certMailProvider.get();
    await new Promise((resolve: any) => this.setState({ certMail }, resolve));
  }

  public render() {
    const { steps } = this.props.marriageCertificateRequest;
    const pageTitle = 'Review your record request';

    const certMailHandler = () => {
      const { certMail } = this.state;

      if (certMail) {
        certMail.updateCertMail({
          requestCertifiedMail: !certMail.certMailInfo.requestCertifiedMail,
        });
      }
    };

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
          <div css={NEW_DISCLAIMER_STYLING}>
            {$CHECKOUT_DISCLAIMER_CONTENT()}

            <CertMailTracking
              action={
                this.state.certMail &&
                this.state.certMail.certMailInfo.requestCertifiedMail === true
                  ? 'remove'
                  : 'add'
              }
              value={
                this.state.certMail &&
                this.state.certMail.certMailInfo.requestCertifiedMail === true
                  ? 1
                  : 0
              }
              onClickHandler={certMailHandler}
            />
          </div>
        </ReviewCertificateRequest>
      </PageWrapper>
    );
  }
}
