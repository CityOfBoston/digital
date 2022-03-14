/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import Section from '../../components/Section';
import { SectionHeader } from '@cityofboston/react-fleet';
import QuestionComponent from '../../../../client/common/QuestionComponent';

interface Props {
  handleProceed: () => void;
}

export default function SuccessView(props: Props) {
  return (
    <QuestionComponent
      handleProceed={props.handleProceed}
      allowProceed={true}
      nextButtonText={'Restart Verification'}
    >
      <Section css={CONTENT_STYLING}>
        <div css={LOGO_STYLING}>
          <img
            src={'https://assets.boston.gov/icons/dept_icons/access_boston.svg'}
            alt="Access Boston"
          />
        </div>

        <SectionHeader title="Identity Verification Process" />
        <p css={ERROR_CONTENT_STYLING}>
          The identity verification process was unsuccessful.
        </p>

        <p css={PARAGRAPH_STYLING}>
          If the person is an <span css={BOLD_TEXT}>Employee</span>, please ask
          them to reach out to their Human Resources representative to confirm
          that their data is correct.
        </p>

        <p css={PARAGRAPH_STYLING}>
          If the person has a <span css={BOLD_TEXT}>Sponsored</span> account,
          please ask them to reach out to their Sponsor to confirm that their
          data is correct.
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

const ERROR_CONTENT_STYLING = css({
  color: '#FB4D42',
  fontWeight: 'bold',
  margin: '0.5em 0 0',
});

const BOLD_TEXT = css({
  fontWeight: 'bold',
  fontStyle: 'italic',
});

const PARAGRAPH_STYLING = css({
  margin: '1em 0 0',
});
