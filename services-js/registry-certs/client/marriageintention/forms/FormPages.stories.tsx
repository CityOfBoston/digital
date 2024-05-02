/** @jsx jsx */

import { jsx, css } from '@emotion/core';

import React from 'react';
import { storiesOf } from '@storybook/react';

import { ToolTip } from '@cityofboston/react-fleet';

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

import {
  nameFields,
  datePlaceOfBirth,
  residence,
  marriageBlock,
} from './partnerFormUI';

import { BOSTON_NEIGHBORHOODS } from '../forms/inputData';

function makeMarriageIntentionCertificateRequest(
  answers: Partial<MarriageIntentionCertificateRequestInformation> = {}
): MarriageIntentionCertificateRequest {
  const marriageIntentionCertificateRequest = new MarriageIntentionCertificateRequest();

  marriageIntentionCertificateRequest.answerQuestion(answers, '');

  return marriageIntentionCertificateRequest;
}

const marriageIntentionCert = makeMarriageIntentionCertificateRequest();

export const updateAge = (age: string) => {
  marriageIntentionCert.answerQuestion(
    {
      partnerA_age: age,
    },
    ''
  );
};

export const calcAge = (dateObj: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dateObj.getFullYear();
  const m = today.getMonth() - dateObj.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) {
    age = age - 1;
  }

  return age;
};

export const isDateObj = (dateObj: Date | null) => {
  if (Object.prototype.toString.call(dateObj) === '[object Date]') {
    return true;
  }
  return false;
};

export const handleBirthplaceCountryChange = (event: {
  target: { value: string; name: any };
}): void => {
  console.log(
    'handleBirthplaceCountryChange: ',
    event.target.value,
    event.target,
    marriageIntentionCert.requestInformation
  );
  marriageIntentionCert.answerQuestion(
    {
      [event.target.name]: event.target.value,
    },
    ''
  );
  if (event.target.value !== 'USA') {
    marriageIntentionCert.answerQuestion(
      {
        ['partnerA_birthState']: '',
      },
      ''
    );
  }
};

export const handleBirthDateChange = (newDate): void => {
  const isDate = isDateObj(newDate);
  let age = '';
  if (isDate) {
    age = `${calcAge(newDate)}`;
    updateAge(age);
  }
  marriageIntentionCert.answerQuestion(
    {
      partnerA_dob: newDate,
    },
    ''
  );
};

export const checkBirthCityForNeighborhood = (): void => {
  const {
    partnerA_birthCountry,
    partnerA_birthCity,
    partnerA_birthState,
  } = marriageIntentionCert.requestInformation;
  const inlowerCase = partnerA_birthCity.toLowerCase();
  const isBosNeighborhood = BOSTON_NEIGHBORHOODS.indexOf(inlowerCase);

  if (
    partnerA_birthCountry === 'USA' &&
    (partnerA_birthState === 'MA' || partnerA_birthState === 'Massachusetts') &&
    isBosNeighborhood > -1
  ) {
    marriageIntentionCert.answerQuestion(
      {
        ['partnerA_birthCity']: 'Boston',
      },
      ''
    );
  }
};

export const handleChange = (event): void => {
  marriageIntentionCert.answerQuestion(
    {
      [event.target.name]: event.target.value,
    },
    ''
  );
};

storiesOf('Marriage Intention/Form', module)
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
      completedSteps={new Set([0, 1, 2, 3, 4])}
    />
  ))
  .add('Step 6. Submit', () => (
    <IndexPage
      currentStep="reviewRequest"
      siteAnalytics={new GaSiteAnalytics()}
      marriageIntentionCertificateRequest={makeMarriageIntentionCertificateRequest()}
      marriageIntentionDao={new MarriageIntentionDao(null as any)}
      completedSteps={new Set([0, 1, 2, 3, 4, 5])}
    />
  ));

