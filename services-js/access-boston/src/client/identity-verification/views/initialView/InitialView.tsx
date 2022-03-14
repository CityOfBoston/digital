/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { SectionHeader } from '@cityofboston/react-fleet';
import Section from '../../components/Section';
import QuestionComponent from '../../../../client/common/QuestionComponent';

interface Props {
  handleProceed: () => void;
  resetState: () => void;
}

export default function InitialView(props: Props) {
  return (
    <QuestionComponent
      handleProceed={props.handleProceed}
      handleReset={() => console.log('handleReset.')}
      allowProceed={true}
      nextButtonText={'Begin Verification'}
    >
      <Section css={CONTENT_STYLING}>
        <div css={LOGO_STYLING}>
          <img
            src={'https://assets.boston.gov/icons/dept_icons/access_boston.svg'}
            alt="Access Boston"
          />
        </div>

        <SectionHeader title="Identity Verification Process" />
        <p>
          Welcome to Access Boston, the City of Boston's ID Verification
          Service.
        </p>

        <p>
          Please try to have the person go through the "Forgot Password"
          function before performing the "Identity Verification" process. Using
          this process means that not only will their password be reset, but any
          devices they had registered for Multi-Factor Authentication will be
          cleared from their account. At the end of this process, they will have
          to re-do the full Access Boston registration process.
        </p>
      </Section>
    </QuestionComponent>
  );
}

const LOGO_STYLING = css({
  display: 'flex',
  justifyContent: 'center',
  maxHeight: '150px',
  marginBottom: '2.25em',

  img: {
    height: '130px',
  },
});

const CONTENT_STYLING = css({
  p: {
    fontSize: '1.5em',
  },
});
