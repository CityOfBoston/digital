/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, MouseEvent } from 'react';
import QuestionComponent from '../components/QuestionComponent';
import { CurrentNameTag } from '../components/TagComponent';
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
}: ConfirmationProps) {
  const [selectedOption, setSelectedOption] = useState('UseNewEmail');
  const handleRadioChange = (value: string) => {
    setSelectedOption(value);
  };

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="sh sh-title" css={HEADER_CONTAINER_STYLING}>
        Chosen Name
      </div>
      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <div className="InfoBox" css={INFO_STYLING}>
            Changing your chosen name will affect your City of Boston accounts.
            <div css={CURRENT_NAME_CONTAINER_STYLING}>
              <div css={CURRENT_NAME_STYLING}>
                <CurrentNameTag />
                <div className="CurrentName">Juliana Donovan</div>
              </div>
              <a
                type="button"
                className="btn btn--b-sm btn-alt"
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
            allowProceed={true}
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
                <div css={EMAIL_TEXT_STYLING}>juliana.donovan@boston.gov</div>
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
  padding: '30px 60px',
  borderBottom: '1px solid #A9AEB1',
  '@media (max-width: 600px)': {
    padding: '25px 15px',
  },
});

const CURRENT_NAME_CONTAINER_STYLING = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: '20px',
});

const CURRENT_NAME_STYLING = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  padding: '15px 0px',
  marginTop: '20px',
  '.CurrentName': {
    marginTop: '10px',
    marginLeft: '50px',
    fontSize: '1.2em',
  },
  '@media (max-width: 600px)': {
    padding: '5px 0px',
    marginTop: '10px',
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
  fontSize: '1em',
  border: '2px solid #005EA2',
  flex: '0',
});

const RADIO_GROUP_STYLING = css({
  padding: '50px 60px',
  '@media (max-width: 600px)': {
    padding: '25px 15px',
  },
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

const RADIO_STACK_STYLING = css({
  cursor: 'pointer',
  padding: '10px 5px 20px 5px',
  border: '3px solid #A9AEB1',
});

const RADIO_SELECTED_STYLING = css({
  borderColor: '#005EA2',
  backgroundColor: '#D9E8F6',
});

const RADIO_OPTION_STYLING = css({
  alignItems: 'center',
  display: 'flex',
  gap: '12px',
  flexDirection: 'row',
});

const RADIO_LABEL_STYLING = css({
  fontWeight: 'bold',
});

const EMAIL_TEXT_STYLING = css({
  fontSize: '1em',
  color: '#555',
  wordBreak: 'break-all',
  overflowWrap: 'break-word',
  margin: '10px 50px 0px',
  '@media (max-width: 600px)': {
    margin: '10px 44px',
  },
});
