/** @jsx jsx */

import { css, jsx } from '@emotion/core';

import { SectionHeader, MemorableDateInput } from '@cityofboston/react-fleet';
import Section from '../../components/Section';

import QuestionComponent from '../../../common/QuestionComponent';

import TextInput from '../../../common/TextInput';

interface Props {
  handleProceed: () => void;
  handleStepBack: () => void;
  resetState: () => void;
  handleQuit?: any;
  state: any;
  ssn: string;
  dob: string;
  appTitle: string;
}

export default function ReviewView(props: Props) {
  const { handleProceed, handleStepBack, handleQuit, state, ssn, dob } = props;

  const isComplete = () => {
    let retVal: boolean = true;

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
      handleReset={() => {}}
      allowProceed={isComplete()}
      nextButtonText={'Submit'}
      squareStyleBackBtn={true}
      handleQuit={handleQuit}
      quitBtn={true}
    >
      <Section css={SECTION_STYLING}>
        <SectionHeader
          title={`${props.appTitle}`}
          css={SECTIONHEADER_STYLING}
        />
        <div css={SUBHEADER_STYLING}>Review Details</div>

        <div css={VALIDATE_STYLING}>
          Please review the details below with the person to confirm.
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
              initialDate={new Date(dob)}
              componentId="dob"
              onlyAllowPast={true}
              handleDate={() => {}}
              disabled={true}
            />
          )}

          {state.employeeType === 'EMPLOYEE' && (
            <TextInput
              label={verifyInputLabel}
              required
              requiredlabelasterisk={true}
              value={ssn}
              disabled={true}
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
