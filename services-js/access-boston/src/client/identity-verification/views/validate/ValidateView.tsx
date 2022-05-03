/** @jsx jsx */

import { css, jsx } from '@emotion/core';
import { useEffect, useState } from 'react';

// import { View } from '../types';

import { SectionHeader, MemorableDateInput } from '@cityofboston/react-fleet';
import Section from '../../components/Section';

import QuestionComponent from '../../../common/QuestionComponent';

import TextInput from '../../../common/TextInput';

import { isDateObj, formatDate, fixUTCDate } from '../../helpers';

interface Props {
  handleProceed: () => void;
  handleStepBack: () => void;
  resetState: () => void;
  handleQuit: any;
  state: any;
  ssn: string;
  dob: string;
  updateSnn: any;
  updateDob: any;
  appTitle: string;
}

export default function ValidateView(props: Props) {
  const {
    handleProceed,
    handleStepBack,
    state,
    updateSnn,
    updateDob,
    handleQuit,
  } = props;
  const [query, setQuery] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeOutId = setTimeout(() => setValue(query), 300);
    return () => clearTimeout(timeOutId);
  }, [query]);

  const handleDateChange = (newDate): void => {
    const isDate = isDateObj(newDate);

    if (isDate) {
      setValue(formatDate(fixUTCDate(newDate)));
    }
  };

  const isComplete = () => {
    let retVal: boolean = false;

    if (value && value.length > 3) retVal = true;

    if (state.employeeType === 'EMPLOYEE' && value && value.length === 4) {
      retVal = true;
      updateSnn(value);
    } else {
      if (isDateObj(new Date(value))) {
        retVal = true;
        updateDob(value);
      }
    }

    return retVal;
  };

  const employeeLabel = 'Last 4 Digits of the SSN';
  const contractorLabel = 'Data of Birth (MM/DD/YYYY)';
  const verifyInputLabel =
    state.employeeType === 'EMPLOYEE' ? employeeLabel : contractorLabel;

  return (
    <QuestionComponent
      handleProceed={handleProceed}
      handleStepBack={handleStepBack}
      allowProceed={isComplete()}
      nextButtonText={'Next Step'}
      squareStyleBackBtn={true}
      quitBtn={true}
      handleQuit={handleQuit}
    >
      <Section css={SECTION_STYLING}>
        <SectionHeader
          title={`${props.appTitle}`}
          css={SECTIONHEADER_STYLING}
        />
        <div css={SUBHEADER_STYLING}>Validate Employee ID</div>

        <div css={VALIDATE_STYLING}>
          Please validate the Employee ID, First Name, Last Name, and enter the
          last four digits of SSN.
        </div>

        <div css={TEXTINPUT_STYLING}>
          <TextInput
            label="Employee/User ID"
            disabled
            value={state.employeeId}
          />
          <TextInput label="First Name" disabled value={state.fname} />
          <TextInput label="Last Name" disabled value={state.lname} />

          {/* --------------------------------- */}
          {state.employeeType !== 'EMPLOYEE' && (
            <MemorableDateInput
              hideLengend={true}
              legend={verifyInputLabel}
              // initialDate={new Date(state.dob) || undefined}
              componentId="dob"
              onlyAllowPast={true}
              handleDate={handleDateChange}
            />
          )}

          {state.employeeType === 'EMPLOYEE' && (
            <TextInput
              label={verifyInputLabel}
              required
              requiredlabelasterisk={true}
              onChange={e => setQuery(e.target.value)}
            />
          )}
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

const VALIDATE_STYLING = css({
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
  'input:disabled': {
    background: '#E9E9E9 0% 0% no-repeat padding-box',
  },
});
