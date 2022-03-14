/** @jsx jsx */

import { css, jsx } from '@emotion/core';

// import { View } from '../types';

import { SectionHeader } from '@cityofboston/react-fleet';
import Section from '../../components/Section';

import QuestionComponent from '../../../../client/common/QuestionComponent';

interface Props {
  handleProceed: () => void;
}

export default function SuccessView(props: Props) {
  return (
    <QuestionComponent
      handleProceed={props.handleProceed}
      allowProceed={true}
      nextButtonText={'Go to Homepage'}
    >
      <Section css={CONTENT_STYLING}>
        <div css={LOGO_STYLING}>
          <img
            src={'https://assets.boston.gov/icons/dept_icons/access_boston.svg'}
            alt="Access Boston"
          />
        </div>

        <SectionHeader title="Identity Verification Process" />
        <p css={SUCCESS_CONTENT_STYLING}>
          The identity verification process was successful.
        </p>

        <p>Please proceed with password reset activities.</p>
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

const SUCCESS_CONTENT_STYLING = css({
  color: '#56A958',
  fontWeight: 'bold',
  margin: '0.5em 0 0',
});
