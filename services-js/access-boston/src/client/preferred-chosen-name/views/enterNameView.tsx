/** @jsx jsx */
import { jsx, css } from '@emotion/core';

// import fetch from 'node-fetch';

import { useState, MouseEvent } from 'react';
import QuestionComponent from '../components/QuestionComponent';
import { CurrentNameTag } from '../components/TagComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';
// import {
//   // preferredNameRequest,
//   preferredNameSubmit,
// } from '../../../server/services/preferredName';

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

export const EnterNameView = ({ handleProceed, account }: EnterNameProps) => {
  const { cobAgency } = account;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const allowProceed: boolean =
    firstName.trim() !== '' || lastName.trim() !== '';

  const handleClear = () => {
    setFirstName('');
    setLastName('');
  };
  const cobAgenciesAltWorkflows: Array<string> = ['BPL', 'BPHC'];
  const nextBtnStr: string = cobAgenciesAltWorkflows.includes(cobAgency)
    ? 'Submit'
    : 'Continue';

  // const advanceStepPreferredNameRequest = async (data: {
  //   id: string;
  //   preferredFirstName: string;
  //   preferredLastName: string;
  // }) => {
  //   const { id, preferredFirstName, preferredLastName } = data;
  //   return await fetch(`/preferred-name-request` as string, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({ id, preferredFirstName, preferredLastName }),
  //   })
  //     .then(response => response.json())
  //     .then(response => response)
  //     .catch(error => {
  //       console.log('/preferred-name Error(requestNewNameEmail):', error);
  //       return {};
  //     });
  // };

  // ----------------------------------- //
  // const retObj = preferredNameRequest({
  //   id: '40000093',
  //   preferredFirstName: 'Manuelo',
  //   preferredLastName: 'WebTest',
  // });
  // console.log(`advanceStepPreferredNameRequest ...: `, retObj);

  // ----------------------------------- //
  // const retObj = preferredNameSubmit({
  //   id: '40000093',
  //   preferredFirstName: 'Manuelo',
  //   preferredLastName: 'WebTest',
  //   email: 'manuel.webtest@boston.gov',
  // });
  // console.log(`advanceStepPreferredNameSubmit ...: `, retObj);
  // ----------------------------------- //

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
            nextButtonText={nextBtnStr}
            allowProceed={allowProceed}
            handleProceed={handleProceed}
            extraButtons={
              <a
                type="button"
                className="btn btn--b-sm btn-alt btn--w"
                onClick={handleClear}
              >
                Clear
              </a>
            }
          >
            <div className="FormBox" css={FORM_STYLING}>
              Use the fields below to update your chosen first name, last name,
              or both.
              <div
                className="ChosenFirstNameInput"
                css={INPUT_HEADER_CONTAINER_STYLING}
              >
                <label css={LABEL_STYLING}>Chosen First Name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  css={INPUT_STYLING}
                  placeholder="Default: Juliana"
                />
              </div>
              <div
                className="ChosenLastNameInput"
                css={INPUT_HEADER_CONTAINER_STYLING}
              >
                <label css={LABEL_STYLING}>Chosen Last Name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  css={INPUT_STYLING}
                  placeholder="Default: Donovan"
                />
              </div>
              For more information, see the{' '}
              <a href="https://www.google.com" target="_blank">
                FAQs
              </a>
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
};

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
  padding: '8px',
  fontSize: '1em',
  borderRadius: '0',
  border: '1px solid',
});
