/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { MouseEvent } from 'react';
import QuestionComponent from '../components/QuestionComponent';
import { PREFERRED_NAME_STYLING } from '../styling/index';

interface Account {
  cobAgency: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface welcomeProps {
  handleProceed: (ev: MouseEvent) => void;
  appTitle: string;
  account: Account;
}

export default function WelcomeView({ handleProceed, account }: welcomeProps) {
  console.log(account)

  return (
    <div css={PREFERRED_NAME_STYLING}>
      <div className="BorderedAppWrapper">
        <div className="AppInnerContainer">
          <h2 className="headerBlock" css={HEADER_STYLING}></h2>
          <QuestionComponent
            quitBtn={false}
            nextButtonText="Continue"
            allowProceed={true}
            handleProceed={handleProceed}
          >
            <div css={SNIPPET_CONTAINER_STYLING}>
              <p>
                A chosen name could be a preferred nickname, middle name, a shortened version of a legal name, or a name that aligns with their gender identity or expression.
              </p>
              <ul>
                <strong>What’s Changing: </strong>
                <li>
                  <strong>Chosen Name: </strong>
                  You can add a chosen name to your profile. This name will be displayed in internal City of Boston systems and communications.
                </li>
                <li>
                  <strong>Email Address: </strong>
                  You can update your email address to reflect your chosen name—or keep it as is, if you prefer.
                </li>
              </ul>
              <ul>
                <strong>What’s Not Changing: </strong>
                <li>
                  <strong>Legal Name: </strong>
                  City Employees, your legal name used for tax documents (like W2s), paystubs, or other official legal documents will remain unchanged. To change your legal name, please follow the legal name link.
                </li>
              </ul>
              <p>
                 <strong>Please note: </strong>
                 Any changes made to your chosen name or email address will be reflected across all relevant systems and communications.
              </p>
            </div>
          </QuestionComponent>
        </div>
      </div>
    </div>
  );
}

const SNIPPET_CONTAINER_STYLING = css({
  lineHeight: '2rem !important',
  padding: '0 60px',
  '& > p, & > ul': {
    borderBottom: '1px solid #ccc',
    padding: '20px 0px',
    margin: '0px',
    '@media (max-width: 600px)': {
      lineHeight: '1.5rem  !important',
      padding: '25px 0px'
    },
  },
  '& > p:last-of-type': {
    borderBottom: 'none',
  },
  '& ul': {
    '& > strong': {
      display: 'block',
      marginBottom: '25px',
      '@media (max-width: 600px)': {
        marginBottom: '10px',
      },
    }
  },
  '& li': {
    marginLeft: '40px',
    marginBottom: '20px',
    listStyleType: 'disc',
    listStyle: 'outside',
    '@media (max-width: 600px)': {
       marginLeft: '20px',
       marginBottom: '10px',
    },
  },
  '@media (max-width: 600px)': {
    padding: '0px 15px'
  },
});

// Add CSS for changing header text on mobile
const HEADER_STYLING = css({
  '&::before': {
    content: '"Welcome to Chosen Name"',
    '@media (max-width: 600px)': {
      content: '"Chosen Name"',
    },
  }
});