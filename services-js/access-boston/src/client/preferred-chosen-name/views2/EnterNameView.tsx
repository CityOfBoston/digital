/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState } from 'react';

import { CommonAttributes } from '../types';

import QuestionComponent from '../components/QuestionComponent';
import { CurrentNameTag } from '../components/TagComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface EnterNameProps {
  handleProceed: (data: { Id: string; FName: string; LName: string }) => void;
  handleSubmit?: (data: { Id: string; FName: string; LName: string }) => void;
  handleStepBack: () => void;
  state: CommonAttributes;
}

export const EnterNameView2 = ({
  handleProceed,
  handleSubmit,
  handleStepBack,
  state,
}: EnterNameProps) => {
  const {
    altWorkflow,
    firstName,
    lastName,
    chosenFirstName,
    chosenLastName,
    loading,
  } = state;
  const [FName, setFirstName] = useState(chosenFirstName);
  const [LName, setLastName] = useState(chosenLastName);
  const nextBtnStr: string = altWorkflow ? 'Submit' : 'Continue';
  const allowProceed: boolean = FName.trim() !== '' || LName.trim() !== '';

  const handle_proceed = () => {
    const { employeeId } = state;
    const subObj = { Id: employeeId, FName, LName };

    if (state.altWorkflow && handleSubmit) {
      handleSubmit(subObj);
    } else {
      handleProceed(subObj);
    }
  };

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="sh sh-title" css={HEADER_CONTAINER_STYLING}>
        Update Chosen Name
      </div>

      <div className={'AddBorderTop'}>
        <div className="BorderedAppWrapper">
          <div className="AppInnerContainer">
            <div className="InfoBox" css={INFO_STYLING}>
              Changing your chosen name will affect your City of Boston
              accounts.
              <div className="CurrentNameContainer" css={CURRENT_NAME_STYLING}>
                <CurrentNameTag />
                <div className="CurrentName">
                  {firstName} {lastName}
                </div>
              </div>
            </div>
            <QuestionComponent
              quitBtn={false}
              nextButtonText={nextBtnStr}
              allowProceed={allowProceed}
              handleProceed={handle_proceed}
              handleStepBack={handleStepBack}
              prevBtnText={`Back`}
              useLoadingSpinner={true}
              loading={loading}
            >
              <div className="FormBox" css={FORM_STYLING}>
                Use the fields below to update your chosen first name, last
                name, or both.
                <div
                  className="ChosenFirstNameInput"
                  css={INPUT_HEADER_CONTAINER_STYLING}
                >
                  <label css={LABEL_STYLING}>Chosen First Name</label>
                  <input
                    value={FName}
                    onChange={e => setFirstName(e.target.value)}
                    css={INPUT_STYLING}
                    tabIndex={0}
                    title={`Enter your Chosen First Name`}
                    alt={`Enter your Chosen First Name`}
                  />
                </div>
                <div
                  className="ChosenLastNameInput"
                  css={INPUT_HEADER_CONTAINER_STYLING}
                >
                  <label css={LABEL_STYLING}>Chosen Last Name</label>
                  <input
                    value={LName}
                    onChange={e => setLastName(e.target.value)}
                    css={INPUT_STYLING}
                    tabIndex={0}
                    title={`Enter your Chosen Last Name`}
                    alt={`Enter your Chosen Last Name`}
                  />
                </div>
                For more information, see the{' '}
                <a href="https://www.google.com" target="_blank">
                  Chosen Name Support Documentation
                </a>
              </div>
            </QuestionComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

const HEADER_CONTAINER_STYLING = css({
  fontSize: '32px',
  paddingBottom: '20px',
  marginBottom: '30px',

  '@media (max-width: 600px)': {
    fontSize: '1.375em',
    paddingBottom: '15px',
    marginBottom: '25px',
  },
});

const INFO_STYLING = css({
  padding: '30px 40px',
  borderBottom: '1px solid #A9AEB1',

  '@media (max-width: 600px)': {
    padding: '25px 15px',
  },
});

const FORM_STYLING = css({
  padding: '30px 40px',

  '@media (max-width: 600px)': {
    padding: '25px 15px',
  },
});

const CURRENT_NAME_STYLING = css({
  paddingTop: '15px',
  marginTop: '20px',

  '.CurrentName': {
    marginTop: '10px',
    marginLeft: '1.5em',
    fontSize: '1.2em',
  },

  '@media (max-width: 600px)': {
    padding: '5px 0px',
    // marginTop: '10px',

    '.CurrentName': {
      marginTop: '5px',
      fontSize: '1.2em',
    },
  },
});

const LABEL_STYLING = css({
  fontWeight: 'bold',
  display: 'block',
  marginBottom: '8px',

  '@media (max-width: 600px)': {
    fontSize: '16px',
  },
});

const INPUT_HEADER_CONTAINER_STYLING = css({
  margin: '20px 0px',
});

const INPUT_STYLING = css({
  width: '100%',
  padding: '10px',
  fontSize: '16px',
  fontFamily: 'Lora',
  lineHeight: 'inherit',
  borderRadius: '0',
  border: '1px solid',
});
