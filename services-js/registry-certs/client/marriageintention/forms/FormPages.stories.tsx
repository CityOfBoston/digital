import React from 'react';
import { storiesOf } from '@storybook/react';

import { MarriageIntentionCertificateRequestInformation } from '../../types';
import MarriageIntentionCertificateRequest from '../../store/MarriageIntentionCertificateRequest';

import { GaSiteAnalytics } from '@cityofboston/next-client-common';
import MarriageIntentionDao from '../../dao/MarriageIntentionDao';

import IndexPage from '../index';
import PartnerView from '../forms/partnerView';
import {
  formatDate,
  getStateFullName,
  getCountryFullName,
  yesNoAnswer,
} from '../helpers/formUtils';
import ContactUX from './reviewUI/contact';

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
      completedSteps={new Set([0])}
    />
  ))
  .add('Step 2. Person 1', () => (
    <IndexPage
      currentStep="partnerFormA"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
      completedSteps={new Set([0, 1])}
    />
  ))
  .add('Step 3. Person 2', () => (
    <IndexPage
      currentStep="partnerFormB"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
      completedSteps={new Set([0, 1, 2])}
    />
  ))
  .add('Step 4. Contact Info', () => (
    <IndexPage
      currentStep="contactInfo"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
      completedSteps={new Set([0, 1, 2, 3])}
    />
  ))
  .add('Step 5. Review/Full Form', () => (
    <IndexPage
      currentStep="reviewForms"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
      completedSteps={new Set([0, 1, 2, 3])}
    />
  ))
  .add('Step 5. Review/Person Info View', () => {
    const marriageIntentionCertificateRequest = makeMarriageIntentionCertificateRequest();

    return (
      <PartnerView
        marriageIntentionCertificateRequest={
          marriageIntentionCertificateRequest
        }
        partnerLabel={'A'}
        firstName={`Phillip`}
        lastName={`Kelly`}
        suffix={``}
        middleName={`Benton`}
        surName={`Kelly`}
        dob={formatDate(new Date(`1982-09-23T00:00:00.000Z`))}
        age={`41`}
        occupation={`Developer`}
        address={`
          ${`100 Howard Ave. Apt 2`},
          ${`Boston`}
          ${getStateFullName(`MA`)} 
          ${`02125`} 
          ${getCountryFullName(`USA`)}
        `}
        birthCity={`La Ceiba`}
        birthState={getStateFullName(`Atlantida`)}
        birthCountry={getCountryFullName(`HND`)}
        marriageNumb={`2nd`}
        lastMarriageStatus={`CRT`}
        partnerShipType={`DOM`}
        partnerShipDissolve={`Yes`}
        parentA={`Mother F. Mother L.`}
        parentB={`Father F. Father L.`}
        parentsMarriedAtBirth={yesNoAnswer('0')}
        bloodRelation={yesNoAnswer(`1`)}
        bloodRelationDesc={`Third Cousin's Removed`}
        partnershipState={`Boston, USA`}
        stepStr={`partnerFormA`}
      />
    );
  })
  .add('Step 5. Review - Contact [Section]', () => {
    return (
      <ContactUX
        appointmentDateTime={formatDate(new Date(`1982-09-23T00:00:00.000Z`))}
        requestInformation={{
          email: 'phillip.kelly@boston.gov',
          dayPhone: '6170001111',
        }}
      />
    );
  })
  .add('Step 6. Submit', () => (
    <IndexPage
      currentStep="reviewRequest"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
      completedSteps={new Set([0, 1, 2, 3, 4, 5])}
    />
  ));
