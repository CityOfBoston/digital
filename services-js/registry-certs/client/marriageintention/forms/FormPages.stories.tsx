import React from 'react';
import { storiesOf } from '@storybook/react';

import { MarriageIntentionCertificateRequestInformation } from '../../types';
import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';
import MarriageIntentionDao from '../../dao/MarriageIntentionDao';

import IndexPage from '../index';

function makeMarriageIntentionCertificateRequest(
  answers: Partial<MarriageIntentionCertificateRequestInformation> = {}
): MarriageIntentionCertificateRequest {
  const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();

  marriageIntentionCertificateRequest.answerQuestion(answers, '');

  return marriageIntentionCertificateRequest;
}

storiesOf('Marriage Intention/Form Pages', module)
  .add('Step 1. Instructions', () => (
    <IndexPage
      currentStep="instructions"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
    />
  ))
  .add('Step 2. Person 1', () => (
    <IndexPage
      currentStep="partnerFormA"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
    />
  ))
  .add('Step 3. Person 2', () => (
    <IndexPage
      currentStep="partnerFormB"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
    />
  ))
  .add('Step 4. Contact Info', () => (
    <IndexPage
      currentStep="contactInfo"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
    />
  ))
  .add('Step 5. Review', () => (
    <IndexPage
      currentStep="reviewForms"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
    />
  ))
  .add('Step 6. Submit', () => (
    <IndexPage
      currentStep="reviewRequest"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
    />
  ));
