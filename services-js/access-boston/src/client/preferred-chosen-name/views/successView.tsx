/** @jsx jsx */

import { jsx } from '@emotion/core';
import { useEffect, useState } from 'react';

// import { Account } from '../../graphql/fetch-account';

//--- HTML Struct & Styling ---//
import QuestionComponent from '../../common/QuestionComponent';
import TextInput from '../../common/TextInput';
import { SectionHeader } from '@cityofboston/react-fleet';
import Section from '../components/section';
import {
  SECTION_STYLING,
  SECTIONHEADER_STYLING,
  SUBHEADER_STYLING,
  INSTRUCTIONS_STYLING,
  TEXTINPUT_STYLING,
} from '../styling';

interface account {
  cobAgency: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  handleProceed: any;
  handleStepBack: any;
  resetState: () => void;
  appTitle: string;
  handleQuit: any;
  account: account;
}

export default function SuccessView(props: Props) {
  const { handleProceed, handleStepBack, handleQuit, account } = props;
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

  const handle_stepBack = () => {
    return handleStepBack(value);
  };

  console.log(`successView: account: `, account);

  return (
    <QuestionComponent
      handleProceed={handle_proceed}
      handleStepBack={handle_stepBack}
      allowProceed={isComplete()}
      nextButtonText={'Save Changes'}
      handleQuit={handleQuit}
      quitBtn={true}
    >
      <Section css={SECTION_STYLING}>
        <SectionHeader
          title={`${props.appTitle}`}
          css={SECTIONHEADER_STYLING}
        />
        <div css={SUBHEADER_STYLING}>
          Success View [cobAgency: {account.cobAgency}]
        </div>

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
