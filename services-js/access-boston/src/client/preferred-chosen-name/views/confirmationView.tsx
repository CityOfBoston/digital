/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, MouseEvent } from 'react';
import QuestionComponent from '../components/QuestionComponent';
import { ChosenNameTag } from '../components/TagComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface Account {
  cobAgency: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ConfirmationProps {
  handleProceed: (ev: MouseEvent) => void;
  handleStepBack: (ev: MouseEvent) => void;
  appTitle: string;
  account: Account;
}

export default function ConfirmationView({
  handleProceed,
  handleStepBack,
  account,
}: ConfirmationProps) {
  // console.log(account);

  const [selectedOption, setSelectedOption] = useState('UseNewEmail');
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  const handleRadioChange = (value: string) => {
    setSelectedOption(value);
  };

  const toggleCheckbox = () => {
    setCheckboxChecked(!checkboxChecked);
  };

  // Enable the continue button only if an option is selected and the checkbox is checked
  const allowProceed =
    (selectedOption === 'UseNewEmail' ||
      selectedOption === 'KeepCurrentEmail') &&
    checkboxChecked;

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="sh sh-title" css={HEADER_CONTAINER_STYLING}>
        Chosen Name
      </div>
      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <div className="InfoBox" css={INFO_STYLING}>
            Changing your chosen name will affect your City of Boston accounts.
            <div css={CHOSEN_NAME_CONTAINER_STYLING}>
              <div css={CHOSEN_NAME_STYLING}>
                <ChosenNameTag />
                <div className="CurrentName">
                  {account.firstName} {account.lastName}
                </div>
              </div>
              <a
                type="button"
                className="btn btn--b-sm btn-alt btn--w"
                onClick={handleStepBack}
                css={EDIT_BUTTON_STYLING}
              >
                Edit
              </a>
            </div>
          </div>
          <QuestionComponent
            quitBtn={false}
            nextButtonText="Continue"
            allowProceed={allowProceed}
            handleStepBack={handleStepBack}
            handleProceed={handleProceed}
          >
            <div css={RADIO_GROUP_STYLING}>
              Select your preferred email option from the list below.
              <label
                css={[
                  RADIO_STACK_STYLING,
                  selectedOption === 'UseNewEmail' && RADIO_SELECTED_STYLING,
                ]}
              >
                <div css={RADIO_OPTION_STYLING}>
                  <input
                    id="radio[0]"
                    type="radio"
                    name="filters"
                    value="UseNewEmail"
                    className="ra-f"
                    checked={selectedOption === 'UseNewEmail'}
                    onChange={() => handleRadioChange('UseNewEmail')}
                  />
                  <strong css={RADIO_LABEL_STYLING}>Use new email</strong>
                </div>
                <div css={EMAIL_TEXT_STYLING}>Camila.donovan21@boston.gov</div>
              </label>
              <label
                css={[
                  RADIO_STACK_STYLING,
                  selectedOption === 'KeepCurrentEmail' &&
                    RADIO_SELECTED_STYLING,
                ]}
              >
                <div css={RADIO_OPTION_STYLING}>
                  <input
                    id="radio[1]"
                    type="radio"
                    name="filters"
                    value="KeepCurrentEmail"
                    className="ra-f"
                    checked={selectedOption === 'KeepCurrentEmail'}
                    onChange={() => handleRadioChange('KeepCurrentEmail')}
                  />
                  <strong css={RADIO_LABEL_STYLING}>Keep current email</strong>
                </div>
                <div css={EMAIL_TEXT_STYLING}>{account.email}</div>
              </label>
              <label css={CHECKBOX_LABEL_STYLING(checkboxChecked)}>
                <input
                  type="checkbox"
                  checked={checkboxChecked}
                  onChange={toggleCheckbox}
                  css={CHECKBOX_STYLING}
                />
                By submitting this form you agree to changing your displayed
                chosen name and email address across all your City of Boston
                accounts
              </label>
              <div>
                {' '}
                For more information, see the{' '}
                <a href="https://www.google.com" target="_blank">
                  FAQs
                </a>
              </div>
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
}

const CHECKBOX_STYLING = css({
  width: '50px',
  height: '50px',
});

const CHECKBOX_LABEL_STYLING = (checked: boolean) =>
  css({
    marginTop: '10px',
    color: checked ? 'inherit' : '#A9AEB1',
    display: 'flex',
    alignItems: 'start',
    gap: '12px',
    cursor: 'pointer',
  });

const HEADER_CONTAINER_STYLING = css({
  fontSize: '2em',
  paddingBottom: '20px',
  marginBottom: '30px',
  '@media (max-width: 600px)': {
    fontSize: '1.8em',
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
    marginLeft: '50px',
    fontSize: '1.2em',
  },
  '@media (max-width: 600px)': {
    '.CurrentName': {
      marginTop: '5px',
      marginLeft: '0px',
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
  padding: '30px 40px',
  '@media (max-width: 600px)': {
    padding: '25px 15px',
  },
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const RADIO_STACK_STYLING = css({
  cursor: 'pointer',
  padding: '15px 5px 20px 15px',
  border: '3px solid #A9AEB1',
  '@media (max-width: 600px)': {
    padding: '10px 0px 15px 10px',
    border: '2px solid #A9AEB1',
  },
});

const RADIO_SELECTED_STYLING = css({
  borderColor: '#005EA2',
  backgroundColor: '#D9E8F6',
});

const RADIO_OPTION_STYLING = css({
  alignItems: 'center',
  display: 'flex',
  gap: '20px',
  flexDirection: 'row',
  '@media (max-width: 600px)': {
    gap: '10px',
  },
});

const RADIO_LABEL_STYLING = css({
  fontWeight: 'bold',
});

const EMAIL_TEXT_STYLING = css({
  fontSize: '1em',
  wordBreak: 'break-all',
  overflowWrap: 'break-word',
  margin: '5px 56px 0px',
  '@media (max-width: 600px)': {
    margin: '10px 5px 0px 40px',
  },
});