storiesOf('Marriage Intention/Form Components', module)
  .add('Step 2. Person 1 - Naming Fields, no surname', () => {
    return (
      <>
        {nameFields({
          partnerFlag: `1`,
          handleChange: () => {},
          handleResidenceStateChange: () => {},
          handleUseSurnameChange: () => {},
          firstName: `Peter`,
          lastName: `Pan`,
          middleName: `Neverland`,
          surName: `Neverland`,
          useSurname: `0`,
          occupation: 'Deveveloper',
          suffix: ``,
        })}
      </>
    );
  })
  .add('Step 2. Person 1 - Naming Fields, w/surname', () => {
    return (
      <>
        {nameFields({
          partnerFlag: `1`,
          handleChange: () => {},
          handleResidenceStateChange: () => {},
          handleUseSurnameChange: () => {},
          firstName: `Peter`,
          lastName: `Pan`,
          middleName: `Neverland`,
          surName: `Neverland`,
          useSurname: `1`,
          occupation: 'Deveveloper',
          suffix: ``,
        })}
      </>
    );
  })
  .add('Step 2. Person 1 - Birth Date & Place, wo/Country', () => {
    const {
      partnerA_birthCountry,
      partnerA_birthState,
      partnerA_birthCity,
    } = marriageIntentionCert.requestInformation;
    return (
      <>
        {datePlaceOfBirth({
          partnerFlag: `A`,
          partnerDOB: new Date('2003/09/01'),
          birthCountryStr: partnerA_birthCountry,
          birthStateStr: partnerA_birthState,
          birthCityStr: partnerA_birthCity,
          handleChange,
          handleBirthplaceCountryChange,
          checkBirthCityForNeighborhood,
          handleBirthDateChange,
        })}
      </>
    );
  })
  .add('Step 2. Person 1 - Birth Date & Place, w/Country(USA)', () => {
    return (
      <>
        {datePlaceOfBirth({
          partnerFlag: `A`,
          partnerDOB: new Date('2003/09/01'),
          birthCountryStr: `USA`,
          birthStateStr: `MA`,
          birthCityStr: `Boston`,
          handleChange,
          handleBirthplaceCountryChange,
          checkBirthCityForNeighborhood,
          handleBirthDateChange,
        })}
      </>
    );
  })
  .add('Step 2. Person 1 - Birth Date & Place, w/Country(CAN)', () => {
    return (
      <>
        {datePlaceOfBirth({
          partnerFlag: `A`,
          partnerDOB: new Date('2003/09/01'),
          birthCountryStr: `CAN`,
          birthStateStr: `Québec`,
          birthCityStr: `Montreal`,
          handleChange,
          handleBirthplaceCountryChange,
          checkBirthCityForNeighborhood,
          handleBirthDateChange,
        })}
      </>
    );
  })
  .add('Step 2. Person 1 - Residende, City Hall', () => {
    return (
      <>
        {residence({
          partnerFlag: `A`,
          residenceZipStr: `02201`,
          residenceCityStr: `Boston`,
          residenceStateStr: `MA`,
          residenceAddressStr: `1 City Hall Square`,
          residenceCountryStr: `USA`,
          handleChange: handleChange,
          handleZipCodeChange: handleChange,
          replaceBosNeighborhoods: handleChange,
          handleResidenceStateChange: handleChange,
          handleResidenceCountryChange: handleChange,
        })}
      </>
    );
  })
  .add('Step 2. Person 1 - Marriage, Default', () => {
    return (
      <>
        {marriageBlock({
          partnerFlag: `A`,
          bloodRelation: `Yes`,
          bloodRelationDesc: `3rd Cousins`,
          marriedBefore: `Yes`,
          marriageNumb: `2nd`,
          lastMarriageStatus: `WID`,

          partnershipType: `CIV`,
          partnershipState: `MA`,
          partnershipTypeDissolved: `Yes`,

          handleChange: handleChange,
          handleBloodRelChange: handleChange,
          handleBloodRelDescChange: handleChange,
          handleMarriedBeforeChange: handleChange,
        })}
      </>
    );
  })
  .add('Step 5. Review/Person Info View', () => {
    const marriageIntentionCertificateRequest = makeMarriageIntentionCertificateRequest();
    const bckMethod = (val: boolean): any => {
      (() => console.log(`val: ${val}`))();
    };

    return (
      <PartnerView
        marriageIntentionCertificateRequest={
          marriageIntentionCertificateRequest
        }
        partnerLabel={'A'}
        firstName={`Thomas`}
        lastName={`Menino`}
        suffix={``}
        middleName={`Michael`}
        surName={`Menino`}
        dob={formatDate(new Date(`1933-01-01T00:00:00.000Z`))}
        age={`91`}
        occupation={`Mayor`}
        address={`
          ${`1 City Hall Plaza`},
          ${`Boston`}
          ${getStateFullName(`MA`)} 
          ${`02201-1020`} 
          ${getCountryFullName(`USA`)}
        `}
        birthCity={`Boston`}
        birthState={getStateFullName(`MA`)}
        birthCountry={getCountryFullName(`USA`)}
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
        backTrackingDisclaimer={false}
        toggleDisclaimerModal={bckMethod}
      />
    );
  })
  .add('Step 5. Review - Contact [Section]', () => {
    const bckMethod = (val: boolean): any => {
      (() => console.log(`val: ${val}`))();
    };

    return (
      <ContactUX
        appointmentDateTime={formatDate(new Date(`1982-09-23T00:00:00.000Z`))}
        requestInformation={{
          email: 'phillip.kelly@boston.gov',
          dayPhone: '6170001111',
        }}
        backTrackingDisclaimer={true}
        toggleDisclaimerModal={bckMethod}
      />
    );
  })
  .add('Tool-Tip', () => {
    const spacing = css(`margin-top: 4em;`);
    const elem = ToolTip({
      icon: '?',
      msg:
        'This information is collected to ensure the marriage abides by Massachusetts State Law Chapter 207 Sections 1-8.',
    });
    return (
      <div>
        <div>{elem}</div>
        <div css={spacing}>{elem}</div>
      </div>
    );
  });
