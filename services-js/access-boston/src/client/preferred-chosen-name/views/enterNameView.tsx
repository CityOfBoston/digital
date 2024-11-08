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

interface EnterNameProps {
  handleProceed: (ev: MouseEvent) => void;
  appTitle: string;
  account: Account;
}

export default function EnterNameProps({ handleProceed, account }: EnterNameProps) {
  console.log(account);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleClear = () => {
    setFirstName('');
    setLastName('');
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
            <div className="CurrentNameContainer" css={CURRENT_NAME_STYLING}>
              <CurrentNameTag />
              <div className="CurrentName">Juliana Donovan</div>
            </div>
          </div>
          <QuestionComponent
            quitBtn={false}
            nextButtonText="Continue"
            allowProceed={true}
            handleProceed={handleProceed}
            extraButtons={
              <a
                type="button"
                className="btn btn--b-sm btn-alt"
                onClick={handleClear}
              >
                Clear
              </a>
            }>
            <div className="FormBox" css={FORM_STYLING}>
              Use the below fields to update your chosen name. You can choose to change your first name, last name, or both.
              <div className="ChosenFirstNameInput" css={INPUT_HEADER_CONTAINER_STYLING}>
                <label css={LABEL_STYLING}>Chosen First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  css={INPUT_STYLING}
                />
              </div>
              <div className="ChosenLastNameInput" css={INPUT_HEADER_CONTAINER_STYLING}>
                <label css={LABEL_STYLING}>Chosen Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  css={INPUT_STYLING}
                />
              </div>
              For more information, see the FAQs
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
}

const HEADER_CONTAINER_STYLING = css({
	fontSize: "2em",
	paddingBottom: "20px",
	marginBottom: "30px",
	'@media (max-width: 600px)': {
		fontSize: "1.8em",
		paddingBottom: "15px",
    marginBottom: "25px",
  },
});

const INFO_STYLING = css({
  padding: '30px 60px',
  borderBottom: '1px solid #A9AEB1',
	'@media (max-width: 600px)': {
    padding: '25px 15px'
  },
});

const FORM_STYLING = css({
  padding: '50px 60px',
	'@media (max-width: 600px)': {
    padding: '25px 15px'
  },
});

const CURRENT_NAME_STYLING = css({
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

const LABEL_STYLING = css({
  fontFamily: 'SourceSansPro, sans-serif',
  display: 'block',
  fontSize: '22px',
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
  padding: '8px',
  fontSize: '1em',
  borderRadius: '0',
  border: '1px solid',
});