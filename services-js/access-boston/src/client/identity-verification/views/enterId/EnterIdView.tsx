/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { useEffect, useState } from 'react';

// import { View } from '../types';

import { SectionHeader } from '@cityofboston/react-fleet';
import Section from '../../components/Section';

import QuestionComponent from '../../../common/QuestionComponent';

import TextInput from '../../../common/TextInput';

interface Props {
  handleProceed: any;
  resetState: () => void;
  appTitle: string;
}

export default function EnterIdView(props: Props) {
  const { handleProceed } = props;
  const [query, setQuery] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeOutId = setTimeout(() => setValue(query), 300);
    return () => clearTimeout(timeOutId);
  }, [query]);

  const isComplete = () => {
    let retVal: boolean = false;

    if (value && value.length > 3) retVal = true;

    return retVal;
  };

  const handle_proceed = () => {
    return handleProceed(value);
  };

  return (
    <QuestionComponent
      handleProceed={handle_proceed}
      allowProceed={isComplete()}
      nextButtonText={'Next Step'}
    >
      <Section css={SECTION_STYLING}>
        <SectionHeader
          title={`${props.appTitle}`}
          css={SECTIONHEADER_STYLING}
        />
        <div css={SUBHEADER_STYLING}>Instructions</div>

        <div css={INSTRUCTIONS_STYLING}>
          Please enter the Employee ID or User ID number of the person to be
          verified.
        </div>

        <div css={TEXTINPUT_STYLING}>
          <TextInput
            label="Employee/User ID"
            required
            requiredlabelasterisk={true}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </Section>
    </QuestionComponent>
  );
}

const SECTION_STYLING = css({
  color: 'black',
});

const SECTIONHEADER_STYLING = css({
  marginBottom: '3em',
});

const SUBHEADER_STYLING = css({
  color: 'black',
  fontSize: '20px',
  fontWeight: 'bold',
  fontFamily: 'Montserrat',
  textTransform: 'uppercase',
});

const INSTRUCTIONS_STYLING = css({
  fontSize: '15px',
  fontFamily: 'Lora',
  color: 'black',
  marginBottom: '1.5em',
});

const TEXTINPUT_STYLING = css({
  color: 'red',
  '.txt label span.t--req': {
    color: '#fb4d42',
    marginLeft: '1em',
  },
});
