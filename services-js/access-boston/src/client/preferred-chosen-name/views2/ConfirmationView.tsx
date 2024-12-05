/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, MouseEvent } from 'react';

import { CommonAttributes } from '../types';

import QuestionComponent from '../components/QuestionComponent';
import { ChosenNameTag } from '../components/TagComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface props {
  handleProceed: (data: { Id: string; FName: string; LName: string }) => void;
  handleStepBack: (ev: MouseEvent) => void;
  handleUseNewEmailToogle: () => void;
  state: CommonAttributes;
}

export const ConfirmationView2 = ({
  handleProceed,
  handleStepBack,
  handleUseNewEmailToogle,
  state,
}: props) => {
  // const [selectedOption, setSelectedOption] = useState(state.useNewEmail);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const {
    firstName,
    lastName,
    chosenFirstName,
    chosenLastName,
    newEmail,
    useNewEmail,
  } = state;

  const FName =
    chosenFirstName && chosenFirstName.length > 0 ? chosenFirstName : firstName;
  const LName =
    chosenLastName && chosenLastName.length > 0 ? chosenLastName : lastName;

  const handleRadioChange = () => {
    handleUseNewEmailToogle();
  };

  const toggleCheckbox = () => {
    setCheckboxChecked(!checkboxChecked);
  };

  // Enable the continue button only if an option is selected and the checkbox is checked
  const allowProceed = checkboxChecked;

  const handle_proceed = () => {
    let subObj = {
      Id: state.employeeId,
      FName: FName,
      LName: LName,
    };
    if (
      useNewEmail &&
      newEmail &&
      typeof newEmail === 'string' &&
      newEmail.length > 0
    )
      subObj['Email'] = state.newEmail;

    handleProceed(subObj);
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
              <div css={CHOSEN_NAME_CONTAINER_STYLING}>
                <div css={CHOSEN_NAME_STYLING}>
                  <ChosenNameTag />
                  <div className="CurrentName">
                    {FName} {LName}
                  </div>
                </div>
                <a
                  type="button"
                  className="btn btn--b-sm btn-alt btn--w"
                  onClick={handleStepBack}
                  css={EDIT_BUTTON_STYLING}
                  tabIndex={0}
                >
                  Edit
                </a>
              </div>
            </div>
            <QuestionComponent
              quitBtn={false}
              nextButtonText="Submit"
              allowProceed={allowProceed}
              handleStepBack={handleStepBack}
              handleProceed={handle_proceed}
              useLoadingSpinner={true}
              loading={state.loading}
            >
              <div css={RADIO_GROUP_STYLING}>
                Select your preferred email option from the list below.
                <label
                  css={[
                    RADIO_STACK_STYLING,
                    useNewEmail && RADIO_SELECTED_STYLING,
                  ]}
                >
                  <div css={RADIO_OPTION_STYLING}>
                    <input
                      id="radio[0]"
                      type="radio"
                      name="filters"
                      value="useNewEmail"
                      className="ra-f"
                      checked={useNewEmail}
                      onChange={() => handleRadioChange()}
                      title={`Use new email`}
                      alt={`Use new email`}
                    />
                    <strong css={RADIO_LABEL_STYLING}>Use new email</strong>
                  </div>
                  <div css={EMAIL_TEXT_STYLING}>{state.newEmail}</div>
                </label>
                <label
                  tabIndex={0}
                  css={[
                    RADIO_STACK_STYLING,
                    !useNewEmail && RADIO_SELECTED_STYLING,
                  ]}
                >
                  <div css={RADIO_OPTION_STYLING}>
                    <input
                      id="radio[1]"
                      type="radio"
                      name="filters"
                      value="KeepCurrentEmail"
                      className="ra-f"
                      checked={!useNewEmail}
                      onChange={() => handleRadioChange()}
                      title={`Keep current email`}
                      alt={`Keep current email`}
                    />
                    <strong css={RADIO_LABEL_STYLING}>
                      Keep current email
                    </strong>
                  </div>
                  <div css={EMAIL_TEXT_STYLING}>{state.email}</div>
                </label>
                <label css={CHECKBOX_LABEL_STYLING()}>
                  <input
                    type="checkbox"
                    checked={checkboxChecked}
                    onChange={toggleCheckbox}
                    css={CHECKBOX_STYLING}
                    alt={`By submitting this form you agree to changing your displayed
                  chosen name and email address across all your City of Boston
                  accounts`}
                    title={`By submitting this form you agree to changing your displayed
                  chosen name and email address across all your City of Boston
                  accounts`}
                  />
                  By submitting this form you agree to updating your chosen
                  name, or chosen name and email, across City of Boston accounts
                </label>
                <div>
                  {' '}
                  For more information, see the{' '}
                  <a
                    href="https://www.google.com"
                    target="_blank"
                    title={`Chosen Name Support Documentation`}
                  >
                    Chosen Name Support Documentation
                  </a>
                </div>
              </div>
            </QuestionComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationView2;

const CHECKBOX_STYLING = css({
  width: '34.3px',
  height: '20px',
});

const CHECKBOX_LABEL_STYLING = () =>
  css({
    display: 'flex',
    alignItems: 'self-start',
    marginTop: '10px',
    gap: '8px',
    cursor: 'pointer',
  });

const HEADER_CONTAINER_STYLING = css({
  fontSize: '2em',
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

const CHOSEN_NAME_CONTAINER_STYLING = css({
  display: 'flex',
  marginTop: '20px',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
});

const CHOSEN_NAME_STYLING = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',

  '.CurrentName': {
    marginTop: '10px',
    marginLeft: '1.5em',
    fontSize: '1.2em',
  },

  '@media (max-width: 600px)': {
    '.CurrentName': {
      marginTop: '5px',
      fontSize: '1.2em',
    },
  },
});

const EDIT_BUTTON_STYLING = css({
  color: '#005EA2',
  backgroundColor: 'white',
  padding: '10px 20px',
  border: '2px solid #005EA2',
  flex: '0',
  height: 'auto',
});

const RADIO_GROUP_STYLING = css({
  display: 'flex',
  flexDirection: 'column',
  padding: '30px 40px',
  gap: '8px',

  '@media (max-width: 600px)': {
    padding: '25px 15px',
  },
});

const RADIO_STACK_STYLING = css({
  cursor: 'pointer',
  padding: '15px 5px 10px 15px',
  border: '3px solid #A9AEB1',

  ':focus-visible': {
    outlineColor: '#005EA2',
  },

  '@media (max-width: 600px)': {
    padding: '10px 0px 10px 10px',
    border: '2px solid #A9AEB1',
  },
});

const RADIO_SELECTED_STYLING = css({
  borderColor: '#005EA2',
  backgroundColor: '#D9E8F6',

  ':focus-visible': {
    outlineColor: 'red',
  },
});

const RADIO_OPTION_STYLING = css({
  alignItems: 'center',
  display: 'flex',
  gap: '8px',
  flexDirection: 'row',
  '@media (max-width: 600px)': {
    gap: '10px',
  },

  '.ra-f': {
    width: '20px',
    height: '20px',

    '&:before': {
      width: '20px',
      height: '20px',
      borderColor: '#005EA2',
    },

    '&:checked:before': {
      boxShadow: 'inset 0 0 0 2px #fff',
    },
  },
});

const RADIO_LABEL_STYLING = css({
  fontWeight: 'bold',
});

const EMAIL_TEXT_STYLING = css({
  fontSize: '1em',
  wordBreak: 'break-all',
  overflowWrap: 'break-word',
  margin: '5px 1.8em 0px',

  '@media (max-width: 600px)': {
    margin: '10px 5px 0px 30px',
  },
});
