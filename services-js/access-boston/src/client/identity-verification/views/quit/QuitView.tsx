/** @jsx jsx */

import { css, jsx } from '@emotion/core';

// import { View } from '../types';

import { SectionHeader } from '@cityofboston/react-fleet';
import Section from '../../components/Section';

import QuestionComponent from '../../../../client/common/QuestionComponent';

interface Props {
  handleProceed: any;
  handleReset: any;
  handleQuit: any;
}

export default function SuccessView(props: Props) {
  const { handleProceed, handleQuit, handleReset } = props;

  return (
    <QuestionComponent
      handleProceed={handleProceed}
      handleReset={handleReset}
      allowProceed={true}
      nextButtonText={'Go Back'}
      quitBtn={true}
      handleQuit={handleQuit}
    >
      <Section css={CONTENT_STYLING}>
        <div css={LOGO_STYLING}>
          <img
            src={'https://assets.boston.gov/icons/dept_icons/access_boston.svg'}
            alt="Access Boston"
          />
        </div>

        <SectionHeader title="Quit Identity Verification Process" />
        <p css={PARAGRAPH_STYLING}>
          Are you sure you want to quit the Identify Verification Process?
        </p>

        <p css={PARAGRAPH_STYLING}>
          All unsaved changes will be lost and the process will have to be
          restarted.
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
    color: 'red',
  },
});

const PARAGRAPH_STYLING = css({
  margin: '0.25em 0 0',
});
